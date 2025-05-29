import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SizeService } from './size.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Size } from './entities/size.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/decorator/roles.guard';
import { UserRole } from 'src/enum';
import { Roles } from 'src/decorator/roles.decorator';

@ApiBearerAuth('jwt')
@ApiTags('Size')
@Controller('sizes')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new size' })
  @ApiBody({ type: Size })
  @ApiResponse({
    status: 201,
    description: 'The size has been successfully created.',
    type: Size,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSizeDto: Partial<Size>) {
    const size = await this.sizeService.create(createSizeDto);
    return {
      size,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all sizes' })
  @ApiResponse({
    status: 200,
    description: 'The sizes have been successfully fetched.',
    type: [Size],
  })
  async findAll() {
    const sizes = await this.sizeService.findAll();
    return {
      sizes,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a size by id' })
  @ApiResponse({
    status: 200,
    description: 'The size has been successfully fetched.',
    type: Size,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const size = await this.sizeService.findOne(id);
    return {
      size,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a size by id' })
  @ApiResponse({
    status: 200,
    description: 'The size has been successfully updated.',
    type: Size,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateSizeDto: Partial<Size>) {
    const size = await this.sizeService.update(id, updateSizeDto);
    return {
      size,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a size by id' })
  @ApiResponse({
    status: 200,
    description: 'The size has been successfully deleted.',
    type: Size,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const size = await this.sizeService.remove(id);
    return {
      size,
    };
  }
}
