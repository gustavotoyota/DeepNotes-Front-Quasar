const textEncoder = new TextEncoder();
export function encodeText(text: string): Uint8Array {
  return textEncoder.encode(text);
}

const textDecoder = new TextDecoder();
export function decodeText(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}
