import { ChakraProvider, chakra, extendTheme } from "@chakra-ui/react";
import type { NextComponentType, NextPageContext } from "next";
import Head from "next/head";
import type { NextRouter } from "next/router";

type AppProps = {
  Component: NextComponentType<
    NextPageContext,
    Record<string, unknown>,
    Record<string, unknown>
  >;
  pageProps: Record<string, unknown>;
  err?: Error;
  router: NextRouter;
};

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
});

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>RIO + WCL Lookup</title>
      </Head>
      <ChakraProvider theme={theme}>
        <chakra.main p={8}>
          <Component {...pageProps} />
        </chakra.main>
      </ChakraProvider>
    </>
  );
}
