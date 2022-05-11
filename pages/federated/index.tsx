import { FederatedRuntime } from ".prisma/client";
import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/accordion";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Button, ButtonGroup } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Badge, Box, Center, Code, Container, Heading, HStack, Link, Spacer, Stack, Text } from "@chakra-ui/layout";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/modal";
import { Skeleton } from "@chakra-ui/skeleton";
import { Spinner } from "@chakra-ui/spinner";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight, faArrowRightLong, faInfoCircle, faPlay, faPlus, faStop, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { NavBar } from "../../components/NavBar";
import { UserContext } from "../../UserContext";
import { fetcher } from "../../util";

function FederatedRuntimeDetails(props: { runtimeId: number; onClose: () => void }) {
    const { data: runtime, mutate } = useSWR<{
        federated: FederatedRuntime & {
            author: {
                id: number;
                role: number;
            } | null;
        };
        container?: any;
    }>("/api/federated/" + props.runtimeId, fetcher, {
        refreshInterval: 1000,
    });
    const [loading, setLoading] = useState<"stop" | "start" | "delete">();
    const user = useContext(UserContext);

    async function setRuntime(running: boolean) {
        setLoading(running ? "start" : "stop");
        let res = await fetch("/api/federated/" + props.runtimeId, {
            method: "POST",
            body: JSON.stringify({
                running: running,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        setLoading(undefined);

        if (res.ok) {
            mutate();
        }
    }

    async function deleteRuntime() {
        setLoading("delete");
        let res = await fetch("/api/federated/" + props.runtimeId, {
            method: "DELETE",
        });
        setLoading(undefined);

        if (res.ok) {
            props.onClose();
        }
    }

    if (!runtime) {
        return <Spinner />;
    }

    const hasRights = !runtime.federated.author || user.role > runtime.federated.author.role || user.id === runtime.federated.authorId;

    return (
        <Box>
            <Heading mt={2} size="md" as="h2">
                {runtime.federated.name}
            </Heading>
            <Text opacity={0.5}>(geen beschrijving)</Text>
            <Text opacity={1} mt={4}>
                Container met id <Code>{runtime.federated.containerId || "(geen)"}</Code>
            </Text>

            <Box my={4}>
                <ButtonGroup isAttached>
                    <Button
                        isLoading={loading === "start"}
                        onClick={() => setRuntime(true)}
                        isDisabled={!runtime.container || runtime.container.State.Running || loading !== undefined}
                        colorScheme="green"
                        leftIcon={<FontAwesomeIcon icon={faPlay as IconProp} />}>
                        Start container
                    </Button>
                    <Button
                        isLoading={loading === "stop"}
                        onClick={() => setRuntime(false)}
                        isDisabled={!runtime.container || !runtime.container.State.Running || loading !== undefined}
                        colorScheme="red"
                        leftIcon={<FontAwesomeIcon icon={faStop as IconProp} />}>
                        Stop container
                    </Button>
                </ButtonGroup>
            </Box>

            <Box my={4}>
                <ButtonGroup>
                    <Button
                        isLoading={loading === "delete"}
                        disabled={!hasRights || loading !== undefined}
                        onClick={() => deleteRuntime()}
                        colorScheme="red"
                        leftIcon={<FontAwesomeIcon icon={faTrash as IconProp} />}>
                        Verwijder
                    </Button>
                </ButtonGroup>
            </Box>

            <Accordion allowToggle>
                <AccordionItem>
                    <Heading as="h2" size="md">
                        <AccordionButton display="flex">
                            <Text>Toon Docker inspect</Text>
                            <Spacer />
                            <AccordionIcon />
                        </AccordionButton>
                    </Heading>
                    <AccordionPanel pb={4}>
                        <Code as="pre">{JSON.stringify(runtime.container, null, 2)}</Code>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    );
}

function NewFederatedRuntimeForm(props: { onClose: (runtime?: FederatedRuntime) => void }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit() {
        setLoading(true);

        await new Promise((res) => setTimeout(res, 500));

        let res = await fetch("/api/federated", {
            method: "POST",
            body: JSON.stringify({
                name: name,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        setLoading(false);

        if (res.ok) {
            props.onClose(await res.json());
        }
    }

    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                submit();
            }}>
            <FormControl isDisabled={loading}>
                <FormLabel>Naam</FormLabel>
                <Input autoFocus value={name} onChange={(ev) => setName(ev.target.value)} />
            </FormControl>
            <HStack mt={6} mb={4}>
                <Spacer />
                <Button isDisabled={loading} type="button" onClick={() => props.onClose()}>
                    Annuleren
                </Button>
                <Button colorScheme="green" isLoading={loading} isDisabled={loading}>
                    Aanmaken
                </Button>
            </HStack>
        </form>
    );
}

function FederatedRuntimeCard(props: { runtime: FederatedRuntime & { running?: boolean }; onClick: () => void }) {
    return (
        <HStack rounded="lg" p={4} background="white" my={4} border="1px solid" borderColor="gray.300">
            <Box>
                <Heading as="h3" size="md">
                    {props.runtime.name}{" "}
                    <Badge mb={1} colorScheme={props.runtime.running ? "green" : "red"}>
                        {props.runtime.running ? "loopt" : "gestopt"}
                    </Badge>
                </Heading>
                {props.runtime.port && (
                    <Text>
                        Adres en poort: <Code>{location.hostname + ":" + props.runtime.port}</Code>
                    </Text>
                )}
                <Text opacity={0.5}>(geen beschrijving)</Text>
            </Box>
            <Spacer />
            <Button colorScheme="blue" onClick={props.onClick} rightIcon={<FontAwesomeIcon icon={faArrowRight as IconProp} />}>
                Bekijk
            </Button>
        </HStack>
    );
}

export default function FederatedPage() {
    const { data: runtimes, mutate: mutateRuntimes } = useSWR<(FederatedRuntime & { running?: boolean })[]>("/api/federated", fetcher, {
        refreshInterval: 10000,
    });
    const [selectedRuntimeId, setSelectedRuntimeId] = useState<number>();
    const { onOpen: onOpenNew, onClose: onCloseNew, isOpen: isOpenNew } = useDisclosure();
    const { onOpen: onOpenDetails, onClose: onCloseDetails, isOpen: isOpenDetails } = useDisclosure();

    useEffect(() => {
        mutateRuntimes();
    }, [isOpenDetails]);

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container maxW="container.lg">
                <HStack mt={4}>
                    <Heading as="h2" size="lg">
                        Federated Runtimes
                    </Heading>

                    <Spacer />

                    <Button colorScheme="green" leftIcon={<FontAwesomeIcon icon={faPlus as IconProp} />} onClick={onOpenNew}>
                        New runtime
                    </Button>
                </HStack>

                {runtimes ? (
                    <Box>
                        {runtimes.map((runtime) => (
                            <FederatedRuntimeCard
                                key={runtime.id}
                                runtime={runtime}
                                onClick={() => {
                                    setSelectedRuntimeId(runtime.id);
                                    onOpenDetails();
                                }}
                            />
                        ))}
                        {runtimes.length === 0 && (
                            <Alert status="info" my={4}>
                                <AlertIcon>
                                    <FontAwesomeIcon icon={faInfoCircle as IconProp} />
                                </AlertIcon>
                                Er zijn nog geen federated runtimes.
                            </Alert>
                        )}
                    </Box>
                ) : (
                    <Stack my={4} gap={2}>
                        <Skeleton height="60px" />
                        <Skeleton height="60px" />
                        <Skeleton height="60px" />
                    </Stack>
                )}

                <Modal onClose={onCloseNew} isOpen={isOpenNew}>
                    <ModalOverlay />
                    <ModalContent pb={5}>
                        <ModalHeader>Nieuwe Federated Runtime</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <NewFederatedRuntimeForm
                                onClose={(newRuntime) => {
                                    if (runtimes && newRuntime) {
                                        mutateRuntimes([...runtimes, newRuntime as FederatedRuntime]);
                                        setSelectedRuntimeId(newRuntime.id);
                                        onOpenDetails();
                                    } else {
                                        mutateRuntimes();
                                    }
                                    onCloseNew();
                                }}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Container>

            <Drawer size="xl" isOpen={isOpenDetails} placement="right" onClose={onCloseDetails}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody>
                        <FederatedRuntimeDetails
                            onClose={() => {
                                onCloseDetails();
                            }}
                            runtimeId={selectedRuntimeId!}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
}
