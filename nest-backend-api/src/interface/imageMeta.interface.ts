export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface ImageMeta {
  fileNames: string[];
  color: string;
  colorCode: string;
  sizeQuantities: SizeQuantity[];
}
