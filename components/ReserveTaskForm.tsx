import {
    FormControl,
    FormLabel,
    Input,
    Slider,
    SliderMark,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    FormHelperText,
    Switch,
    HStack,
    Spacer,
    Button,
    Link,
    AlertIcon,
    Alert,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Textarea,
    Select,
    Spinner,
} from "@chakra-ui/react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import ms from "ms";
import { Task } from ".prisma/client";
import { isSpotTaken } from "../scheduler";

export function ReserveTaskForm(props: {
    onDone: () => void;
    noApproval: boolean;
    maxTimeBeforeApproval: number;
    multiGpuApproval: boolean;
    gpuCount: number;
}) {
    const minHours = 2;
    const maxHours = 24;
    const [hourValue, setHourValue] = useState(8);
    const [hourValueString, setHourValueString] = useState(String(hourValue));
    const [taskDescription, setTaskDescription] = useState("");
    const [taskName, setTaskName] = useState("Nieuwe Taak");
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedDateString, setSelectedDateString] = useState("");
    const [selectedTimeOffset, setSelectedTimeOffset] = useState<number>();
    const [allGpus, setAllGpus] = useState(false);
    const [loading, setLoading] = useState<"submit" | "autoSetDate" | "fetchDayTasks">();
    const [dayTasks, setDayTasks] = useState<Task[]>([]);

    const trainMilliseconds = hourValue * 60 * 60 * 1000;
    const requiresTimeApproval = trainMilliseconds > props.maxTimeBeforeApproval && !props.noApproval;
    const requiresMultiGpuApproval = allGpus && props.multiGpuApproval && !props.noApproval;
    const requiresApproval = requiresTimeApproval || requiresMultiGpuApproval;

    async function submit() {
        if (!taskName || !selectedDate || selectedTimeOffset === undefined) return;

        setLoading("submit");
        await new Promise((res) => setTimeout(res, 500));

        let res = await fetch("/api/task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: taskName,
                description: "",
                date: new Date(selectedDate.getTime() + selectedTimeOffset),
                trainMinutes: hourValue * 60,
                allGpus: allGpus,
            }),
        });
        if (res.ok) {
            console.log("New task", await res.json());
        } else {
            console.error("Error while creating task", await res.text());
        }

        setLoading(undefined);
        props.onDone();
    }

    async function autoSetDate() {
        setLoading("autoSetDate");

        let res = await fetch("/api/task/free", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                trainMinutes: hourValue * 60,
                allGpus: allGpus,
            }),
        });

        if (res.ok) {
            let data = await res.json();
            let date = new Date(data.date);
            console.log("Received free spot", data);

            setSelectedDateString(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
            setSelectedTimeOffset(date.getHours() * 60 * 60 * 1000 + date.getMinutes() * 60 * 1000);
            // setSelectedTimeOffset(`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`);
        }

        setLoading(undefined);
    }

    async function fetchDayTasks() {
        setLoading("fetchDayTasks");

        let from = selectedDate!;
        let to = new Date(from.getTime() + 1000 * 60 * 60 * 24);
        let res = await fetch("/api/task?from=" + encodeURIComponent(from.toISOString()) + "&to=" + encodeURIComponent(to.toISOString()), {
            method: "GET",
        });

        if (res.ok) {
            setDayTasks(await res.json());
        }

        setLoading(undefined);
    }

    function isDaySpotTaken(offsetMilliseconds: number) {
        let minDate = new Date(selectedDate!.getTime() + offsetMilliseconds);
        if (allGpus) {
            return isSpotTaken(dayTasks, trainMilliseconds, minDate);
        } else {
            for (let g = 0; g < props.gpuCount; g++) {
                let takenOnGpu = isSpotTaken(
                    dayTasks.filter((e) => e.gpus.includes(g)),
                    trainMilliseconds,
                    minDate
                );

                if (!takenOnGpu) {
                    return false;
                }
            }

            return true;
        }
    }

    useEffect(() => {
        if (selectedDate) {
            fetchDayTasks();
            setHourValueString("");
        }
    }, [selectedDate]);

    useEffect(() => {
        setSelectedDateString("");
        setSelectedTimeOffset(undefined);
        setSelectedDate(undefined);
    }, [allGpus, hourValue]);

    useEffect(() => {
        // Make sure to add the time string so its gets timezone adjusted
        let d = new Date(selectedDateString + " 00:00:00");
        if (!isNaN(d.getTime())) {
            setSelectedDate(d);
        }
    }, [selectedDateString]);

    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                submit();
            }}>
            <FormControl isRequired isDisabled={!!loading}>
                <FormLabel>Naam taak</FormLabel>
                <Input autoFocus defaultValue={taskName} onChange={(ev) => setTaskName(ev.target.value)} />
            </FormControl>
            <FormControl isDisabled={!!loading} mt={4}>
                <FormLabel>Beschrijving</FormLabel>
                <Textarea
                    value={taskDescription}
                    placeholder="optionele beschrijving, vul dit in als je goedkeuring moet krijgen"
                    onChange={(ev) => setTaskDescription(ev.target.value)}
                />
            </FormControl>
            <FormControl isRequired mt={4} isDisabled={!!loading}>
                <FormLabel>Aantal uren</FormLabel>
                <Slider
                    focusThumbOnChange={false}
                    mt={6}
                    mb={4}
                    id="slider"
                    value={hourValue}
                    onChange={(value) => setHourValue(value)}
                    step={0.5}
                    min={minHours}
                    max={maxHours}
                    colorScheme={requiresTimeApproval ? "yellow" : "blue"}>
                    <SliderMark value={minHours} mt="1" ml="0" fontSize="sm">
                        {minHours} uur
                    </SliderMark>
                    <SliderMark value={12} mt="1" ml="-2.5" fontSize="sm">
                        12 uur
                    </SliderMark>
                    <SliderMark value={maxHours} mt="1" ml="-10" fontSize="sm">
                        {maxHours} uur
                    </SliderMark>
                    <SliderMark
                        value={Math.min(hourValue, maxHours)}
                        textAlign="center"
                        bg={requiresTimeApproval ? "yellow.500" : "blue.500"}
                        color="white"
                        mt="-10"
                        ml="-8"
                        w="16"
                        rounded="lg">
                        {hourValue} uur
                    </SliderMark>
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
                <Popover>
                    <PopoverTrigger>
                        <Button type="button" mt={2} onClick={() => setHourValueString(String(hourValue))}>
                            Andere duur...
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Aantal uren</PopoverHeader>
                        <PopoverBody>
                            <FormControl>
                                <NumberInput
                                    value={hourValueString}
                                    onChange={(ev) => {
                                        setHourValueString(ev);
                                        let numberValue = parseInt(ev);
                                        if (!isNaN(numberValue)) {
                                            setHourValue(numberValue);
                                        }
                                    }}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </FormControl>

            <FormControl mt={6} isDisabled={!!loading}>
                <FormLabel>Gebruik alle GPU's</FormLabel>
                <Switch
                    colorScheme={requiresMultiGpuApproval ? "yellow" : "blue"}
                    checked={allGpus}
                    onChange={(ev) => setAllGpus(ev.target.checked)}
                />
                <FormHelperText>
                    Standaard wordt enkel 1 GPU gereserveerd, als je taak meerdere GPU's ondersteund, kan je dit aanvragen. Hiervoor moet je extra
                    code schrijven, zie{" "}
                    <Link color="blue.500" isExternal href="https://www.tensorflow.org/guide/distributed_training">
                        hier <FontAwesomeIcon icon={faExternalLink as IconProp} />
                    </Link>
                    .
                </FormHelperText>
            </FormControl>

            <FormControl mt={6} isDisabled={loading !== undefined && loading !== "fetchDayTasks"}>
                <FormLabel>Kies datum & tijd</FormLabel>
                <Button type="button" isLoading={loading === "autoSetDate"} onClick={autoSetDate} mb={4} colorScheme="green">
                    Kies automatisch
                </Button>
                <Input value={selectedDateString} onChange={(ev) => setSelectedDateString(ev.target.value)} mb={4} type="date"></Input>
                {loading === "fetchDayTasks" && <Spinner />}
                {selectedDate && (
                    <Select
                        value={selectedTimeOffset ?? ""}
                        onChange={(ev) => {
                            let value = parseInt(ev.target.value);
                            if (!isNaN(value)) {
                                setSelectedTimeOffset(value);
                            }
                        }}>
                        <option value="">Kies tijdstip</option>
                        {new Array(24).fill(0).map((_, h) => (
                            <option value={h * 1000 * 60 * 60} key={h} hidden={isDaySpotTaken(h * 1000 * 60 * 60)}>
                                {String(h).padStart(2, "0") + ":00"}
                            </option>
                        ))}
                    </Select>
                )}
            </FormControl>

            {requiresApproval && (
                <Alert my={4} rounded="lg" status="warning">
                    <AlertIcon />
                    Je kan deze taak reserveren maar niet gebruiken totdat een leerkracht deze goedgekeurd heeft.
                    {requiresTimeApproval && <> Je taak moet goedkeurd worden als je meer dan {ms(trainMilliseconds)} wilt trainen.</>}
                    {requiresMultiGpuApproval && <> Je taak moet goedkeurd worden als je meerdere GPU's wilt gebruiken.</>}
                </Alert>
            )}

            <HStack mt={6} mb={4}>
                <Spacer />
                <Button isLoading={loading === "submit"} isDisabled={!!loading} type="submit" colorScheme="green" mr={3}>
                    Aanvragen
                </Button>
                <Button isDisabled={!!loading} type="button" variant="ghost" onClick={props.onDone}>
                    Annuleren
                </Button>
            </HStack>
        </form>
    );
}
