import { Category, SubCategory } from "@/types/category";
import { Color } from "./color.interface";
import { Image } from "./image.interface";
import { Size } from "./size.interface";

export interface Product {
  _id?: string;
  productId?: number;

  name: string;
  subContent?: string;
  content: string;
  featuredImage: string;
  summary: string;

  originPrice: number;
  price?: number;
  discount?: number;

  imageUrls: Image[];

  isFreeShip?: boolean;
  views?: number;
  ratingAverage?: number;

  colors: Color[];
  category: Category;
  subCategory: SubCategory;
  sizes: Size[];
  availableQuantities: number;

  comments?: string[]; 
  likes?: string[];    
  unitsSold?: number;
  usersSold?: string[];

  slug?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
