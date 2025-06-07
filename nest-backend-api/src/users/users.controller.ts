import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/decorator/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RequestUser } from 'src/interface/common.interface';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return { users };
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'User fetched successfully' })
  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return { user };
  }

  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return { user };
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    return { user };
  }

  @Get('/info/profile')
  @ApiOperation({ summary: 'Get profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
  async profile(@Req() req: RequestUser) {
    if (!req.user?.sub) {
      throw new UnauthorizedException('User not found');
    }
    const user = await this.usersService.findOne(req.user?.sub.toString());
    return {
      user: user,
    };
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 200, description: 'User created successfully' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { user };
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @Patch('lock/:id')
  async lockUser(@Param('id') id: string) {
    const user = await this.usersService.lockUser(id);
    return { user };
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Get user reports and statistics' })
  @ApiResponse({
    status: 200,
    description: 'User report generated successfully',
  })
  @Post('/reports')
  async getUserReport() {
    const report = await this.usersService.getUserReport();

    return {
      success: true,
      data: report,
    };
  }
}
