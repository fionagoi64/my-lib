import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { OpenLibraryService } from './open-library.service';

@ApiTags('External book discovery')
@Controller('open-library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LIBRARIAN')
@ApiBearerAuth()
export class OpenLibraryController {
  constructor(private readonly openLibraryService: OpenLibraryService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search Open Library before importing a local catalog book',
    description: 'For librarian use only. Results are cached briefly and are not local stock records.',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Title, author, or ISBN' })
  @ApiQuery({ name: 'limit', required: false, description: 'Result count, from 1 to 20' })
  @ApiResponse({ status: 200, description: 'External book results returned.' })
  search(@Query('q') query?: string, @Query('limit') limit?: string) {
    if (!query?.trim()) {
      return { results: [], cached: false };
    }

    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.openLibraryService.search(query, Number.isFinite(parsedLimit) ? parsedLimit : undefined);
  }
}
