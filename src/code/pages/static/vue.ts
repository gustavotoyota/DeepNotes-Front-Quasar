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
): void {
  let unwatch: WatchStopHandle | null = null;

  let result: boolean | undefined = undefined;

  unwatch = watch(
    source,
    () => {
      result = callback();

      if (result) {
        unwatch?.();
      }
    },
    options
  );

  if (result) {
    unwatch?.();
  }
}
