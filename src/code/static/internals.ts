import { reactive } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeepNotesInternalsReact {}

export interface DeepNotesInternals {
  react: DeepNotesInternalsReact;
}

export const internals: DeepNotesInternals = {
  react: reactive({}),
} as any;
