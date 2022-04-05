import { Text, Box, Container, Alert, AlertIcon, Code, Button, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import useSWR from "swr";
import { NavBar } from "../components/NavBar";
import { fetcher, SERVER_URL } from "../util";

export default function App() {
    const { data: user, isValidating } = useSWR(SERVER_URL + "/api/user", fetcher);
    const router = useRouter();
    const { data: tasks, mutate } = useSWR(SERVER_URL + "/api/task", fetcher, { refreshInterval: 1000 });

    async function createTaskTest() {
        let name = prompt("Enter name for task");
        if (!name) return;

        let res = await fetch(SERVER_URL + "/api/task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                description: "This is a testing task.",
                trainMinutes: 45,
                allGpus: false,
            }),
        });
        if (res.ok) {
            console.log("New task", await res.json());
            mutate();
        } else {
            console.error("Error while creating task", await res.text());
        }
    }

    useEffect(() => {
        if (!isValidating && !user) {
            router.push("/");
        }
    }, [user, isValidating]);

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container>
                {tasks &&
                    tasks.map((t: any) => (
                        <Box key={t.id} p={4} bg="white" rounded="lg" my={4} position="relative" minH="90px">
                            <Heading as="h3" size="md">
                                {t.name}
                            </Heading>
                            {t.description && (
                                <Text fontSize="xs" color="gray.400">
                                    {t.description}
                                </Text>
                            )}
                            <Box position="absolute" right={4} top={3} textAlign="right" color="gray.600">
                                <Text fontSize="sm">{new Date(t.startDate).toLocaleDateString()}</Text>
                                <Text fontSize="sm">
                                    {new Date(t.startDate).toLocaleTimeString()}-{new Date(t.endDate).toLocaleTimeString()}
                                </Text>
                                <Text fontSize="sm">{t.gpus.length > 1 ? <>On GPUs {t.gpus.join(", ")}</> : <>On GPU {t.gpus[0]}</>}</Text>
                            </Box>
                        </Box>
                    ))}
                <Button colorScheme="blue" onClick={createTaskTest}>
                    Create task
                </Button>
            </Container>
        </Box>
    );
}
