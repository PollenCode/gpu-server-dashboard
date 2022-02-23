import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, CloseButton } from "@chakra-ui/react";
import React from "react";

export default function Home() {
    return (
        <Box fontWeight="bold">
            <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>Your browser is outdated!</AlertTitle>
                <AlertDescription>Your experience may be degraded.</AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" />
            </Alert>
        </Box>
    );
}
