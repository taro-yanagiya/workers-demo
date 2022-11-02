export const writeString = (
  str: string,
  buffer: ArrayBuffer,
  offset: number,
  max: number,
): void => {
  const array = new Uint8Array(buffer);

  let i: number;
  for (i = 0; i < Math.max(str.length, max - 1); i++) {
    if (!str[i]) break;
    array[i + offset] = str[i].charCodeAt(0);
  }
  array[i + offset] = "\0".charCodeAt(0);
};

export const readString = (
  buffer: ArrayBuffer,
  offset: number,
  size: number,
): string => {
  const res: string[] = [];
  const array = new Uint8Array(buffer);
  for (let i = 0; i < size; i++) {
    const char = String.fromCharCode(array[offset + i]);
    if (char === "\0") break;
    res.push(char);
  }
  return res.join("");
};
