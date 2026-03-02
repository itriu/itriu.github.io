import { Html, Head, Main, NextScript } from "next/document";
import { themeAssetTag } from "@/generated/theme";

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        <link rel="stylesheet" href={`/theme.css?v=${themeAssetTag}`} />
        <script defer src={`/theme.js?v=${themeAssetTag}`} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
