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
  NotFoundException,
} from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/decorator/roles.guard';
import { SubCategory } from './entities/sub-category.entity';
import { IAllQuery } from 'src/interface/common.interface';

@ApiTags('Sub Categories')
@Controller('sub-categories')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new sub category' })
  @ApiBody({ type: CreateSubCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'The sub category has been successfully created.',
    type: SubCategory,
  })
  create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoryService.create(createSubCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub categories' })
  @ApiResponse({
    status: 200,
    description: 'The list of sub categories',
    type: [SubCategory],
  })
  findAll(@Query() query: IAllQuery) {
    return this.subCategoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sub category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The sub category with the given ID',
    type: SubCategory,
  })
  async findOne(@Param('id') id: string) {
    const subCategory = await this.subCategoryService.findOne(id);
    if (!subCategory) {
      throw new NotFoundException('Sub category not found');
    }
    return { subCategory };
  }

  @Get('by-category/:categoryId')
  @ApiOperation({ summary: 'Get sub-categories by category ID' })
  @ApiResponse({
    status: 200,
    description: 'The list of sub-categories for the given category ID',
    type: [SubCategory],
  })
  async findByCategory(@Param('categoryId') categoryId: string) {
    const subCategories =
      await this.subCategoryService.findByCategory(categoryId);
    return {
      subCategories,
    };
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a sub category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The sub category has been successfully updated.',
    type: SubCategory,
  })
  update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.subCategoryService.update(id, updateSubCategoryDto);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sub category by ID' })
  @ApiResponse({
    status: 200,
    description: 'The sub category has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.subCategoryService.remove(id);
  }
}
