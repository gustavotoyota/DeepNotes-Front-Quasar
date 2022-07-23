import { isNumeric } from 'src/code/lib/utils';

export function sizeToCSS(size: string): string {
  if (isNumeric(size)) {
    return `${size}px`;
  } else {
    return 'auto';
  }
}
