/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare const process: {
  env: {
    URL_API: "https://blogu.sistemasapi.online";
    [key: string]: string | undefined;
  };
};