export type Image = {
  url: string[];
  color: string;
  colorCode: string;
  sizeQuantities: { size: string; quantity: number, _id?: string }[];
  _id?: string;
}