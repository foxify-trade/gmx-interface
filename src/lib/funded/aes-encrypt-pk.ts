import { AES, enc } from "crypto-js";

export function encryptPk(pk: string, secret: string): string {
  return AES.encrypt(pk, secret).toString();
}

export function decryptPk(ciphertext: string, secret: string): string {
  return AES.decrypt(ciphertext, secret).toString(enc.Utf8);
}
