import type { AppProps } from "next/app";
import "../app_disabled/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
