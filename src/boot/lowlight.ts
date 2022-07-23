import 'highlight.js/styles/atom-one-dark.css';

import { lowlight } from 'lowlight';
import { internals } from 'src/code/app/internals';

declare module 'src/code/app/internals' {
  export interface DeepNotesInternals {
    lowlight: typeof lowlight;
  }
}

internals.lowlight = lowlight;
