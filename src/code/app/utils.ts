import { isNumeric } from 'src/code/lib/utils';
import { computed } from 'vue';

export function sizeToCSS(size: string): string {
  if (isNumeric(size)) {
    return `${size}px`;
  } else {
    return 'auto';
  }
}

export function dictProp(prefix: string, key: () => string) {
  return computed({
    get: () => $pages.react.dict[`${prefix}:${key()}`],
    set: (value) => {
      $pages.react.dict[`${prefix}:${key()}`] = value;
    },
  });
}
