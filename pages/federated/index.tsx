import { FederatedRuntime } from ".prisma/client";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Code, Container, Heading, HStack, Link, Spacer, Stack, Text } from "@chakra-ui/layout";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/modal";
import { Skeleton } from "@chakra-ui/skeleton";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import useSWR from "swr";
import { NavBar } from "../../components/NavBar";
import { fetcher } from "../../util";

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
                <Button isDisabled={loading} type="button" variant="ghost" onClick={() => props.onClose()}>
                    Annuleren
                </Button>
                <Button colorScheme="green" isLoading={loading} isDisabled={loading}>
                    Aanmaken
                </Button>
            </HStack>
        </form>
    );
}

function FederatedRuntimeCard(props: { runtime: FederatedRuntime }) {
    return (
        <Box rounded="lg" p={4} background="white" my={4}>
            <Heading as="h3" size="md">
                {props.runtime.name}
            </Heading>
            <Text>
                Container <Code>{props.runtime.containerId}</Code>
            </Text>
        </Box>
    );
}

export default function FederatedPage() {
    const { data: runtimes, mutate: mutateRuntimes } = useSWR<FederatedRuntime[]>("/api/federated", fetcher);
    const { onOpen, onClose, isOpen } = useDisclosure();

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container maxW="container.lg">
                <HStack mt={4}>
                    <Heading as="h2" size="lg">
                        Federated Runtimes
                    </Heading>

                    <Spacer />

                    <Button colorScheme="green" leftIcon={<FontAwesomeIcon icon={faPlus as IconProp} />} onClick={onOpen}>
                        New runtime
                    </Button>
                </HStack>

                {runtimes ? (
                    <Box>
                        {runtimes.map((runtime) => (
                            <FederatedRuntimeCard key={runtime.id} runtime={runtime} />
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
                    <Stack>
                        <Skeleton my={4} height="60px" />
                        <Skeleton my={4} height="60px" />
                        <Skeleton my={4} height="60px" />
                    </Stack>
                )}

                <Modal onClose={onClose} isOpen={isOpen}>
                    <ModalOverlay />
                    <ModalContent pb={5}>
                        <ModalHeader>Login now</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <NewFederatedRuntimeForm
                                onClose={(newRuntime) => {
                                    if (runtimes && newRuntime) {
                                        mutateRuntimes([...runtimes, newRuntime]);
                                    } else {
                                        mutateRuntimes();
                                    }
                                    onClose();
                                }}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Container>
        </Box>
    );
}
