import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, ButtonGroup, CloseButton, Container, IconButton } from "@chakra-ui/react";
import React from "react";

export default function Home() {
    return (
        <Container pt={8}>
            <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>Your browser is outdated!</AlertTitle>
                <AlertDescription>Your experience may be degraded.</AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" />
            </Alert>
            {/* <ButtonGroup isAttached>
                <Button>This is a testing button</Button>
                <IconButton icon={() => <>+</>}></IconButton>
            </ButtonGroup> */}
        </Container>
    );
}
