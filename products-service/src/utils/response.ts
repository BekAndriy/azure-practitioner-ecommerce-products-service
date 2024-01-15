import { HttpResponseInit } from "@azure/functions";

export const errorResponse = (message: string, errorCode: number = 400): HttpResponseInit => ({
  status: errorCode,
  body: message
})

export const errorJSONResponse = (body: object, errorCode: number = 400) => {
  return {
    status: errorCode,
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json'
    }
  };
}

export const successJSONResponse = (body: object) => ({
  status: 200,
  body: JSON.stringify(body),
  headers: {
    'Content-type': 'application/json'
  }
})
