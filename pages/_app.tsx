import "../styles/globals.css";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
// Fix for Next.js https://fontawesome.com/docs/web/use-with/react/use-with
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

function MyApp({ Component, pageProps }: any) {
    return (
        <ChakraProvider>
            <Component {...pageProps} />
        </ChakraProvider>
    );
}

export default MyApp;
