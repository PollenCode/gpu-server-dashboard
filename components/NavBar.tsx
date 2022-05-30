import { Box, Container, Flex, Heading, Spacer } from "@chakra-ui/layout";
import { Button, ButtonGroup, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
    faArrowRight,
    faCalendarAlt,
    faCircleNodes,
    faNetworkWired,
    faSignOut,
    faMicrochip,
    faUsers,
    faTools,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "../util";
import Link from "next/link";
import { Role, User } from ".prisma/client";
import { UserContext } from "../UserContext";

export function NavBar() {
    const user = useContext(UserContext);
    const router = useRouter();
    return (
        <Box as="header" borderBottom="1px" borderColor="gray.300" bg="white">
            <Container maxW="container.lg">
                <Flex alignItems="center" as="nav">
                    <Box fontSize="2xl" mr={2}>
                        <FontAwesomeIcon icon={faMicrochip} />
                    </Box>
                    <Link href="/">
                        <Heading py={4} size="md">
                            GPU Manager
                        </Heading>
                    </Link>
                    <Spacer />
                    {user ? (
                        <ButtonGroup>
                            <Link href="/app">
                                <Button colorScheme="blue" rightIcon={<FontAwesomeIcon icon={faCalendarAlt as IconProp} />}>
                                    Kalender
                                </Button>
                            </Link>

                            {user.role !== Role.User && (
                                <Menu>
                                    <MenuButton colorScheme="orange" as={Button} rightIcon={<FontAwesomeIcon icon={faChevronDown} />}>
                                        {user.role}
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem
                                            icon={<FontAwesomeIcon icon={faCircleNodes as IconProp} />}
                                            onClick={() => router.push("/admin/federated")}>
                                            Federated Runtimes
                                        </MenuItem>
                                        <MenuItem icon={<FontAwesomeIcon icon={faUsers as IconProp} />} onClick={() => router.push("/admin/users")}>
                                            Gebruikers
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            )}
                            <Link href="/api/logout">
                                <Button rightIcon={<FontAwesomeIcon icon={faSignOut as IconProp} />}>Uitloggen</Button>
                            </Link>
                        </ButtonGroup>
                    ) : (
                        <Link href="/api/oauth">
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
