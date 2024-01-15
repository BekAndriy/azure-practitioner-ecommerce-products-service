import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { errorResponse, successJSONResponse } from "../utils/response";
import { logParameters } from "../utils/logger";
import { Client } from "../db";

export const httpGetProductById = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  logParameters(request, context);

  const { productId } = request.params;

  const [products, stocks] = await Promise.all([
    Client.container('products')
      .items
      .query({
        query: 'SELECT * FROM products p WHERE p.id = @id',
        parameters: [{ name: '@id', value: productId }]
      })
      .fetchAll(),
    Client.container('stocks')
      .items
      .query({
        query: 'SELECT * FROM stocks s WHERE s.product_id = @productId',
        parameters: [
          {
            name: '@productId',
            value: productId
          }
        ]
      })
      .fetchAll()
  ]);

  const [product] = products.resources;

  if (!product) {
    return errorResponse('Product not found', 404);
  }

  const { id, price, title, description } = product;
  const { count } = stocks.resources[0];
  const productResult = {
    id, price, title, description, count
  };
  return successJSONResponse(productResult);
};

app.http('http-get-product-by-id', {
  methods: ['GET',],
  authLevel: 'anonymous',
  route: 'products/{productId}',
  handler: httpGetProductById
});
