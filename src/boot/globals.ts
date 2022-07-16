export {};

if (process.env.PROD) {
  console.log = () => undefined;
}
