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
} from "@chakra-ui/react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faArrowRight, faCalendar, faCalendarAlt, faRotateLeft, faVial } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { NavBar } from "../components/NavBar";
import { UserContext } from "../UserContext";
import { fetcher, GPU_COUNT, SERVER_URL } from "../util";

const GPU_COLORS = ["red.500", "green.500", "orange.500", "purple.500"];
const DAYS_OF_WEEK = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const PIXELS_PER_HOUR = 22;

function SchedulerNowIndicator() {
    const hour = new Date().getHours() + new Date().getMinutes() / 60;
    return (
        <Box
            position="absolute"
            top={hour * PIXELS_PER_HOUR}
            left={0}
            w="full"
            pointerEvents="none"
            style={{ boxShadow: "0px 0px 10px black" }}
            zIndex={5}
            height="2px"
            rounded="lg"
            backgroundColor="blue.300"></Box>
    );
}

function SchedulerTask(props: { task: Task; dayStart: Date; dayEnd: Date; color?: string }) {
    const user = useContext(UserContext);
    let startHour, endHour;

    if (new Date(props.task.startDate!).getTime() < props.dayStart.getTime()) {
        // This task started on another day
        startHour = 0;
    } else {
        startHour = new Date(props.task.startDate!).getHours();
    }

    if (new Date(props.task.endDate!).getTime() > props.dayEnd.getTime()) {
        // This task will end on another day
        endHour = 24;
    } else {
        endHour = new Date(props.task.endDate!).getHours();
    }

    let now = new Date();
    let busy = new Date(props.task.startDate!).getTime() <= now.getTime() && new Date(props.task.endDate!).getTime() > now.getTime();

    return (
        <Link href={"/task/" + props.task.id}>
            <Box
                top={startHour * PIXELS_PER_HOUR}
                height={(endHour - startHour) * PIXELS_PER_HOUR + "px"}
                border="1px solid #ffffff44"
                left={0}
                background={props.color || "red.500"}
                textColor="white"
                p={1}
                lineHeight="4"
                rounded="md"
                w="full"
                position="absolute"
                overflow="hidden"
                zIndex={3}
                cursor="pointer"
                transition="150ms"
                _hover={{ opacity: 0.8, zIndex: 4 }}>
                {endHour - startHour >= 2 && (
                    <>
                        <Text>
                            {busy && <Spinner size="xs" />} {props.task.name}
                        </Text>
                        <Text opacity={0.6} fontSize="xs">
                            {(props.task as any).owner?.userName}
                        </Text>
                        {(props.task as any).owner?.id === user?.id && (
                            <Badge colorScheme="gray" mt={0.5}>
                                Jouw taak
                            </Badge>
                        )}
                    </>
                )}
            </Box>
        </Link>
    );
}

function Scheduler(props: { tasks: Task[]; weekDay?: Date; loading?: boolean }) {
    let startOfWeek = props.weekDay ? new Date(props.weekDay) : new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setSeconds(0);
    startOfWeek.setMinutes(0);
    startOfWeek.setHours(0);

    return (
        <Grid templateColumns="repeat(7, auto)" overflow="auto" gap={4} my={4}>
            {new Array(7).fill(0).map((_, dayIndex) => {
                let dayStart = new Date(startOfWeek.getTime() + dayIndex * 24 * 60 * 60 * 1000);
                let dayEnd = new Date(startOfWeek.getTime() + (dayIndex + 1) * 24 * 60 * 60 * 1000);

                let tasksToday = props.tasks.filter(
                    (task) =>
                        (new Date(task.startDate!).getTime() >= dayStart.getTime() && new Date(task.startDate!).getTime() < dayEnd.getTime()) ||
                        (new Date(task.endDate!).getTime() >= dayStart.getTime() && new Date(task.endDate!).getTime() < dayEnd.getTime())
                );

                let now = new Date();
                let isToday = now.getTime() >= dayStart.getTime() && now.getTime() < dayEnd.getTime();

                let perGpu = {} as any;
                tasksToday.forEach((task) => {
                    task.gpus.forEach((gpuId) => {
                        if (!(gpuId in perGpu)) {
                            perGpu[gpuId] = [];
                        }
                        perGpu[gpuId].push(task);
                    });
                });

                return (
                    <GridItem
                        m={0.5}
                        key={dayIndex}
                        opacity={props.loading ? 0.7 : 1}
                        transition="200ms"
                        overflow="hidden"
                        borderRadius="lg"
                        background="white"
                        minWidth="200px"
                        border={isToday ? "3px solid" : "1px solid"}
                        borderColor={isToday ? "blue.500" : "gray.300"}>
                        <Heading as="h3" size="sm" borderBottom="1px solid" borderBottomColor="gray.300" p={4}>
                            {DAYS_OF_WEEK[dayIndex]}{" "}
                            <Text fontWeight="normal" as="span" fontSize="sm">
                                {dayStart.toLocaleDateString()}
                            </Text>
                        </Heading>

                        <Flex>
                            {new Array(2).fill(0).map((_, gpuIndex) => (
                                <Box flexGrow={1} key={gpuIndex} position="relative">
                                    {new Array(24).fill(0).map((_, hour) => (
                                        <Box key={hour} borderBottom="1px solid" borderColor="gray.100" h={PIXELS_PER_HOUR + "px"}></Box>
                                    ))}
                                    {perGpu[gpuIndex]?.map((task: Task) => (
                                        <SchedulerTask dayStart={dayStart} dayEnd={dayEnd} color={GPU_COLORS[gpuIndex]} task={task} key={task.id} />
                                    ))}
                                    {isToday && <SchedulerNowIndicator />}
                                </Box>
                            ))}
                        </Flex>
                    </GridItem>
                );
            })}
        </Grid>
    );
}

export default function App() {
    const { data: user, isValidating } = useSWR(SERVER_URL + "/api/user", fetcher);
    const router = useRouter();
    const { data: tasks, mutate } = useSWR<Task[]>(SERVER_URL + "/api/task", fetcher, { refreshInterval: 1000 });
    const now = new Date();
    const [jumpDateString, setJumpDateString] = useState("");
    const [startDay, setStartDay] = useState(now);

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
                trainMinutes: (Math.ceil(Math.random() * 10) + 2) * 45,
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
                                            console.log("jump to", date);
                                            setStartDay(date);
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
                    <Button colorScheme="green" onClick={createTaskTest} rightIcon={<FontAwesomeIcon icon={faArrowRight as IconProp} />}>
                        Reserveren
                    </Button>
                </HStack>
                <Scheduler weekDay={startDay} tasks={tasks || []} loading={!tasks} />
            </Container>
            {/* <Code as="pre">{JSON.stringify(gpuTasksPerDay, null, 2)}</Code> */}
        </Box>
    );
}
