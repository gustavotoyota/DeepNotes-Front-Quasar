import Color from 'color';

export function concatUint8Array(...arrays: Uint8Array[]) {
  let totalLength = 0;

  for (const arr of arrays) {
    totalLength += arr.length;
  }

  const result = new Uint8Array(totalLength);

  let offset = 0;

  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

export function negateProp<T extends Record<any, any>>(obj: T, key: keyof T) {
  // @ts-ignore
  obj[key] = !obj[key];
}

export function isUuid4(text: string) {
  const pattern =
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  return pattern.test(text);
}

export class Resolvable<T = void> implements PromiseLike<T> {
  resolve!: (value: T) => void;
  reject!: (reason?: any) => void;

  readonly promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }
}

export function lightenByRatio(color: Color, ratio: number) {
  const lightness = color.lightness();
  return color.lightness(lightness + (100 - lightness) * ratio);
}
export function darkenByRatio(color: Color, ratio: number) {
  const lightness = color.lightness();
  return color.lightness(lightness - lightness * ratio);
}

export function lightenByAmount(color: Color, amount: number) {
  const lightness = color.lightness();
  return color.lightness(lightness + amount);
}
export function darkenByAmount(color: Color, amount: number) {
  const lightness = color.lightness();
  return color.lightness(lightness - amount);
}

// @ts-ignore
globalThis.lightenByRatio = lightenByRatio;
// @ts-ignore
globalThis.darkenByRatio = darkenByRatio;
// @ts-ignore
globalThis.lightenByAmount = lightenByAmount;
// @ts-ignore
globalThis.darkenByAmount = darkenByAmount;
