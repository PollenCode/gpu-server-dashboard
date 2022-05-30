import { Box, Spinner, Grid, GridItem, Heading, Flex, Text } from "@chakra-ui/react";
import React, { useContext } from "react";
import { UserContext } from "../UserContext";
import { Task } from ".prisma/client";

const PIXELS_PER_HOUR = 28;
const GPU_COLORS = ["red.500", "green.500", "orange.500", "purple.500"];
const DAYS_OF_WEEK = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

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

function SchedulerTask(props: { task: Task; dayStart: Date; dayEnd: Date; color?: string; onClick?: (task: Task) => void }) {
    const user = useContext(UserContext);
    let startHour, endHour, showContents;

    if (new Date(props.task.endDate!).getTime() >= props.dayEnd.getTime()) {
        // This task will end on another day
        endHour = 24;
    } else {
        let d = new Date(props.task.endDate!);
        endHour = d.getHours() + d.getMinutes() / 60;
    }

    if (new Date(props.task.startDate!).getTime() < props.dayStart.getTime()) {
        // This task started on another day
        startHour = 0;
        showContents = false; //props.dayStart.getTime() - new Date(props.task.startDate!).getTime() < 1000 * 60 * 60 * FIT_HOURS;
    } else {
        let d = new Date(props.task.startDate!);
        startHour = d.getHours() + d.getMinutes() / 60;
        showContents = true; //startHour < 24 - FIT_HOURS;
    }

    let now = new Date();
    let busy = new Date(props.task.startDate!).getTime() <= now.getTime() && new Date(props.task.endDate!).getTime() > now.getTime();

    return (
        <Box
            onClick={() => props.onClick?.(props.task)}
            top={startHour * PIXELS_PER_HOUR + "px"}
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
            {showContents && (
                <>
                    <Text>
                        {busy && <Spinner size="xs" />} {props.task.name}
                    </Text>

                    {(props.task as any).owner?.id !== user?.id && (
                        <Text opacity={0.6} fontSize="xs">
                            {(props.task as any).owner?.userName}
                        </Text>
                    )}
                </>
            )}
        </Box>
    );
}

export function Scheduler(props: { tasks: Task[]; weekDay?: Date; loading?: boolean; onClick?: (task: Task) => void }) {
    const user = useContext(UserContext);
    let startOfWeek = props.weekDay ? new Date(props.weekDay) : new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setSeconds(0);
    startOfWeek.setMinutes(0);
    startOfWeek.setHours(0);
    startOfWeek.setMilliseconds(0);

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
                                        <SchedulerTask
                                            onClick={props.onClick}
                                            dayStart={dayStart}
                                            dayEnd={dayEnd}
                                            color={(task as any).owner.id === user?.id ? "green.500" : "blue.500"}
                                            task={task}
                                            key={task.id}
                                        />
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
