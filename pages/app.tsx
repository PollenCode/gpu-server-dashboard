import { Task, User } from ".prisma/client";
import {
    Text,
    Box,
    Container,
    Alert,
    AlertIcon,
    Code,
    Button,
    Heading,
    HStack,
    Center,
    Grid,
    GridItem,
    Flex,
    ButtonGroup,
    Spacer,
    Link,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Portal,
    FormControl,
    Input,
    Spinner,
    Badge,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Tooltip,
    FormLabel,
    FormHelperText,
    Switch,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
    faArrowLeft,
    faArrowRight,
    faCalendar,
    faCalendarAlt,
    faChevronLeft,
    faExternalLink,
    faRotateLeft,
    faVial,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { NavBar } from "../components/NavBar";
import { TaskDetails } from "../components/TaskDetails";
import { UserContext } from "../UserContext";
import { fetcher } from "../util";
import { ReserveTaskForm } from "../components/ReserveTaskForm";
import { Scheduler } from "../components/Scheduler";
import { GetServerSideProps } from "next";
import { getSessionUser } from "../auth";

export default function App(props: { user: User }) {
    const router = useRouter();
    const { data: tasks, mutate } = useSWR<Task[]>("/api/task", fetcher, { refreshInterval: 20000 });
    const now = new Date();
    const [jumpDateString, setJumpDateString] = useState("");
    const [startDay, setStartDay] = useState(now);
    const [selectedTask, setSelectedTask] = useState<Task>();
    const { isOpen: drawerIsOpen, onOpen: drawerOnOpen, onClose: drawerOnClose } = useDisclosure();

    useEffect(() => {
        let urlSelectedTaskId = parseInt(String(router.query.selectedTaskId));
        if (tasks && selectedTask === undefined && !isNaN(urlSelectedTaskId)) {
            setSelectedTask(tasks.find((e) => e.id === urlSelectedTaskId));
            drawerOnOpen();
        }
    }, [tasks, selectedTask, router.query.selectedTaskId]);

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar user={props.user} />
            <Container maxWidth="max-content">
                <HStack mt={4}>
                    <Button
                        colorScheme="blue"
                        onClick={() => setStartDay(new Date(startDay.getTime() - 1000 * 60 * 60 * 24 * 7))}
                        leftIcon={<FontAwesomeIcon icon={faArrowLeft as IconProp} />}>
                        Vorige week
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={() => setStartDay(new Date(startDay.getTime() + 1000 * 60 * 60 * 24 * 7))}
                        rightIcon={<FontAwesomeIcon icon={faArrowRight as IconProp} />}>
                        Volgende week
                    </Button>
                    <Popover>
                        <PopoverTrigger>
                            <Button variant="outline" colorScheme="blue" rightIcon={<FontAwesomeIcon icon={faCalendarAlt as IconProp} />}>
                                Spring naar
                            </Button>
                        </PopoverTrigger>
                        <Box>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader>Selecteer een datum</PopoverHeader>
                                <PopoverBody>
                                    <form
                                        onSubmit={(ev) => {
                                            ev.preventDefault();
                                            let date = new Date(jumpDateString);

                                            // Check if date is valid
                                            if (!isNaN(date.getTime())) {
                                                setStartDay(date);
                                            }
                                        }}>
                                        <HStack>
                                            <Input value={jumpDateString} onChange={(ev) => setJumpDateString(ev.target.value)} type="date" />
                                            <Button type="submit">Ga</Button>
                                        </HStack>
                                    </form>
                                </PopoverBody>
                            </PopoverContent>
                        </Box>
                    </Popover>
                    <Button
                        hidden={
                            startDay.getDate() == now.getDate() &&
                            startDay.getMonth() == now.getMonth() &&
                            startDay.getFullYear() == now.getFullYear()
                        }
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => setStartDay(now)}
                        rightIcon={<FontAwesomeIcon icon={faRotateLeft as IconProp} />}>
                        Naar nu
                    </Button>
                    {!tasks && <Spinner />}
                    <Spacer />
                    <NextLink href="/reserve">
                        <Button colorScheme="green" rightIcon={<FontAwesomeIcon icon={faArrowRight as IconProp} />}>
                            Reserveren
                        </Button>
                    </NextLink>
                </HStack>
                <Scheduler
                    onClick={(task) => {
                        setSelectedTask(task);
                        drawerOnOpen();
                    }}
                    weekDay={startDay}
                    tasks={tasks || []}
                    loading={!tasks}
                />
            </Container>

            <Drawer size="xl" isOpen={drawerIsOpen} placement="right" onClose={drawerOnClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody>
                        {selectedTask && (
                            <TaskDetails
                                onClose={() => {
                                    drawerOnClose();
                                    mutate();
                                }}
                                taskId={selectedTask.id}
                            />
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
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

    return {
        props: {
            user: user,
        },
    };
};
