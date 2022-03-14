import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, ButtonGroup, CloseButton, Container, IconButton } from "@chakra-ui/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Home() {
    return (
        <Container>
            <Alert status="error" mt={8}>
                <AlertIcon />
                <AlertTitle mr={2}>Your browser is outdated!</AlertTitle>
                <AlertDescription>Your experience may be degraded.</AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" />
            </Alert>
            <ButtonGroup isAttached mt={8}>
                <Button>This is a testing button</Button>
                <IconButton aria-label="Remove" icon={<FontAwesomeIcon icon={faTrash} />} />
            </ButtonGroup>
        </Container>
    );
}
