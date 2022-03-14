import { Box, Container, Alert, AlertIcon } from "@chakra-ui/react";
import React from "react";
import { NavBar } from "../components/NavBar";

export default function () {
    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container as="main" maxW="container.lg">
                <Alert status="success" maxW="400px" rounded="lg" shadow="sm" mt={4}>
                    <AlertIcon />
                    You are now logged in!
                </Alert>
            </Container>
        </Box>
    );
}
