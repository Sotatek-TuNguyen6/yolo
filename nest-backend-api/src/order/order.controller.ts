import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderReportRequestDto } from './dto/order-report-request.dto';
import { OrderReportResponse } from './dto/order-report.dto';
import { OrderStatus, PaymentStatus } from 'src/enum';
import { RolesGuard } from 'src/decorator/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequestUser } from 'src/interface/common.interface';

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);
    return order;
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders fetched successfully' })
  @Get()
  async findAll() {
    const orders = await this.orderService.findAll();
    return orders;
  }

  @ApiOperation({ summary: 'Track an order by order ID and email' })
  @Post('/tracking')
  async orderTracking(@Body() body: { orderId: string; search: string }) {
    const order = await this.orderService.orderTracking(
      body.orderId,
      body.search,
    );
    return order;
  }

  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Order fetched successfully' })
  @Get('/detail/:id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.orderTracking(id);
    return order;
  }

  @ApiOperation({ summary: 'Delete an order by id' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const order = await this.orderService.remove(id);
    return {
      success: true,
      data: { order },
    };
  }

  @ApiOperation({ summary: 'Get order reports within a date range' })
  @ApiBody({ type: OrderReportRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Order report generated successfully',
  })
  @Post('/report')
  async getOrderReport(@Body() reportRequest: OrderReportRequestDto) {
    const startDate = new Date(reportRequest.startDate);
    const endDate = new Date(reportRequest.endDate);

    // Set the end date to the end of the day
    endDate.setHours(23, 59, 59, 999);

    const report = await this.orderService.getOrderReport(startDate, endDate);

    // Create a new object without the orders property if includeDetails is false
    const result: Partial<OrderReportResponse> = { ...report };
    if (reportRequest.includeDetails === false) {
      delete result.orders;
    }

    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':productId/payment-status')
  async updatePaymentStatus(
    @Param('productId') productId: string,
    @Body() updateOrderDto: { paymentStatus: PaymentStatus },
    @Req() req: RequestUser,
  ) {
    // console.log(req);
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = req.user.sub;
    const order = await this.orderService.updatePaymentStatus(
      productId,
      updateOrderDto.paymentStatus,
      userId.toString(),
    );
    return order;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':orderId/order-status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: { orderStatus: OrderStatus },
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    if (!req.user) {
      throw new UnauthorizedException('User not authorized');
    }

    const userId = req.user.sub;
    const order = await this.orderService.updateOrderStatus(
      orderId,
      updateOrderDto.orderStatus,
      userId.toString(),
    );
    return order;
  }
}
