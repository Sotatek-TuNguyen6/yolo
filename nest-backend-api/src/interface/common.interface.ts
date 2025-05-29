import { Types } from 'mongoose';
import { Gender } from 'src/enum';

export interface IQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  fields?: string;
}

export interface IQueryProduct extends IQuery {
  prices?: object[];
  categories?: string[];
  subCategories?: string[];
  colors?: string[];
  sizes?: string[];
  ratings?: number[];
  isFreeShip?: boolean;
}

export interface ICommonObj {
  [k: string]:
    | string
    | object
    | number
    | boolean
    | string[]
    | object[]
    | undefined;
}

export interface JwtPayload {
  sub: Types.ObjectId;
  role: string;
  email: string;
  gender: Gender;
}

export interface RequestUser extends Request {
  user?: JwtPayload;
}

export type IAllQuery = IQueryProduct;
