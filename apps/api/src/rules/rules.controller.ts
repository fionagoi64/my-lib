import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { RulesQueryDto } from './dto/rules-query.dto';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@ApiTags('Library Rules')
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active library rules FAQ',
    description: 'Retrieves all non-deleted library regulations and parameters.',
  })
  @ApiResponse({ status: 200, description: 'Rules returned successfully.' })
  @ApiQuery({ name: 'q', required: false, description: 'Search rule title and policy text' })
  @ApiQuery({ name: 'page', required: false, description: 'Optional page number (requires limit)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Optional page size, 1 to 100 (requires page)' })
  findAll(@Query() query: RulesQueryDto) {
    return this.rulesService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new library rule (Admin only)',
    description: 'Registers a new regulation entry in the database. Requires Admin role.',
  })
  @ApiResponse({ status: 201, description: 'Rule registered successfully.' })
  create(@Req() req: any, @Body() createRuleDto: CreateRuleDto) {
    const userId = req.user.sub;
    return this.rulesService.create(userId, createRuleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update library rule specifications (Admin only)',
    description: 'Edits the title and content guidelines of a registered rule. Requires Admin role.',
  })
  @ApiResponse({ status: 200, description: 'Rule updated successfully.' })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateRuleDto: CreateRuleDto,
  ) {
    const userId = req.user.sub;
    return this.rulesService.update(id, userId, updateRuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove library rule (Admin only)',
    description: 'Performs a logical deletion of a rule entry. Requires Admin role.',
  })
  @ApiResponse({ status: 200, description: 'Rule removed successfully.' })
  @ApiResponse({ status: 404, description: 'Rule not found.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.rulesService.remove(id, req.user.sub);
  }
}
