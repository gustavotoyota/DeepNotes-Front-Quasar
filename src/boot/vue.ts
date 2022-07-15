import process from 'process';
import { Dialog } from 'quasar';
import { boot } from 'quasar/wrappers';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    globalThis: typeof globalThis;
    console: Console;
    process: NodeJS.Process;
    Dialog: Dialog;
    tiptap: typeof tiptap;
  }
}

export default boot((params) => {
  params.app.config.unwrapInjectedRef = true;

  params.app.config.globalProperties.globalThis = globalThis;
  params.app.config.globalProperties.console = console;
  params.app.config.globalProperties.process = process;
  params.app.config.globalProperties.Dialog = Dialog;
  params.app.config.globalProperties.tiptap = globalThis.tiptap;
});
