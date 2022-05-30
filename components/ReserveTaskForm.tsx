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
} from "@chakra-ui/react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export function ReserveTaskForm(props: { onClose: () => void }) {
    const minHours = 2;
    const maxHours = 24;
    const [hourValue, setHourValue] = useState(8);
    const [taskName, setTaskName] = useState("Nieuwe Taak");
    const [allGpus, setAllGpus] = useState(false);
    const [loading, setLoading] = useState(false);

    async function submit() {
        if (!taskName) return;

        setLoading(true);
        await new Promise((res) => setTimeout(res, 500));

        let res = await fetch("/api/task", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: taskName,
                description: "",
                trainMinutes: hourValue * 60,
                allGpus: allGpus,
            }),
        });
        if (res.ok) {
            console.log("New task", await res.json());
        } else {
            console.error("Error while creating task", await res.text());
        }

        setLoading(false);
        props.onClose();
    }

    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                submit();
            }}>
            <FormControl isDisabled={loading}>
                <FormLabel>Naam taak</FormLabel>
                <Input autoFocus defaultValue={taskName} onChange={(ev) => setTaskName(ev.target.value)} />
            </FormControl>
            <FormControl mt={6} isDisabled={loading}>
                <FormLabel>Aantal uren</FormLabel>
                <Slider
                    mt={6}
                    mb={4}
                    id="slider"
                    defaultValue={hourValue}
                    onChange={(value) => setHourValue(value)}
                    step={0.5}
                    min={minHours}
                    max={maxHours}
                    colorScheme="blue">
                    <SliderMark value={minHours} mt="1" ml="0" fontSize="sm">
                        {minHours} uur
                    </SliderMark>
                    <SliderMark value={12} mt="1" ml="-2.5" fontSize="sm">
                        12 uur
                    </SliderMark>
                    <SliderMark value={maxHours} mt="1" ml="-10" fontSize="sm">
                        {maxHours} uur
                    </SliderMark>
                    <SliderMark value={hourValue} textAlign="center" bg="blue.500" color="white" mt="-10" ml="-8" w="16" rounded="lg">
                        {hourValue} uur
                    </SliderMark>
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
                <FormHelperText>Wil je meer tijd? Vraag dit aan een leerkracht.</FormHelperText>
            </FormControl>
            <FormControl mt={6} isDisabled={loading}>
                <FormLabel>Gebruik alle GPU's</FormLabel>
                <Switch checked={allGpus} onChange={(ev) => setAllGpus(ev.target.checked)} />
                <FormHelperText>
                    Standaard wordt enkel 1 GPU gereserveerd, als je taak meerdere GPU's ondersteund, kan je dit aanvragen. Hiervoor moet je extra
                    code schrijven, zie{" "}
                    <Link color="blue.500" isExternal href="https://www.tensorflow.org/guide/distributed_training">
                        hier <FontAwesomeIcon icon={faExternalLink as IconProp} />
                    </Link>
                    .
                </FormHelperText>
            </FormControl>
            <HStack mt={6} mb={4}>
                <Spacer />
                <Button isLoading={loading} type="submit" colorScheme="green" mr={3}>
                    Aanvragen
                </Button>
                <Button isDisabled={loading} type="button" variant="ghost" onClick={props.onClose}>
                    Annuleren
                </Button>
            </HStack>
        </form>
    );
}
