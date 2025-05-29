export interface IAddressValue {
  code: number;
  name: string;
}

export interface IAddress {
  _id: string;
  user: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  ward: IAddressValue;
  district: IAddressValue;
  province: IAddressValue;
  isDefault: boolean;
}
