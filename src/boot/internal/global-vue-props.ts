import process from 'process';
import { boot } from 'quasar/wrappers';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    globalThis: typeof globalThis;
    console: Console;
    process: NodeJS.Process;
  }
}

export default boot((params) => {
  params.app.config.globalProperties.globalThis = globalThis;
  params.app.config.globalProperties.console = console;
  params.app.config.globalProperties.process = process;
});
