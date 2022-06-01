import { User } from ".prisma/client";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    ButtonGroup,
    Text,
    Center,
    CloseButton,
    Code,
    Container,
    Grid,
    GridItem,
    Flex,
    Spinner,
} from "@chakra-ui/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import useSWR from "swr";
import { getSessionUser } from "../auth";
import { NavBar } from "../components/NavBar";
import { fetcher } from "../util";

export default function Index() {
    const { data } = useSWR("/api/serverStats", fetcher, { refreshInterval: 1000, dedupingInterval: 1000 });
    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container as="main" maxW="container.lg">
                <Grid mt={16} gap={16} templateColumns="repeat(3,1fr)" templateRows="300px 200px">
                    <GridItem
                        backgroundSize="contain"
                        backgroundRepeat="no-repeat"
                        backgroundPosition="center"
                        backgroundImage="url(/nvidiaA6000.png)"></GridItem>
                    <GridItem
                        backgroundSize="contain"
                        backgroundRepeat="no-repeat"
                        backgroundPosition="center"
                        backgroundImage="url(/nvidiaA6000.png)"></GridItem>
                    <GridItem
                        backgroundSize="contain"
                        backgroundRepeat="no-repeat"
                        backgroundPosition="center"
                        backgroundImage="url(/xeon.png)"></GridItem>
                    <GridItem justifyContent="center">
                        <Center flexDirection="column">
                            <Text fontSize="4xl" fontWeight="bold">
                                Nvidia A6000
                            </Text>
                            {data ? (
                                <>
                                    <Text fontSize="4xl" fontWeight="semibold">
                                        {data.gpu[0].temperature.toFixed(1)}°C
                                    </Text>
                                    <Text fontSize="4xl" fontWeight="semibold">
                                        {data.gpu[0].usage.toFixed(1)}%
                                    </Text>
                                </>
                            ) : (
                                <Spinner />
                            )}
                        </Center>
                    </GridItem>
                    <GridItem justifyContent="center">
                        <Center flexDirection="column">
                            <Text fontSize="4xl" fontWeight="bold">
                                Nvidia A6000
                            </Text>
                            {data ? (
                                <>
                                    <Text fontSize="4xl" fontWeight="semibold">
                                        {data.gpu[1].temperature.toFixed(1)}°C
                                    </Text>
                                    <Text fontSize="4xl" fontWeight="semibold">
                                        {data.gpu[1].usage.toFixed(1)}%
                                    </Text>
                                </>
                            ) : (
                                <Spinner />
                            )}
                        </Center>
                    </GridItem>
                    <GridItem>
                        <Center flexDirection="column">
                            <Text fontSize="4xl" fontWeight="bold">
                                Intel Xeon
                            </Text>
                            {data ? (
                                <>
                                    <Text fontSize="4xl" fontWeight="semibold">
                                        {data.cpu.temperature.toFixed(1)}°C
                                    </Text>
                                    <Text fontSize="4xl" fontWeight="semibold">
                                        {data.cpu.usage.toFixed(1)}%
                                    </Text>
                                </>
                            ) : (
                                <Spinner />
                            )}
                        </Center>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    let user = await getSessionUser(context.req, context.res);

    return {
        props: {
            user: user,
        },
    };
};
