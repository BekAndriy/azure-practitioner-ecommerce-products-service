import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { successJSONResponse } from "../utils/response";
import { logParameters } from "../utils/logger";
import { Client } from "../db";
import { Product } from "../models/Product";
import { Stock } from "../models/Stock";

const joinProducts = (products: Product[], stocks: Stock[]) => {
  const stocksMap = stocks.reduce((resMap, item) => {
    const { count, product_id } = item;
    resMap.set(product_id, count);
    return resMap;
  }, new Map<string, number>());

  return products.map((product) => {
    const { id, price, title, description } = product;
    return {
      id, price, title, description,
      count: stocksMap.get(id) ?? 0
    }
  })
}

export const httpGetProducts = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  logParameters(request, context);

  const [products, stocks] = await Promise.all([
    Client.container('products')
      .items
      .query('SELECT * FROM products')
      .fetchAll(),
    Client.container('stocks')
      .items
      .query('SELECT * FROM stocks')
      .fetchAll()
  ]);

  const response = joinProducts(products.resources, stocks.resources)

  return successJSONResponse(response);
};

app.http('http-get-products', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products',
  handler: httpGetProducts
});
