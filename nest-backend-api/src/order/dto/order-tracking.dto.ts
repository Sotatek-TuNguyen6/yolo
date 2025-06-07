import { Order, OrderDetail } from '../entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

export interface OrderDetailWithProduct extends Omit<OrderDetail, 'product'> {
  product: Product;
}

export interface OrderTrackingResponse extends Omit<Order, 'orderDetails'> {
  orderDetails: OrderDetailWithProduct[];
}
