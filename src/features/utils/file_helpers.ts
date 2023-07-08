import { get } from "mongoose";

export function uploadFileRename(name: string): string {
  const splitted = name.split(".");
  let nameWithoutExtension = "";
  for (let i = 0; i < splitted.length - 1; i++) {
    nameWithoutExtension += splitted[i];
  }
  const tarih = Date.now().toString();
  const yeniAd = nameWithoutExtension
    .replace(/\s+/g, "-")
    .replace(/\./g, "-")
    .replace(/\//g, "-");

  return `${yeniAd}-${tarih}.${splitted.pop()}`; // Sonunda tarih ve uzantıyı ekleyerek yeni adı oluştur
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
