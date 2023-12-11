import { app, HttpResponseInit } from "@azure/functions";
import { products } from '../mocks/data';
import { successJSONResponse } from "../utils/response";

export const httpGetProducts = async (): Promise<HttpResponseInit> => {
  return successJSONResponse(products);
};

app.http('http-get-products', {
  methods: ['GET',],
  authLevel: 'anonymous',
  route: 'products',
  handler: httpGetProducts
});
