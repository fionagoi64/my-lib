import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BorrowService } from '@/borrow/borrow.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@ApiTags('Borrow Operations')
@Controller('borrow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post(':bookId')
  @ApiOperation({
    summary: 'Borrow a book copy',
    description: 'Places a book loan, automatically decrementing active inventory count by 1.',
  })
  @ApiResponse({ status: 201, description: 'Book checked out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiResponse({ status: 409, description: 'Out of stock or double-check out attempt.' })
  borrowBook(@Req() req: any, @Param('bookId', ParseIntPipe) bookId: number) {
    const userId = req.user.sub;
    return this.borrowService.borrowBook(userId, bookId);
  }

  @Post('return/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Return a borrowed book',
    description: 'Registers return check-in, incrementing active catalog stock availability by 1.',
  })
  @ApiResponse({ status: 200, description: 'Book returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Permission validation failed.' })
  @ApiResponse({ status: 404, description: 'Borrow record not found.' })
  returnBook(@Req() req: any, @Param('id', ParseIntPipe) recordId: number) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'LIBRARIAN';
    return this.borrowService.returnBook(userId, recordId, isAdmin);
  }

  @Post('extend/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extend active book loan',
    description: 'Postpones due date by 7 days. Allowed maximum of 2 extensions per loan item.',
  })
  @ApiResponse({ status: 200, description: 'Loan extended successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Borrow record not found.' })
  @ApiResponse({ status: 409, description: 'Returned loan or extension limits reached.' })
  extendLoan(@Req() req: any, @Param('id', ParseIntPipe) recordId: number) {
    const userId = req.user.sub;
    return this.borrowService.extendLoan(userId, recordId);
  }

  @Get('mine')
  @ApiOperation({
    summary: 'View my active & past loans',
    description: 'Retrieves all borrow records linked to the currently logged-in account.',
  })
  @ApiResponse({ status: 200, description: 'User loans returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMyLoans(@Req() req: any) {
    const userId = req.user.sub;
    return this.borrowService.getMyLoans(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiOperation({
    summary: 'View all system loans (Admin/Librarian only)',
    description: 'Lists every borrow record tracked in the library. Requires Admin or Librarian roles.',
  })
  @ApiResponse({ status: 200, description: 'Global loan ledger returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Permissions required.' })
  getAllLoans() {
    return this.borrowService.getAllLoans();
  }
}
