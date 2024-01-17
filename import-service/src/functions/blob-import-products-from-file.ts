import { app } from "@azure/functions";
import { InvocationContext } from "@azure/functions";
import { getDataFromRows, parseCSVContent } from '../utils/csv'
import { moveBlobToDestinationContainer } from "../utils/files";


export async function blobImportProductsFromFile(blob: Buffer, context: InvocationContext): Promise<void> {
  try {
    // context.log - is the private method and AZ throws the error if pass it directly to the function 
    // that's why the log method is wrapped
    const logger = (...messages: unknown[]) => {
      context.log(...messages);
    };

    const contentStr = await blob.toString('utf-8');
    const rowsData = parseCSVContent(contentStr);
    const productsData = getDataFromRows(rowsData, logger);
    context.log('CSV Data: ', productsData);
    await moveBlobToDestinationContainer(context.triggerMetadata.name as string, logger);
    context.log('Success');
  } catch (error) {
    context.log("Error on importing files: ", error);
  }
}

app.storageBlob('blob-import-products-from-file', {
  path: 'uploaded/{name}',
  connection: 'AZURE_STORAGE_ACCOUNT_CONNECTION_STRING',
  handler: blobImportProductsFromFile,
});