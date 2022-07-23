import sodium from 'libsodium-wrappers';

export function base64ToBytes(
  input: string | null | undefined
): Uint8Array | undefined {
  if (input == null) {
    return undefined;
  } else {
    return sodium.from_base64(input);
  }
}
export function bytesToBase64(
  input: Uint8Array | null | undefined
): string | undefined {
  if (input == null) {
    return undefined;
  } else {
    return sodium.to_base64(input);
  }
}
