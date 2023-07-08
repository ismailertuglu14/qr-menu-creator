import { getFileNameWithUrl } from "../../features/utils/file_helpers";
import blobServiceClient from "../connection/azure_connection";

async function uploadImage(
  containerName: string,
  blobName: string,
  file: any
): Promise<string> {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  if (!(await containerClient.exists())) {
    await containerClient.create();
  }

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return getFileNameWithUrl(containerName, blobName);
}

async function uploadMultipleImage(
  containerName: string,
  blobNames: string[],
  files: any[]
) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  if (!(await containerClient.exists())) {
    await containerClient.create();
  }

  for (let i = 0; i < blobNames.length; i++) {
    const blockBlobClient = containerClient.getBlockBlobClient(blobNames[i]);
    const uploadBlobResponse = await blockBlobClient.uploadData(
      files[i].buffer,
      {
        blobHTTPHeaders: { blobContentType: files[i].mimetype },
      }
    );
  }
  return true;
}

async function deleteImage(containerName: string, blobName: string) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const deleteBlobResponse = await blockBlobClient.deleteIfExists();
  return deleteBlobResponse;
}
export { uploadImage, uploadMultipleImage, deleteImage };
