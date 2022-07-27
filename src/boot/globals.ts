export {};

if (process.env.PROD) {
  console.log = () => undefined;
  console.error = () => undefined;
}
