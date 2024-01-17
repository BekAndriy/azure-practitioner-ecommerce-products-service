import { InvocationContext } from "@azure/functions";
import { BlobSASPermissions, BlobSASSignatureValues, BlobServiceClient, BlockBlobClient, SASProtocol, StorageSharedKeyCredential, generateBlobSASQueryParameters } from "@azure/storage-blob";
import { constants } from '../constants'

export const getBlockBlobClient = (blobServiceClient: BlobServiceClient, containerName: string, fileName: string) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  return containerClient.getBlockBlobClient(fileName);
}

export const moveBlobFile = async (sourceBlockBlobClient: BlockBlobClient, destinationBlockBlobClient: BlockBlobClient) => {
  const sourceFileBuffer = await sourceBlockBlobClient.downloadToBuffer();
  destinationBlockBlobClient.uploadData(sourceFileBuffer);
}

export const deleteBlob = async (blockBlobClient: BlockBlobClient, logger: InvocationContext['log']) => {
  const deleteResponse = await blockBlobClient.deleteIfExists({ deleteSnapshots: 'include' });
  if (!deleteResponse.succeeded) {
    logger('Can\'t remove file. Error code: ', deleteResponse.errorCode);
  }
}

export const moveBlobToDestinationContainer = async (fileName: string, logger: InvocationContext['log']) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(constants.storageAccountConnectionString);

  const sourceBlockBlobClient = getBlockBlobClient(blobServiceClient, constants.sourceContainerName, fileName);
  const destinationBlockBlobClient = getBlockBlobClient(blobServiceClient, constants.destinationContainerName, fileName);

  await moveBlobFile(sourceBlockBlobClient, destinationBlockBlobClient);
  await deleteBlob(sourceBlockBlobClient, logger);
}

const getSharedKeyCredential = () => {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    constants.accountName,
    constants.accountKey
  );
  return sharedKeyCredential;
}

const getBlobSasToken = (blobName: string) => {
  const sasOptions: BlobSASSignatureValues = {
    containerName: constants.sourceContainerName,
    blobName,
    permissions: BlobSASPermissions.parse("cw"), // permissions
    protocol: SASProtocol.HttpsAndHttp,
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000) //
  };
  const sharedKeyCredential = getSharedKeyCredential();
  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

  return `?${sasToken}`;
}

/*
// for access to the storage account

const createAccountSas = () => {
  const sasOptions = {
    services: AccountSASServices.parse("b").toString(),             // blobs, tables, queues, files
    resourceTypes: AccountSASResourceTypes.parse("sco").toString(), // service, container, object
    permissions: AccountSASPermissions.parse("wc"),                 // permissions
    protocol: SASProtocol.Https,
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + (10 * 60 * 1000)),   // 10 minutes
  };

  const sharedKeyCredential = getSharedKeyCredential();

  const sasToken = generateAccountSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  // prepend sasToken with `?`
  return (sasToken[0] === '?') ? sasToken : `?${sasToken}`;
}

*/

const createSASUrl = (sasToken, blobName) => {
  return `https://${constants.accountName}.blob.core.windows.net/${constants.sourceContainerName}/${blobName}${sasToken}`;
}

export const getSASUrl = (fileName: string) => {
  const blobName = `${new Date().toISOString()}.${fileName}.csv`
  const accountSas = getBlobSasToken(blobName);
  return createSASUrl(accountSas, blobName);
}