import { Task } from ".prisma/client";
import { Text, Box, Code, Heading, Badge } from "@chakra-ui/layout";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, ButtonGroup, Spinner } from "@chakra-ui/react";
import React from "react";
import useSWR from "swr";
import { fetcher } from "../util";
import Link from "next/link";
import ms from "ms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faExternalLink, faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useRouter } from "next/router";

export function TaskDetails(props: { taskId: number }) {
    const { data: task } = useSWR<Task>("/api/task/" + props.taskId, fetcher, { refreshInterval: 10000 });

    if (!task) {
        return <Spinner />;
    }

    const router = useRouter();
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
                        <Button colorScheme="red">Taak annuleren</Button>
                    </ButtonGroup>
                </Box>
            )}

            {status === "running" && (
                <Box>
                    <Text>
                        Deze taak is nu bezig, je hebt nog{" "}
                        <Text fontWeight="semibold" as="span">
                            {ms(endDate.getTime() - now.getTime())}
                        </Text>{" "}
                        voordat deze taak word beëindigd.
                    </Text>
                    <Alert mt={4} status="warning" rounded="lg">
                        <AlertIcon />
                        Wanneer je taak beëindigd word, word je model niet automatisch opgeslagen. Zorg dat je code hiervoor gepast is.
                    </Alert>
                    <Box>
                        <Link passHref href={`http://${location.hostname}:${task.notebookPort}/?token=${encodeURIComponent(task.notebookToken)}`}>
                            <a target="_blank">
                                <Button mt={4} colorScheme="orange" rightIcon={<FontAwesomeIcon icon={faExternalLink as IconProp} />}>
                                    Naar Jupyter Notebook
                                </Button>
                            </a>
                        </Link>
                    </Box>
                    <ButtonGroup mt={4}>
                        <Button colorScheme="red" leftIcon={<FontAwesomeIcon icon={faTrash as IconProp} />}>
                            Taak annuleren
                        </Button>
                        <Button isDisabled colorScheme="red" leftIcon={<FontAwesomeIcon icon={faArrowRotateLeft as IconProp} />}>
                            Opnieuw opstarten
                        </Button>
                    </ButtonGroup>
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

                    <ButtonGroup mt={4}>
                        <Button colorScheme="green">Taak opnieuw inplannen</Button>
                    </ButtonGroup>
                </Box>
            )}

            <Code mt={4} as="pre">
                {JSON.stringify(task, null, 2)}
            </Code>
        </Box>
    );
}
