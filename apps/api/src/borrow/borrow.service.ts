import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BorrowService {
  constructor(private prisma: PrismaService) {}

  async borrowBook(userId: string, bookId: number) {
    // 1. Verify book exists and has stock
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        borrowRecords: {
          where: { userId, status: 'BORROWED' },
        },
      },
    });

    if (!book || book.deletedAt) {
      throw new NotFoundException('Book not found in the catalog');
    }

    if (book.stockAvailable <= 0) {
      throw new ConflictException(
        'This book is currently out of stock. Please check back later or place a reservation.',
      );
    }

    // 2. Prevent checking out the same book copy twice simultaneously
    if (book.borrowRecords.length > 0) {
      throw new ConflictException(
        'You have already checked out a copy of this book and have not returned it yet.',
      );
    }

    // 3. Perform borrow check-out in a secure database transaction
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14-day standard loan period

    return this.prisma.$transaction(async (tx) => {
      // Re-check the active loan in the same transaction. The earlier lookup
      // improves the common error path, while this prevents two concurrent
      // requests from checking out the same title twice for one reader.
      const activeLoan = await tx.borrowRecord.findFirst({
        where: { userId, bookId, status: 'BORROWED' },
      });
      if (activeLoan) {
        throw new ConflictException('You have already checked out a copy of this book and have not returned it yet.');
      }

      // Update conditionally rather than decrementing blindly. `count === 0`
      // means another transaction consumed the last available copy first.
      const stockUpdate = await tx.book.updateMany({
        where: { id: bookId, deletedAt: null, stockAvailable: { gt: 0 } },
        data: { stockAvailable: { decrement: 1 } },
      });
      if (stockUpdate.count !== 1) {
        throw new ConflictException('This book is currently out of stock. Please check back later or place a reservation.');
      }

      // Create borrow record
      const record = await tx.borrowRecord.create({
        data: {
          userId,
          bookId,
          borrowDate: new Date(),
          dueDate,
          status: 'BORROWED',
        },
        include: {
          book: true,
        },
      });

      // Get Reader Info
      const reader = await tx.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true },
      });
      const readerName = reader ? `${reader.firstName} ${reader.lastName || ''} (${reader.email})` : 'A reader';

      // Find all admin and librarian users
      const admins = await tx.user.findMany({
        where: {
          role: {
            name: {
              in: ['ADMIN', 'LIBRARIAN'],
            },
          },
        },
        select: { id: true },
      });

      // Create notification for reader
      await tx.notification.create({
        data: {
          userId,
          type: 'BORROW',
          title: 'Book Borrowed Successfully',
          message: `You have successfully borrowed "${record.book.title}". Due date is ${dueDate.toLocaleDateString('en-US', { dateStyle: 'medium' })}.`,
        },
      });

      // Create notifications for all admins & librarians
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            type: 'BORROW',
            title: 'New Book Loan Registered',
            message: `${readerName} has borrowed "${record.book.title}". Due date: ${dueDate.toLocaleDateString('en-US', { dateStyle: 'medium' })}.`,
          },
        });
      }

      return record;
    });
  }

  async returnBook(userId: string, recordId: number, isAdmin: boolean) {
    // 1. Verify borrow record exists
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id: recordId },
      include: { book: true },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.status === 'RETURNED') {
      throw new ConflictException('This book copy has already been marked as returned.');
    }

    // 2. Security validation: Only admins can return other readers' books
    if (!isAdmin && record.userId !== userId) {
      throw new ForbiddenException('You are not authorized to return this book.');
    }

    // 3. Process check-in transaction
    return this.prisma.$transaction(async (tx) => {
      // Close only an active record. This protects stock from being incremented
      // twice when two return requests arrive concurrently.
      const returnUpdate = await tx.borrowRecord.updateMany({
        where: { id: recordId, status: 'BORROWED' },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
        },
      });
      if (returnUpdate.count !== 1) {
        throw new ConflictException('This book copy has already been marked as returned.');
      }

      await tx.book.update({
        where: { id: record.bookId },
        data: { stockAvailable: { increment: 1 } },
      });

      const updatedRecord = await tx.borrowRecord.findUniqueOrThrow({
        where: { id: recordId },
      });

      // Get Reader Info
      const reader = await tx.user.findUnique({
        where: { id: record.userId },
        select: { firstName: true, lastName: true, email: true },
      });
      const readerName = reader ? `${reader.firstName} ${reader.lastName || ''} (${reader.email})` : 'A reader';

      // Find all admin and librarian users
      const admins = await tx.user.findMany({
        where: {
          role: {
            name: {
              in: ['ADMIN', 'LIBRARIAN'],
            },
          },
        },
        select: { id: true },
      });

      // Create notification for user
      await tx.notification.create({
        data: {
          userId: record.userId,
          type: 'RETURN',
          title: 'Book Returned Successfully',
          message: `The book "${record.book.title}" has been successfully returned and checked in.`,
        },
      });

      // Create notifications for all admins & librarians
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            type: 'RETURN',
            title: 'Book Checked In / Returned',
            message: `The book "${record.book.title}" borrowed by ${readerName} has been successfully returned and checked in.`,
          },
        });
      }

      return updatedRecord;
    });
  }

  async extendLoan(userId: string, recordId: number) {
    // 1. Verify borrow record exists and is active
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.status === 'RETURNED') {
      throw new ConflictException('Returned book loans cannot be extended.');
    }

    if (record.userId !== userId) {
      throw new ForbiddenException('You can only extend your own active book loans.');
    }

    // 2. Validate loan extension caps (maximum 2 extensions allowed)
    if (record.extendedCount >= 2) {
      throw new ConflictException(
          'You have reached the maximum extension limit (2 times) for this book loan.',
      );
    }

    // 3. Calculate new due date (adds 7 days extension)
    const newDueDate = new Date(record.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);

    const extensionUpdate = await this.prisma.borrowRecord.updateMany({
      where: { id: recordId, userId, status: 'BORROWED', extendedCount: { lt: 2 } },
      data: {
        dueDate: newDueDate,
        extendedCount: { increment: 1 },
      },
    });
    if (extensionUpdate.count !== 1) {
      throw new ConflictException('This loan can no longer be extended. Refresh your loan list and try again.');
    }

    const updatedRecord = await this.prisma.borrowRecord.findUniqueOrThrow({
      where: { id: recordId },
      include: { book: true },
    });

    // Get Reader Info
    const reader = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });
    const readerName = reader ? `${reader.firstName} ${reader.lastName || ''} (${reader.email})` : 'A reader';

    // Find all admin and librarian users
    const admins = await this.prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['ADMIN', 'LIBRARIAN'],
          },
        },
      },
      select: { id: true },
    });

    // Create notification for reader
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'EXTENSION',
        title: 'Loan Extended Successfully',
        message: `Your loan extension for "${updatedRecord.book.title}" was approved. New due date is ${newDueDate.toLocaleDateString('en-US', { dateStyle: 'medium' })}.`,
      },
    });

    // Create notifications for all admins & librarians
    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'EXTENSION',
          title: 'Loan Extension Approved',
          message: `The loan of "${updatedRecord.book.title}" for ${readerName} has been extended. New due date: ${newDueDate.toLocaleDateString('en-US', { dateStyle: 'medium' })}.`,
        },
      });
    }

    return updatedRecord;
  }

  async getMyLoans(userId: string) {
    return this.prisma.borrowRecord.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
      orderBy: { borrowDate: 'desc' },
    });
  }

  async getAllLoans() {
    return this.prisma.borrowRecord.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
      orderBy: { borrowDate: 'desc' },
    });
  }
}
