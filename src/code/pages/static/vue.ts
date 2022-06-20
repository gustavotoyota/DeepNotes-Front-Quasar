import { Resolvable } from 'src/code/utils';
import {
  markRaw,
  ref,
  shallowRef,
  UnwrapRef,
  watch,
  WatchOptions,
  WatchStopHandle,
} from 'vue';

export function refProp<T>(obj: object, key: string, value: T): UnwrapRef<T> {
  const aux = ref(value);

  Object.defineProperty(obj, key, {
    get() {
      return aux.value;
    },
    set(value) {
      return (aux.value = value);
    },
  });

  return aux.value;
}

export function shallowRefProp<T>(obj: object, key: string, value: T): T {
  const aux = shallowRef(value);

  Object.defineProperty(obj, key, {
    get() {
      return aux.value;
    },
    set(value) {
      return (aux.value = value);
    },
  });

  return aux.value;
}

export class RawObject {
  constructor() {
    return markRaw(this);
  }
}

export function watchUntilTrue(
  source: () => any,
  callback: () => boolean,
  options?: WatchOptions
): Resolvable {
  let unwatch: WatchStopHandle | null = null;

  const resolvable = new Resolvable();

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  resolvable.then(() => {
    unwatch?.();
  });

  let result: boolean | undefined = undefined;

  unwatch = watch(
    source,
    () => {
      result = callback();

      if (result) {
        resolvable.resolve();
      }
    },
    options
  );

  if (result) {
    resolvable.resolve();
  }

  return resolvable;
}
