import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { v4 as uuidv4 } from 'uuid'
import * as yup from 'yup';
import { logParameters } from "../utils/logger";
import { errorJSONResponse, errorResponse, successJSONResponse } from "../utils/response";
import { Product, productValidationObj } from "../models/Product";
import { Stock, stockValidationObj } from "../models/Stock";
import { Client } from "../db";
import { parseStream, validateYupObj } from "../utils/data";

type InputProductData = Omit<Product, 'id'> & Pick<Stock, 'count'>;

const yupBodySchema = yup.object({
  ...productValidationObj,
  ...stockValidationObj
}).required();

const validateBody = (body: InputProductData) => {
  return validateYupObj(yupBodySchema, body);
}

export const httpPostProduct = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  try {
    const { body } = request;
    const bodyData = await parseStream<InputProductData>(body as ReadableStream);

    logParameters(request, context, bodyData);

    const validationErrors = await validateBody(bodyData);
    if (validationErrors) {
      return errorJSONResponse(validationErrors);
    }

    const { count = 0, price, title, description = '' } = bodyData;
    const productId = uuidv4();

    await Client.container('products').items
      .create({ id: productId, price: +price, title, description });
    await Client.container('stocks').items
      .create({ product_id: productId, count: +count });

    return successJSONResponse({ id: productId });
  } catch (error) {
    context.log(error);
    return errorResponse('Internal server error', 500);
  }
};

app.http('http-post-product', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'products',
  handler: httpPostProduct
});
