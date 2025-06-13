export interface Category {
  _id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  thumbnailImage: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export type SubCategory = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  categoryParents: Category;
};