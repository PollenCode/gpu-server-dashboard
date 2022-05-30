import { Role, User } from ".prisma/client";
import { Box, Container, Heading } from "@chakra-ui/layout";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import { getSessionUser } from "../auth";
import { NavBar } from "../components/NavBar";
import { ReserveTaskForm } from "../components/ReserveTaskForm";
import { getSetting, SETTING_GPU_COUNT, SETTING_MAX_TIME_BEFORE_APPROVAL, SETTING_MULTI_GPU_APPROVAL } from "../db";

export default function ReservePage(props: { user: User; maxTimeBeforeApproval: number; multiGpuApproval: boolean; gpuCount: number }) {
    const router = useRouter();
    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
            <Container maxW="container.md">
                <Heading my={[4, 6]} as="h2" size="lg">
                    Tijdslot Aanvragen
                </Heading>
                <Box bgColor="white" p={[4, 8]} rounded="lg" border="1px solid" borderColor="gray.300">
                    <ReserveTaskForm
                        gpuCount={props.gpuCount}
                        noApproval={props.user.role !== Role.User}
                        maxTimeBeforeApproval={props.maxTimeBeforeApproval}
                        multiGpuApproval={props.multiGpuApproval}
                        onDone={(id) => router.push(id ? "/app?selectedTaskId=" + encodeURIComponent(id) : "/app")}
                    />
                </Box>
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

    let [maxTimeBeforeApproval, gpuCount, multiGpuApproval] = await Promise.all([
        getSetting<number>(SETTING_MAX_TIME_BEFORE_APPROVAL),
        getSetting<number>(SETTING_GPU_COUNT),
        getSetting<boolean>(SETTING_MULTI_GPU_APPROVAL),
    ]);

    return {
        props: {
            user: user,
            maxTimeBeforeApproval,
            gpuCount,
            multiGpuApproval,
        },
    };
};
