import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/decorator/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/interface/common.interface';
import { Roles } from 'src/decorator/roles.decorator';
@ApiTags('Order')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Access denied');
    }

    const order = await this.orderService.create(
      createOrderDto,
      req.user.sub.toString(),
    );
    return { order };
  }

  @Get('by-user/:userId')
  async getAllOrdersByUserId(
    @Param('userId') id: string,
    @Req() req: RequestUser,
  ) {
    if (!req.user || id !== req.user.sub.toString()) {
      throw new UnauthorizedException('Access denied');
    }

    const [orders, total] = await this.orderService.findAllByUserIdAndCount(id);
    return {
      orders,
      total,
    };
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders fetched successfully' })
  @Get()
  @Roles('admin')
  async findAll() {
    const orders = await this.orderService.findAll();
    return { orders };
  }

  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Order fetched successfully' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    return { order };
  }

  @ApiOperation({ summary: 'Update an order by id' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.orderService.update(id, updateOrderDto);
    return { order };
  }

  @ApiOperation({ summary: 'Delete an order by id' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const order = await this.orderService.remove(id);
    return { order };
  }
}
