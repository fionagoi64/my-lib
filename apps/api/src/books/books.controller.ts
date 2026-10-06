import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BooksService } from '@/books/books.service';
import { CreateCategoryDto } from '@/books/dto/create-category.dto';
import { CreateBookDto } from '@/books/dto/create-book.dto';
import { UpdateBookDto } from '@/books/dto/update-book.dto';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@ApiTags('Books & Categories')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ==========================================
  // CATEGORIES ENDPOINTS
  // ==========================================

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new book category (Admin/Librarian only)',
    description: 'Adds a new category for classification. Requires Admin or Librarian roles.',
  })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Permissions required.' })
  @ApiResponse({ status: 409, description: 'Category already exists.' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.booksService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieves all catalog categories alongside book tallies.',
  })
  @ApiResponse({ status: 200, description: 'Categories returned successfully.' })
  findAllCategories() {
    return this.booksService.findAllCategories();
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a category (Admin/Librarian only)',
    description: 'Removes a category if empty. Requires Admin or Librarian roles.',
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Permissions required.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.deleteCategory(id);
  }

  // ==========================================
  // BOOKS ENDPOINTS
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Catalog a new book (Admin/Librarian only)',
    description: 'Adds a book to the library system. Requires Admin or Librarian roles.',
  })
  @ApiResponse({ status: 201, description: 'Book created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Permissions required.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'ISBN duplicate.' })
  createBook(@Body() createBookDto: CreateBookDto) {
    return this.booksService.createBook(createBookDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Browse book catalog',
    description: 'Retrieves all available books with optional keyword searches, category filtering, and pagination.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Keyword query matching title or author' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Category identifier filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'Catalog items returned successfully.' })
  findAllBooks(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const catId = categoryId ? parseInt(categoryId, 10) : undefined;
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.booksService.findAllBooks(search, catId, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'View book detail',
    description: 'Retrieves detailed catalog properties for a specific book.',
  })
  @ApiResponse({ status: 200, description: 'Book details returned successfully.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  findOneBook(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOneBook(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update book details (Admin/Librarian only)',
    description: 'Edits properties of an existing catalog entry. Requires Admin or Librarian roles.',
  })
  @ApiResponse({ status: 200, description: 'Book updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Permissions required.' })
  @ApiResponse({ status: 404, description: 'Book or Category not found.' })
  updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.updateBook(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove book from catalog (Admin/Librarian only)',
    description: 'Soft-deletes a book. Fails if there are active loans. Requires Admin or Librarian roles.',
  })
  @ApiResponse({ status: 200, description: 'Book deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Permissions required.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  deleteBook(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.deleteBook(id);
  }
}
