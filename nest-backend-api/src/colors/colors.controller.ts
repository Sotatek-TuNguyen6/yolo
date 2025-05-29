import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ColorsService } from './colors.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/decorator/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { QueryParamsDto } from 'src/types';

@ApiTags('Colors')
@ApiBearerAuth('jwt')
@Controller('colors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @ApiOperation({ summary: 'Create a new color' })
  @ApiBody({ type: CreateColorDto })
  @ApiResponse({ status: 201, description: 'Color created successfully' })
  @Roles('admin')
  @Post()
  async create(@Body() createColorDto: CreateColorDto) {
    const color = await this.colorsService.create(createColorDto);
    return {
      color,
    };
  }

  @ApiOperation({ summary: 'Get all colors' })
  @ApiQuery({ type: QueryParamsDto })
  @ApiResponse({ status: 200, description: 'Colors fetched successfully' })
  @Get()
  async findAll(@Query() query: QueryParamsDto) {
    const colors = await this.colorsService.findAll(query);
    return {
      colors,
    };
  }

  @ApiOperation({ summary: 'Get a color by id' })
  @ApiResponse({ status: 200, description: 'Color fetched successfully' })
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const color = await this.colorsService.findOne(id);
    return {
      color,
    };
  }

  @ApiOperation({ summary: 'Update a color by id' })
  @ApiBody({ type: UpdateColorDto })
  @ApiResponse({ status: 200, description: 'Color updated successfully' })
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateColorDto: UpdateColorDto,
  ) {
    const color = await this.colorsService.update(id, updateColorDto);
    return {
      color,
    };
  }

  @ApiOperation({ summary: 'Delete a color by id' })
  @ApiResponse({ status: 200, description: 'Color deleted successfully' })
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const color = await this.colorsService.remove(id);
    return {
      color,
    };
  }
}
