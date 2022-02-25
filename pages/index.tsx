import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    ButtonGroup,
    CloseButton,
    Container,
    FormControl,
    FormLabel,
    IconButton,
    Input,
} from "@chakra-ui/react";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Home() {
    return (
        <Container>
            <Box p={4} mt={8} shadow="md" rounded="lg">
                <form>
                    <FormControl isRequired>
                        <FormLabel>First name</FormLabel>
                        <Input />
                    </FormControl>
                    <FormControl mt={4} isRequired>
                        <FormLabel>Last name</FormLabel>
                        <Input />
                    </FormControl>
                    <Button colorScheme="blue" mt={4} w="full">
                        Submit
                    </Button>
                </form>
            </Box>
        </Container>
    );
}
