import { get } from "mongoose";

export function uploadFileRename(name: string): string {
  const uzanti = name.split(".").pop(); // Sonundaki uzantıyı al
  const tarih = Date.now().toString(); // Geçerli tarih bilgisini zaman damgası olarak al
  const yeniAd = name
    .replace(/\s+/g, "-") // Boşlukları tire ile değiştir
    .replace(/\./g, "-") // Nokta karakterlerini tire ile değiştir
    .replace(/\//g, "-"); // Slash karakterlerini tire ile değiştir

  return `${yeniAd}-${tarih}.${uzanti}`; // Sonunda tarih ve uzantıyı ekleyerek yeni adı oluştur
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
