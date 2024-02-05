import * as yup from 'yup';

export interface Product {
  id: string
  title: string
  description?: string
  price: number
};

export const productValidationObj = {
  title: yup.string().min(3).max(255).trim().required(),
  description: yup.string().trim().max(2000),
  price: yup.number().min(0).required(),
}