import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

import { OrderModule } from 'src/order/order.module';
import { ProductsModule } from 'src/products/products.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [OrderModule, ProductsModule, CategoriesModule, UsersModule],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
