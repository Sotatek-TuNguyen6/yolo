import { Types } from 'mongoose';
import { PaymentMethodOrder, StatusOrder, TypeAction } from 'src/enum';

export type JwtPayloadResetPassword = {
  sub: string;
  email: string;
};

export type QueryParams = {
  page: number;
  limit: number;
  sort: string;
};

export type ITypeAction =
  | TypeAction.CREATE
  | TypeAction.UPDATE
  | TypeAction.DELETE;

export type IStatusOrder =
  | StatusOrder.CANCELLED
  | StatusOrder.COMPLETED
  | StatusOrder.CONFIRMED
  | StatusOrder.PENDING
  | StatusOrder.SHIPPING;

export type IPaymentMethodOrder =
  | PaymentMethodOrder.CASH
  | PaymentMethodOrder.COD
  | PaymentMethodOrder.MOMO
  | PaymentMethodOrder.PAYPAL
  | PaymentMethodOrder.VNPAY;

export type IImageUrls = {
  color: Types.ObjectId;
  images: string[];
}[];

export { QueryParamsDto } from './query-params.dto';
