import 'highlight.js/styles/atom-one-dark.css';

import { lowlight } from 'lowlight';
import { internals } from 'src/code/pages/static/internals';

declare module 'src/code/pages/static/internals' {
  export interface DeepNotesInternals {
    lowlight: typeof lowlight;
  }
}

internals.lowlight = lowlight;
