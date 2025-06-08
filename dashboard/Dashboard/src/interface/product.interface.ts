import { Category } from "@/types/category";
import { Image } from "./image.interface";
import { Tag } from "./tag.interface";

export interface Product {
  _id?: string;
  productId: number;
  
  name: string;
  description?: string;
  detail?: string;
  slug?: string;
  
  price: number;
  discountPercent?: number;
  
  images: Image[];
  
  category: Category | string;
  stock?: number;
  
  tags?: Tag[];
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
  __v?: number;
}
