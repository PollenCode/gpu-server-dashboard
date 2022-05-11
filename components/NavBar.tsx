import { Box, Container, Flex, Heading, Spacer } from "@chakra-ui/layout";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight, faCalendarAlt, faCircleNodes, faNetworkWired, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import useSWR from "swr";
import { fetcher, SERVER_URL } from "../util";
import Link from "next/link";

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
                            <Link href={"/app"}>
                                <Button colorScheme="blue" rightIcon={<FontAwesomeIcon icon={faCalendarAlt as IconProp} />}>
                                    Kalender
                                </Button>
                            </Link>
                            <Link href="/federated">
                                <Button colorScheme="blue" rightIcon={<FontAwesomeIcon icon={faCircleNodes as IconProp} />}>
                                    Federated Runtimes
                                </Button>
                            </Link>
                            <Link href="/api/logout">
                                <Button rightIcon={<FontAwesomeIcon icon={faSignOut as IconProp} />}>Logout</Button>
                            </Link>
                        </ButtonGroup>
                    ) : (
                        <Link href={SERVER_URL + "/api/oauth"}>
                            <Button colorScheme="blue" rightIcon={<FontAwesomeIcon icon={faArrowRight as IconProp} />}>
                                Log in
                            </Button>
                        </Link>
                    )}
                </Flex>
            </Container>
        </Box>
    );
}
