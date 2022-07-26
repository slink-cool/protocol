export function encode(s: string): Uint8Array {
  const space = 128;
  const maxLength = space - 1;
  const encoded = new TextEncoder().encode(s);
  if (encoded.length > maxLength) {
    throw new Error();
  }
  const result = new Array(space).fill(0);
  result[0] = encoded.length;
  encoded.forEach((it, idx) => (result[idx + 1] = it));
  return new Uint8Array(result);
}

export function decode(s: number[]): string {
  const length = s[0]!;
  const data = s.slice(1, length + 1);
  return new TextDecoder().decode(new Uint8Array(data));
}
