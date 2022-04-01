import { Box, Container, Flex, Heading, Spacer, Link } from "@chakra-ui/layout";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import useSWR from "swr";
import { fetcher, SERVER_URL } from "../util";

export function NavBar() {
    const { data: user } = useSWR(SERVER_URL + "/api/user", fetcher);
    const router = useRouter();

    return (
        <Box as="header" borderBottom="1px" borderColor="gray.300" bg="white">
            <Container maxW="container.lg">
                <Flex alignItems="center" as="nav">
                    <Link href="/">
                        <Heading py={4} size="md">
                            GPU Manager
                        </Heading>
                    </Link>
                    <Spacer />
                    {user ? (
                        <ButtonGroup>
                            <Link href="/api/logout">
                                <Button>Logout</Button>
                            </Link>
                            {!router.asPath.startsWith("/app") && (
                                <Link href={"/app"}>
                                    <Button colorScheme="blue" rightIcon={<FontAwesomeIcon icon={faArrowRight as any} />}>
                                        To app
                                    </Button>
                                </Link>
                            )}
                        </ButtonGroup>
                    ) : (
                        <Link href={SERVER_URL + "/api/oauth"}>
                            <Button colorScheme="blue" rightIcon={<FontAwesomeIcon icon={faArrowRight as any} />}>
                                Log in
                            </Button>
                        </Link>
                    )}
                </Flex>
            </Container>
        </Box>
    );
}
