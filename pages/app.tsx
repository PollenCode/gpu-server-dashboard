import { Task } from ".prisma/client";
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
import { fetcher, GPU_COUNT } from "../util";
import { ReserveTaskForm } from "../components/ReserveTaskForm";
import { Scheduler } from "../components/Scheduler";

export default function App() {
    const { data: user, isValidating } = useSWR("/api/user", fetcher);
    const router = useRouter();
    const { data: tasks, mutate } = useSWR<Task[]>("/api/task", fetcher, { refreshInterval: 20000 });
    const now = new Date();
    const [jumpDateString, setJumpDateString] = useState("");
    const [startDay, setStartDay] = useState(now);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedTask, setSelectedTask] = useState<Task>();
    const { isOpen: drawerIsOpen, onOpen: drawerOnOpen, onClose: drawerOnClose } = useDisclosure();

    useEffect(() => {
        if (!isValidating && !user) {
            router.push("/");
        }
    }, [user, isValidating]);

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar />
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
                    <Button colorScheme="green" onClick={onOpen} rightIcon={<FontAwesomeIcon icon={faArrowRight as IconProp} />}>
                        Reserveren
                    </Button>
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

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Taak Reserveren</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ReserveTaskForm
                            onClose={() => {
                                mutate();
                                onClose();
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

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
