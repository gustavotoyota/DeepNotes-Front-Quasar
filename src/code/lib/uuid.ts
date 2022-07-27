export function isUuid4(text: string) {
  const pattern =
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  return pattern.test(text);
}

export function uuidToBytes(uuid: string): Uint8Array {
  return new Uint8Array(
    (uuid.replace(/-/g, '').match(/.{2}/g) || []).map((b) => parseInt(b, 16))
  );
}
