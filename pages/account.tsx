import { User, Task } from ".prisma/client";
import {
    Avatar,
    Box,
    Code,
    Container,
    Text,
    HStack,
    Spacer,
    Button,
    Badge,
    ButtonGroup,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Skeleton,
    Stack,
    Link as ChakraLink,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tooltip,
    Tr,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import React, { useContext } from "react";
import { getSessionUser } from "../auth";
import { NavBar } from "../components/NavBar";
import { UserContext } from "../UserContext";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faComment, faEye, faSign, faSignOut, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import { fetcher } from "../util";
import { ApprovalStatus } from "@prisma/client";
import ms from "ms";

export default function Account() {
    const user = useContext(UserContext);
    const { data: tasks } = useSWR<Task[]>("/api/user/tasks", fetcher);
    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container maxW="container.lg">
                <HStack my={4}>
                    <Avatar name={user.userName} />{" "}
                    <Box>
                        <Text>{user.userName}</Text>
                        <Text mt={-1.5} fontSize="sm" opacity={0.5}>
                            {user.email}
                        </Text>
                    </Box>
                    <Spacer />
                    <Link href="/api/logout">
                        <Button colorScheme="red" rightIcon={<FontAwesomeIcon icon={faSignOut} />}>
                            Uitloggen
                        </Button>
                    </Link>
                </HStack>

                {tasks ? (
                    <Box border="1px solid" borderColor="gray.300" bgColor="white" rounded="lg">
                        <TableContainer>
                            <Table variant="simple">
                                {tasks.length === 0 && <TableCaption my={4}>Geen taken om weer te geven.</TableCaption>}
                                <Thead>
                                    <Tr>
                                        <Th isNumeric>ID</Th>
                                        <Th>Naam</Th>
                                        <Th>Beschrijving</Th>
                                        <Th>Status</Th>
                                        <Th>Starttijdstip</Th>
                                        <Th>Looptijd</Th>
                                        <Th>GPU</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {tasks.map((task) => (
                                        <Tr key={task.id}>
                                            <Td isNumeric>{task.id}</Td>
                                            <Td textColor="blue.500" textDecoration="underline">
                                                <ChakraLink as={Link} href={`/app?selectedTaskId=${encodeURIComponent(task.id)}`}>
                                                    {task.name}
                                                </ChakraLink>
                                            </Td>

                                            <Td paddingY={0}>
                                                {task.description ? (
                                                    <Popover>
                                                        <PopoverTrigger>
                                                            <IconButton
                                                                size="sm"
                                                                aria-label="Beschrijving"
                                                                icon={<FontAwesomeIcon icon={faComment} />}
                                                            />
                                                        </PopoverTrigger>
                                                        <PopoverContent>
                                                            <PopoverArrow />
                                                            <PopoverCloseButton />
                                                            <PopoverHeader>Beschrijving</PopoverHeader>
                                                            <PopoverBody>{task.description}</PopoverBody>
                                                        </PopoverContent>
                                                    </Popover>
                                                ) : (
                                                    <>(geen)</>
                                                )}
                                            </Td>
                                            <Td>
                                                {task.approvalStatus === ApprovalStatus.Accepted && <Badge colorScheme="green">Goedgekeurd</Badge>}
                                                {task.approvalStatus === ApprovalStatus.Waiting && (
                                                    <Badge colorScheme="blue">Wachten op goedkeuring</Badge>
                                                )}
                                                {task.approvalStatus === ApprovalStatus.Denied && <Badge colorScheme="red">Afgekeurd</Badge>}
                                            </Td>
                                            <Td>{new Date(task.startDate).toLocaleString()}</Td>
                                            <Td>{ms(new Date(task.endDate).getTime() - new Date(task.startDate).getTime())}</Td>
                                            <Td>{task.gpus.join(", ")}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
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

    return {
        props: {
            user: user,
        },
    };
};
