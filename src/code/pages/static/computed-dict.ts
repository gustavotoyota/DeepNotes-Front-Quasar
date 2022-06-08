import { isSymbol } from 'lodash';
import { computed, WritableComputedRef } from 'vue';

export function createComputedDict<T>(computation: {
  get: (key: string) => T;
  set?: (key: string, value: T) => void;
}): Record<string, T> {
  const dict: Record<string, WritableComputedRef<T>> = {};

  function createComputed(propertyKey: PropertyKey) {
    let value;

    if (computation.set == null) {
      value = computed(() => computation.get(propertyKey as string));
    } else {
      value = computed({
        get: () => {
          return computation.get(propertyKey as any);
        },
        set: (value) => {
          computation.set?.(propertyKey as any, value);
        },
      });
    }

    Reflect.set(dict, propertyKey, value);
  }

  return new Proxy(dict, {
    get(target, propertyKey) {
      if (isSymbol(propertyKey) || propertyKey.toString().startsWith('__')) {
        return;
      }

      if (!(propertyKey in target)) {
        createComputed(propertyKey);
      }

      return dict[propertyKey as string].value;
    },
    set(target, propertyKey, value) {
      if (isSymbol(propertyKey) || propertyKey.toString().startsWith('__')) {
        return false;
      }

      if (!(propertyKey in target)) {
        createComputed(propertyKey);
      }

      dict[propertyKey as string].value = value;

      return true;
    },
  }) as unknown as Record<string, T>;
}
