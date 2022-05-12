import { Task, User } from ".prisma/client";
import { Text, Box, Code, Heading, Badge, HStack, Link as ChakraLink } from "@chakra-ui/layout";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Avatar,
    Button,
    ButtonGroup,
    Spinner,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../util";
import Link from "next/link";
import ms from "ms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faExternalLink, faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useRouter } from "next/router";
import { UserContext } from "../UserContext";

export function TaskLogs(props: { taskId: number }) {
    return <Box>these are thee lgos</Box>;
}

export function TaskDetails(props: { taskId: number; onClose: () => void }) {
    const { data: task } = useSWR<Task & { owner?: User }>("/api/task/" + props.taskId, fetcher, { refreshInterval: 10000 });
    const user = useContext(UserContext);
    const router = useRouter();
    const [logs, setLogs] = useState<string>();

    async function fetchLogs() {
        let res = await fetch("/api/task/logs/" + props.taskId);
        if (res.ok) {
            let l = await res.text();
            setLogs(l.trim());
        }
    }

    async function deleteTask() {
        let res = await fetch("/api/task/" + props.taskId, {
            method: "DELETE",
        });

        if (res.ok) {
            props.onClose();
        }
    }

    if (!task) {
        return <Spinner />;
    }

    const hasAccess = task.ownerId === user.id;
    const now = new Date();
    const startDate = new Date(task.startDate!);
    const endDate = new Date(task.endDate!);
    const taskMilliseconds = endDate.getTime() - startDate.getTime();

    let status;
    if (startDate.getTime() <= now.getTime() && endDate.getTime() > now.getTime()) {
        status = "running";
    } else if (now.getTime() > endDate.getTime()) {
        status = "complete";
    } else {
        status = "waiting";
    }

    return (
        <Box>
            <Heading size="md" as="h2" mb={4} mt={2} fontWeight="semibold">
                {task.name}
                <Badge
                    ml={2}
                    display="inline-block"
                    p={0.5}
                    rounded="md"
                    colorScheme={status === "running" ? "green" : status === "waiting" ? "blue" : "red"}>
                    {status === "running" && (
                        <>
                            <Spinner size="xs" />{" "}
                        </>
                    )}
                    {status === "waiting" && <>Wachten</>}
                    {status === "running" && <>Lopend</>}
                    {status === "complete" && <>Afgelopen</>}
                </Badge>
            </Heading>

            {!hasAccess && task.owner && (
                <Box my={4}>
                    <HStack>
                        <Text>Door</Text>
                        <Avatar size="xs" name={task.owner.userName} title={task.owner.email} />
                        <ChakraLink isExternal href={"mailto:" + task.owner.email}>
                            <Text fontWeight="semibold">{task.owner.userName}</Text>
                        </ChakraLink>
                    </HStack>
                </Box>
            )}

            {hasAccess && (
                <Box my={4} opacity={0.5}>
                    {task.description || "(geen beschrijving)"}
                </Box>
            )}

            {status === "waiting" && (
                <Box>
                    <Text>
                        Deze taak start binnen{" "}
                        <Text as="span" fontWeight="semibold">
                            {ms(startDate.getTime() - now.getTime())}
                        </Text>
                        , op{" "}
                        <Text as="span" fontWeight="semibold">
                            {startDate.toLocaleString()}
                        </Text>
                        .
                    </Text>
                    <ButtonGroup mt={4}>
                        {hasAccess && (
                            <Button onClick={deleteTask} leftIcon={<FontAwesomeIcon icon={faTrash as IconProp} />} colorScheme="red">
                                Taak annuleren
                            </Button>
                        )}
                    </ButtonGroup>
                </Box>
            )}

            {status === "running" && (
                <Box>
                    <Text>
                        Deze taak is nu bezig, nog{" "}
                        <Text fontWeight="semibold" as="span">
                            {ms(endDate.getTime() - now.getTime())}
                        </Text>{" "}
                        voordat deze taak word beëindigd.
                    </Text>
                    {hasAccess && (
                        <Alert mt={4} status="warning" rounded="lg">
                            <AlertIcon />
                            Wanneer je taak beëindigd word, word je model niet automatisch opgeslagen. Zorg dat je code hiervoor aangepast is.
                        </Alert>
                    )}
                    {task.notebookPort && task.notebookToken && (
                        <Box>
                            <Link passHref href={`http://${location.hostname}:${task.notebookPort}/?token=${encodeURIComponent(task.notebookToken)}`}>
                                <a target="_blank">
                                    <Button mt={4} colorScheme="orange" rightIcon={<FontAwesomeIcon icon={faExternalLink as IconProp} />}>
                                        Naar Jupyter Notebook
                                    </Button>
                                </a>
                            </Link>
                        </Box>
                    )}
                    {hasAccess && (
                        <ButtonGroup mt={4}>
                            <Button onClick={deleteTask} colorScheme="red" leftIcon={<FontAwesomeIcon icon={faTrash as IconProp} />}>
                                Taak annuleren
                            </Button>
                            <Button isDisabled colorScheme="red" leftIcon={<FontAwesomeIcon icon={faArrowRotateLeft as IconProp} />}>
                                Opnieuw opstarten
                            </Button>
                        </ButtonGroup>
                    )}
                </Box>
            )}

            {status === "complete" && (
                <Box>
                    <Text>
                        Deze taak is afgelopen op{" "}
                        <Text as="span" fontWeight="semibold">
                            {endDate.toLocaleString()}
                        </Text>
                        .
                    </Text>

                    {hasAccess && (
                        <ButtonGroup mt={4}>
                            <Button isDisabled colorScheme="green">
                                Taak opnieuw inplannen
                            </Button>
                        </ButtonGroup>
                    )}
                </Box>
            )}

            {hasAccess && status !== "waiting" && (
                <Accordion allowToggle my={4}>
                    <AccordionItem>
                        <h2>
                            <AccordionButton onClick={() => fetchLogs()}>
                                <Box flex="1" textAlign="left">
                                    Toon logboek
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>{logs ? <Code as="pre">{logs}</Code> : <Text>(geen)</Text>}</AccordionPanel>
                    </AccordionItem>
                </Accordion>
            )}

            {/* <Code mt={4} as="pre">
                {JSON.stringify(task, null, 2)}
            </Code> */}
        </Box>
    );
}
