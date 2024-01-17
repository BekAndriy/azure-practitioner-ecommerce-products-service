jest.mock('@azure/functions', () => ({
  ...jest.requireActual('@azure/functions'),
  app: {
    http: jest.fn((...rest) => { })
  }
}));

import { type HttpRequest, type InvocationContext } from '@azure/functions';
import { httpGetImportProductsFiles } from '../../functions/http-get-import-products-files'

describe('http-get-import-products-files', () => {
  let mockRequest: Partial<HttpRequest> = { query: new URLSearchParams() };
  let mockContext: Partial<InvocationContext> = {};

  beforeEach(() => {
    mockRequest = { query: new URLSearchParams() };
    mockContext = {};
  });

  it('should return an error if name is absent', async () => {
    const response = await httpGetImportProductsFiles(mockRequest as HttpRequest, mockContext as InvocationContext);
    expect(response.status).toBe(400);
  });

  it('should return an error if name is not match pattern', async () => {
    mockRequest.query.set('name', '$sdfsdf');
    const response = await httpGetImportProductsFiles(mockRequest as HttpRequest, mockContext as InvocationContext);
    expect(response.status).toBe(400);
  });
})