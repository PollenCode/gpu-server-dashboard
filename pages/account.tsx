import { User } from ".prisma/client";
import { Code, Container } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import React from "react";
import { getSessionUser } from "../auth";

export default function Account(props: { user: User }) {
    return (
        <Container maxW="container.lg">
            <Code as="pre">{JSON.stringify(props.user, null, 2)}</Code>
        </Container>
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
