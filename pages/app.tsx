import { Box, Container, Alert, AlertIcon, Code } from "@chakra-ui/react";
import React from "react";
import useSWR from "swr";
import { NavBar } from "../components/NavBar";
import { fetcher, SERVER_URL } from "../util";

export default function () {
    const { data: user } = useSWR(SERVER_URL + "/api/user", fetcher);

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container as="main" maxW="container.lg">
                <Alert status="success" maxW="400px" rounded="lg" shadow="sm" mt={4}>
                    <AlertIcon />
                    You are now logged in!
                </Alert>
                <Code as="pre" mt={4}>
                    {JSON.stringify(user, null, 2)}
                </Code>
            </Container>
        </Box>
    );
}