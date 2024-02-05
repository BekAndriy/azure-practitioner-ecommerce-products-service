jest.mock('@azure/functions', () => ({
  ...jest.requireActual('@azure/functions'),
  app: {
    storageBlob: jest.fn((...rest) => { })
  }
}));

jest.mock('../../utils/files', () => ({
  ...jest.requireActual('../../utils/files'),
  moveBlobToDestinationContainer: jest.fn((...rest) => { })
}));

import { type HttpRequest, type InvocationContext } from '@azure/functions';
import { blobImportProductsFromFile } from '../../functions/blob-import-products-from-file';
import * as filesService from '../../utils/files';
import * as serviceBus from '../../utils/serviceBus';


describe('blob-import-products-from-file', () => {
  let mockRequest: Partial<HttpRequest> = { query: new URLSearchParams() };
  let mockContext: Partial<InvocationContext> = {};

  const getBufferFromString = (value: string) => Buffer.from(value, "utf-8");

  beforeEach(() => {
    mockRequest = {
      query: new URLSearchParams(),
    };
    mockContext = {
      log: jest.fn((...rest) => {
        console.log(...rest);
      }),
      triggerMetadata: { name: 'file-name.csv' }
    };
  });

  it('should parse file successfully', async () => {
    const moveBlobToDestinationContainerSpy = jest.fn(() => Promise.resolve())
    jest.spyOn(filesService, 'moveBlobToDestinationContainer').mockImplementation(moveBlobToDestinationContainerSpy);
    jest.spyOn(serviceBus, 'sendBatchMessagesToQueue').mockImplementation(jest.fn());
    const csvData = [['name', 'invalid name'], ['Some name']];
    const csvContent = csvData.map((row) => row.join(',')).join('\n');
    await blobImportProductsFromFile(getBufferFromString(csvContent), mockContext as InvocationContext);
    expect(moveBlobToDestinationContainerSpy).toHaveBeenCalledTimes(1);
  });
})