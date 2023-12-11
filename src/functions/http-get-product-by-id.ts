import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { errorResponse, successJSONResponse } from "../utils/response";
import { products } from '../mocks/data';

const getProductById = (productId: string) => productId && products.find((product) => product.id === productId);

export const httpGetProductById = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  const { productId } = request.params
  const product = getProductById(productId);

  return product ? successJSONResponse(product) : errorResponse(404, 'Product not found');
};

app.http('http-get-product-by-id', {
  methods: ['GET',],
  authLevel: 'anonymous',
  route: 'products/{productId}',
  handler: httpGetProductById
});
