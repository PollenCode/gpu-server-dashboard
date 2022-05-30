import "../styles/globals.css";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
// Fix for Next.js https://fontawesome.com/docs/web/use-with/react/use-with
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { UserContext } from "../UserContext";
import useSWR from "swr";
import { fetcher } from "../util";
config.autoAddCss = false;

function MyApp({ Component, pageProps }: any) {
    return (
        <UserContext.Provider value={pageProps.user}>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>
        </UserContext.Provider>
    );
}

export default MyApp;
