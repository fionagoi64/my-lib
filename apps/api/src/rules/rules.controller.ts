import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';

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
  findAll() {
    return this.rulesService.findAll();
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
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateRuleDto: CreateRuleDto,
  ) {
    const userId = req.user.sub;
    return this.rulesService.update(Number(id), userId, updateRuleDto);
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
  remove(@Param('id') id: string) {
    return this.rulesService.remove(Number(id));
  }
}
