import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, ButtonGroup, Center, CloseButton, Container } from "@chakra-ui/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import { NavBar } from "../components/NavBar";
import { SERVER_URL } from "../util";

export default function () {
    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container as="main" maxW="container.lg">
                <Center height="96" border="4px dotted" borderColor="gray.300" mt={8} rounded="2xl">
                    <Alert status="info" maxW="400px" rounded="lg" shadow="sm">
                        <AlertIcon />
                        Here will be some general information about the current running job without being logged in.
                    </Alert>
                </Center>
            </Container>
        </Box>
    );
}
