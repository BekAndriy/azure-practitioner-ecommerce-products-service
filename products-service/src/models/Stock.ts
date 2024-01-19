import * as yup from 'yup';

export interface Stock {
  product_id: string;
  count: number;
}

export const stockValidationObj = {
  count: yup.number()
}