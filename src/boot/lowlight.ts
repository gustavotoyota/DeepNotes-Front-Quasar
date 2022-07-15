import 'highlight.js/styles/atom-one-dark.css';

import { lowlight as _lowlight } from 'lowlight';

declare global {
  // eslint-disable-next-line no-var
  var lowlight: typeof _lowlight;
}

globalThis.lowlight = _lowlight;
