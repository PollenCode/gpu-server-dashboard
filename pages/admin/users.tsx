import { Box, Code, Container } from "@chakra-ui/layout";
import { GetServerSideProps } from "next";
import React from "react";
import useSWR from "swr";
import { getSessionUser } from "../../auth";
import { NavBar } from "../../components/NavBar";
import { fetcher } from "../../util";

export default function UsersPage() {
    const { data: users } = useSWR("/api/user", fetcher);

    return (
        <Box>
            <NavBar />
            <Container maxW="container.md">
                <Code as="pre">{JSON.stringify(users, null, 2)}</Code>
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
