import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateCategoryDto } from '@/books/dto/create-category.dto';
import { CreateBookDto } from '@/books/dto/create-book.dto';
import { UpdateBookDto } from '@/books/dto/update-book.dto';
import { BookQueryDto } from '@/books/dto/book-query.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // CATEGORIES LOGIC
  // ==========================================

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(`Category "${createCategoryDto.name}" already exists`);
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { books: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.books.length > 0) {
      throw new ConflictException(
        'Cannot delete category containing active book items. Reassign books first.',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  // ==========================================
  // BOOKS LOGIC
  // ==========================================

  async createBook(createBookDto: CreateBookDto) {
    // 1. Verify category exists
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: createBookDto.categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${createBookDto.categoryId} not found`);
    }

    // 2. Verify ISBN uniqueness
    if (createBookDto.isbn) {
      const existingIsbn = await this.prisma.book.findUnique({
        where: { isbn: createBookDto.isbn },
      });
      if (existingIsbn) {
        throw new ConflictException(`Book with ISBN "${createBookDto.isbn}" already exists`);
      }
    }

    // 3. Create the book with stockAvailable initialized to stockTotal
    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn,
        description: createBookDto.description,
        stockTotal: createBookDto.stockTotal,
        stockAvailable: createBookDto.stockTotal, // initially all books are available
        categoryId: createBookDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAllBooks(query: BookQueryDto) {
    const { search, categoryId, page, limit, availableOnly } = query;
    const whereClause: any = {
      deletedAt: null,
    };

    if (categoryId !== undefined) {
      whereClause.categoryId = categoryId;
    }

    if (availableOnly === 'true') {
      whereClause.stockAvailable = { gt: 0 };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      const [books, total] = await Promise.all([
        this.prisma.book.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { title: 'asc' },
        }),
        this.prisma.book.count({ where: whereClause }),
      ]);

      return {
        data: books,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      } as any;
    }

    return this.prisma.book.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOneBook(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!book || book.deletedAt) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async updateBook(id: number, updateBookDto: UpdateBookDto) {
    // 1. Get the current book
    const currentBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!currentBook) {
      throw new NotFoundException('Book not found');
    }

    // 2. Handle category validation
    if (updateBookDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: updateBookDto.categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${updateBookDto.categoryId} not found`);
      }
    }

    // 3. Calculate stock values
    let stockTotal = currentBook.stockTotal;
    let stockAvailable = currentBook.stockAvailable;

    if (updateBookDto.stockTotal !== undefined) {
      const diff = updateBookDto.stockTotal - currentBook.stockTotal;
      stockTotal = updateBookDto.stockTotal;
      stockAvailable = currentBook.stockAvailable + diff;

      if (stockAvailable < 0) {
        throw new ConflictException(
          'Total stock cannot be reduced below the number of currently borrowed items.',
        );
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        title: updateBookDto.title,
        author: updateBookDto.author,
        isbn: updateBookDto.isbn,
        description: updateBookDto.description,
        stockTotal,
        stockAvailable,
        categoryId: updateBookDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async deleteBook(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        borrowRecords: {
          where: { status: 'BORROWED' },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Hard block if there are outstanding borrowed copies
    if (book.borrowRecords.length > 0) {
      throw new ConflictException(
        `Cannot delete book. There are currently ${book.borrowRecords.length} borrowed copy/copies.`,
      );
    }

    // Soft delete to protect relational historical borrow records
    return this.prisma.book.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        stockAvailable: 0,
      },
    });
  }
}
