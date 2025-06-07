import { Injectable } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductsService,
    private readonly userService: UsersService,
  ) {}

  async getReport() {
    const orderReport = await this.orderService.getOrderReport(
      new Date('2025-01-01'),
      new Date(),
    );
    const productReport = await this.productService.getProductReport();
    const userReport = await this.userService.getUserReport();

    return {
      orderReport,
      productReport,
      userReport,
    };
  }
}
