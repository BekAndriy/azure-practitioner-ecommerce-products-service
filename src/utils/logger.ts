import { HttpRequest, InvocationContext } from "@azure/functions";

export const logParameters = (request: HttpRequest, context: InvocationContext, body?: object) => {
  const { params, query, url, method } = request;
  context.log('Request: ', { params, body, query, url, method });
}