import { User } from ".prisma/client";
import { Box, Code, Container, Heading, Stack } from "@chakra-ui/layout";
import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, Skeleton, IconButton, Select } from "@chakra-ui/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetServerSideProps } from "next";
import React, { useContext } from "react";
import useSWR from "swr";
import { getSessionUser } from "../../auth";
import { NavBar } from "../../components/NavBar";
import { UserContext } from "../../UserContext";
import { fetcher } from "../../util";

export default function UsersPage() {
    const currentUser = useContext(UserContext);
    const { data: users, mutate } = useSWR<User[]>("/api/user", fetcher);

    async function setRole(userId: number, role: string) {
        let res = await fetch("/api/user/" + userId, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                role: role,
            }),
        });

        if (res.ok) {
            mutate();
        }
    }

    async function deleteUser(userId: number) {
        if (!confirm("Ben je zeker dat je deze gebruiker wilt verwijderen? Alle gerelateerde taken zullen ook verwijderd worden.")) {
            return;
        }

        let res = await fetch("/api/user/" + userId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            mutate();
        }
    }

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />

            <Container maxW="container.lg">
                <Heading my={4} as="h2" size="lg">
                    Gebruikers
                </Heading>
                {users ? (
                    <TableContainer border="1px solid" borderColor="gray.300" bgColor="white" rounded="lg">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th isNumeric>ID</Th>
                                    <Th>Gebruikersnaam</Th>
                                    <Th>E-mail</Th>
                                    <Th>Rol</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users.map((user) => (
                                    <Tr key={user.id}>
                                        <Td isNumeric>{user.id}</Td>
                                        <Td>{user.userName}</Td>
                                        <Td>{user.email}</Td>
                                        <Td paddingY={0}>
                                            <Select
                                                isDisabled={user.id === currentUser.id}
                                                rounded="md"
                                                minW={24}
                                                size="sm"
                                                value={user.role}
                                                onChange={(ev) => setRole(user.id, ev.target.value)}>
                                                <option value="Administrator">Administrator</option>
                                                <option value="Moderator">Moderator</option>
                                                <option value="User">Gebruiker</option>
                                            </Select>
                                        </Td>
                                        <Td padding={0}>
                                            <IconButton
                                                isDisabled={user.id === currentUser.id}
                                                onClick={() => deleteUser(user.id)}
                                                size="sm"
                                                colorScheme="red"
                                                aria-label="Delete user"
                                                icon={<FontAwesomeIcon icon={faTrash} />}></IconButton>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Stack my={4} gap={2}>
                        <Skeleton height="60px" />
                        <Skeleton height="60px" />
                        <Skeleton height="60px" />
                    </Stack>
                )}
            </Container>
        </Box>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    let user = await getSessionUser(context.req, context.res);

    if (!user) {
        return {
            redirect: {
                permanent: false,
                destination: "/api/oauth",
            },
        };
    }

    if (user.role !== "Administrator") {
        return {
            redirect: {
                permanent: false,
                destination: "/app",
            },
        };
    }

    return {
        props: {
            user: user,
        },
    };
};
