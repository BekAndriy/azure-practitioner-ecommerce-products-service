import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { logParameters } from "../utils/logger";
import { Client } from "../db";
import { errorResponse, successJSONResponse } from "../utils/response";

class ErrorResponse extends Error {
  constructor(public readonly errors: string | Record<string, string>, public readonly statusCode: number) {
    super();
  }
}

const throw404Error = () => {
  throw new ErrorResponse('Not found', 404);
}

const validateId = (productId: string) => {
  if (!productId) {
    throw404Error();
  }
}

const validateExistence = async (productId: string) => {
  const product = await Client.container('products').item(productId, productId).read();

  if (!product.resource) {
    throw404Error();
  }
}

const deleteProduct = (productId: string) => {
  const stocksContainer = Client.container('stocks');
  return Promise.all([
    Client.container('products').item(productId, productId).delete(),
    stocksContainer.items.query({
      query: 'SELECT * FROM stocks s WHERE s.product_id = @productId',
      parameters: [{ name: '@productId', value: productId }]
    })
      .fetchAll()
      .then(({ resources }) => Promise.all(resources.map((resource) => stocksContainer.item(resource.id, resource.product_id).delete())))
  ])
}

export async function httpDeleteProductById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    logParameters(request, context);

    const { id } = request.params;

    validateId(id);
    await validateExistence(id);
    await deleteProduct(id);

    return successJSONResponse({ id });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return errorResponse(error.errors as string, error.statusCode);
    }
    context.log(error);
    return errorResponse('Internal server error', 500);
  }
};

app.http('http-delete-product-by-id', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'products/{id}',
  handler: httpDeleteProductById
});
