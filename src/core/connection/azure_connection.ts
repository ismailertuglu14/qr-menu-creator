import { BlobServiceClient } from "@azure/storage-blob";
const x = process.env.AZURE_CONNECTION;
const blobServiceClient = BlobServiceClient.fromConnectionString(
  "DefaultEndpointsProtocol=https;AccountName=qrmenu1923;AccountKey=+N9vbckpO0qEPkKJ8hFy8PAksFaF74cRzvJXXbFtkZiTKFX1ZqUfVPeOmGPJoP3hpbeaU4G1wNhC+ASt/NUp+Q==;EndpointSuffix=core.windows.net"
);

export default blobServiceClient;
