import { app } from "@azure/functions";
import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as yup from 'yup';
import { errorJSONResponse, successJSONResponse } from "../utils/response";
import { getSASUrl } from "../utils/files";


const validateName = (name: string) => {
  return yup.string()
    .required('Name is required')
    .matches(/^[a-zA-Z\d_-]+$/, 'Name should match the pattern a-zA-Z0-9_-')
    .validate(name, { abortEarly: false })
    .then(() => null)
    .catch((error: yup.ValidationError) => error.errors[0]);
}

export async function httpGetImportProductsFiles(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { query } = request;
  const name = query.get('name');

  const validationError = await validateName(name);
  if (validationError) {
    return errorJSONResponse({ unknown: validationError });
  }

  const url = getSASUrl(name);

  return successJSONResponse({ url });
};


app.http('http-get-import-products-files', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products/import',
  handler: httpGetImportProductsFiles
});
