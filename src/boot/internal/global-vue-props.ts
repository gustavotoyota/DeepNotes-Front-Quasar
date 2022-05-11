import { boot } from 'quasar/wrappers';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    console: Console;
    process: NodeJS.Process;
  }
}

export default boot((params) => {
  params.app.config.globalProperties.console = console;
  params.app.config.globalProperties.process = process;
});
