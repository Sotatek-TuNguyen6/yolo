export type Category = {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  thumbnailImage: string;
  createdAt: string;
  updatedAt: string;
};

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