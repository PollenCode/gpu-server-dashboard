import {
    Container,
    Box,
    Heading,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    HStack,
    Tbody,
    Td,
    Stack,
    Skeleton,
    Text,
    Badge,
    Select,
    ButtonGroup,
    IconButton,
    Tooltip,
    Button,
    TableCaption,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Switch,
} from "@chakra-ui/react";
import React, { useState } from "react";
import useSWR from "swr";
import { NavBar } from "../../components/NavBar";
import { fetcher } from "../../util";
import { ApprovalStatus, Task } from "@prisma/client";
import ms from "ms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronUp, faCircle, faComment, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { GetServerSideProps } from "next";
import { getSessionUser } from "../../auth";

const INFINITE_DATE = new Date();
INFINITE_DATE.setFullYear(3000);

export default function TasksPage() {
    const [onlyShowWaitingTasks, setOnlyShowWaitingTasks] = useState(true);
    const { data: tasks, mutate } = useSWR<Task[]>(
        "/api/task?to=" + encodeURIComponent(INFINITE_DATE.toISOString()) + "&waitingForApproval=" + onlyShowWaitingTasks,
        fetcher
    );

    async function setTaskApprovalStatus(taskId: number, approvalStatus: ApprovalStatus) {
        let res = await fetch("/api/task/" + taskId, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                approvalStatus: approvalStatus,
            }),
        });

        if (res.ok) {
            mutate();
        }
    }

    async function deleteTask(taskId: number) {
        if (!confirm("Ben je zeker dat je deze taak wilt verwijderen?")) {
            return;
        }

        let res = await fetch("/api/task/" + taskId, {
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

            <Container maxW="container.xl">
                <Heading my={4} as="h2" size="lg">
                    Toekomstige Taken
                </Heading>
                {tasks ? (
                    <Box border="1px solid" borderColor="gray.300" bgColor="white" rounded="lg">
                        <HStack p={[4]}>
                            <Switch isChecked={onlyShowWaitingTasks} onChange={(ev) => setOnlyShowWaitingTasks(ev.target.checked)} />
                            <Text>Enkel taken wachtend op goedkeuring weergeven</Text>
                        </HStack>

                        <TableContainer>
                            <Table variant="simple">
                                {tasks.length === 0 && <TableCaption my={4}>Geen taken om weer te geven.</TableCaption>}
                                <Thead>
                                    <Tr>
                                        <Th isNumeric>ID</Th>
                                        <Th>Naam</Th>
                                        <Th>Beschrijving</Th>
                                        <Th>GPU</Th>
                                        <Th>Starttijdstip</Th>
                                        <Th>Looptijd</Th>
                                        <Th>Status</Th>
                                        <Th></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {tasks.map((task) => (
                                        <Tr key={task.id}>
                                            <Td isNumeric>{task.id}</Td>
                                            <Td>{task.name}</Td>
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
                                            <Td>{task.gpus.join(", ")}</Td>
                                            <Td>{new Date(task.startDate).toLocaleString()}</Td>
                                            <Td>{ms(new Date(task.endDate).getTime() - new Date(task.startDate).getTime())}</Td>
                                            <Td>
                                                {task.approvalStatus === ApprovalStatus.Accepted && <Badge colorScheme="green">Goedgekeurd</Badge>}
                                                {task.approvalStatus === ApprovalStatus.Waiting && (
                                                    <Badge colorScheme="blue">Wachten op goedkeuring</Badge>
                                                )}
                                                {task.approvalStatus === ApprovalStatus.Denied && <Badge colorScheme="red">Afgekeurd</Badge>}
                                            </Td>
                                            <Td paddingY={0}>
                                                <ButtonGroup>
                                                    {task.approvalStatus === ApprovalStatus.Waiting && (
                                                        <Tooltip label="Goedkeuren">
                                                            <IconButton
                                                                onClick={() => setTaskApprovalStatus(task.id, "Accepted")}
                                                                size="sm"
                                                                aria-label="Goedkeuren"
                                                                colorScheme="green"
                                                                icon={<FontAwesomeIcon icon={faCheck} />}></IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {task.approvalStatus === ApprovalStatus.Waiting && (
                                                        <Tooltip label="Afkeuren">
                                                            <IconButton
                                                                onClick={() => setTaskApprovalStatus(task.id, "Denied")}
                                                                size="sm"
                                                                aria-label="Afkeuren"
                                                                colorScheme="red"
                                                                icon={<FontAwesomeIcon icon={faTimes} />}></IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {task.approvalStatus !== ApprovalStatus.Waiting && (
                                                        <Tooltip label="Goedkeuring ongedaan maken">
                                                            <IconButton
                                                                onClick={() => setTaskApprovalStatus(task.id, "Waiting")}
                                                                size="sm"
                                                                aria-label="Goedkeuring ongedaan maken"
                                                                icon={<FontAwesomeIcon icon={faTimes} />}></IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip label="Verwijderen">
                                                        <IconButton
                                                            onClick={() => deleteTask(task.id)}
                                                            size="sm"
                                                            aria-label="Afkeuren"
                                                            colorScheme="red"
                                                            icon={<FontAwesomeIcon icon={faTrash} />}></IconButton>
                                                    </Tooltip>
                                                </ButtonGroup>
                                            </Td>
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

    if (user.role === "User") {
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
