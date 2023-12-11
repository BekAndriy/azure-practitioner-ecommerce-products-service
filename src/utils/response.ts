import { HttpResponseInit } from "@azure/functions";

export const errorResponse = (errorCode: number, message: string): HttpResponseInit => ({
  status: errorCode,
  body: message
})

export const successJSONResponse = (body: object) => ({
  status: 200,
  body: JSON.stringify(body),
  headers: {
    'Content-type': 'application/json'
  }
})