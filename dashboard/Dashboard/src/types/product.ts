import { Color } from "@/interface/color.interface";
import { Category, SubCategory } from "./category";
import { Size } from "./sizes";
import { Image } from "./Image";

export type  Product = {
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
  