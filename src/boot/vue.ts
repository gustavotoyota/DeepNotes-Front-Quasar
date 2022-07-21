import process from 'process';
import { Dialog, Notify } from 'quasar';
import { boot } from 'quasar/wrappers';
import { internals } from 'src/code/static/internals';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    globalThis: typeof globalThis;
    console: Console;
    process: NodeJS.Process;
    Dialog: Dialog;
    Notify: Notify;
    internals: typeof internals;
  }
}

export default boot((params) => {
  params.app.config.unwrapInjectedRef = true;

  params.app.config.globalProperties.globalThis = globalThis;
  params.app.config.globalProperties.console = console;
  params.app.config.globalProperties.process = process;
  params.app.config.globalProperties.Dialog = Dialog;
  params.app.config.globalProperties.Notify = Notify;
  params.app.config.globalProperties.internals = internals;
});
