import { Box, Container, Flex, Heading, Spacer, Link } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import React from "react";
import { SERVER_URL } from "../util";

export function NavBar() {
    return (
        <Box as="header" borderBottom="1px" borderColor="gray.300" bg="white">
            <Container maxW="container.lg">
                <Flex alignItems="center" as="nav">
                    <Heading py={4} size="md">
                        GPU Manager
                    </Heading>
                    <Spacer />
                    <Link href={SERVER_URL + "/api/oauth"}>
                        <Button colorScheme="blue">Log in</Button>
                    </Link>
                </Flex>
            </Container>
        </Box>
    );
}
