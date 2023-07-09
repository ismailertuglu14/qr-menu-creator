import { get } from "mongoose";

export function uploadFileRename(name: string): string {
  const splitted = name.split(".");
  const extension = splitted.pop();

  const nameWithoutExtension = splitted.join("");

  const date = Date.now().toString();
  const newName = nameWithoutExtension
    .replace(/\s+|\./g, "-") // Tüm boşlukları ve noktaları tire ile değiştir
    .replace(/\//g, "-");

  return `${newName}-${date}.${extension}`;
}

export function getFileNameWithUrl(
  containerName: string,
  blobName: string
): string {
  if (containerName && blobName) {
    return `${process.env.AZURE_STORAGE_URL}/${containerName}/${blobName}`;
  }
  throw new Error("Container name or blob name is null");
}
