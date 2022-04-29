import { useRouter } from "next/router";
import { NavBar } from "../../components/NavBar";
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
    Link,
    Badge
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

var taskName:string;
var start:Date;
var end:Date;
var status:string = 'wachtend';
var statusColor:string = 'yellow';
var gpu;
var startDate:string;
var endDate:string;

function getInfoFromDB(id:any){
    //TODO get from db
    const newid = id;
    taskName = 'train_AI'
    const now = new Date();
    start = new Date();
    end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 23, 23);;
    if(now > end){
        status = 'voltooid';
        statusColor = 'red';
    }else if(now > start){
        status = 'bezig';
        statusColor = 'green';
    }
    gpu = 'GPU2';
    startDate = start.toDateString();
    endDate = end.toDateString();
}

function deleteTask(){
    //TODO
}

function downloadZIP(){
    //TODO
}

function deleteFolder(){
    //TODO
}

export default function TaskById() {
    const router = useRouter();
    getInfoFromDB(router.query.id);

    return (
        <Box bg="gray.100" minH="100vh">
            <NavBar /> 
            <Container maxWidth="80%" alignSelf='center'>
                <Grid templateColumns='30px 500px 1fr' marginTop={7}>
                    <GridItem h='10' ><Link href="/app"><FontAwesomeIcon icon={faChevronLeft as IconProp}/></Link></GridItem>
                    <GridItem h='10' marginLeft={4}>
                        <Flex flexDirection='column' h='67vh' gap='5'>
                            <Box h='10'><Text><b>{taskName}</b> ({router.query.id})<Badge colorScheme={statusColor} padding={1} marginLeft={7}>{status}</Badge></Text></Box>
                            <Text>Taak start op {startDate} en eindigd op {endDate}.</Text>
                            <Box>
                                <Text>Upload Folder</Text>
                                <Box background='gray.200' h='50px' marginTop='10px'> </Box>
                            </Box>
                            <Box>
                                <Text>Selecteer script</Text>
                                <Box background='gray.200' h='50px' marginTop='10px'> </Box>
                            </Box>
                            <Spacer></Spacer>
                            <Box flex='end'>
                                <Button background='lightgray'>Download resultaat (ZIP)*</Button>
                                <Text marginLeft='5px'>*Alle bestanden worden van de server verwijderd bij een download van de ZIP file.</Text>
                            </Box>
                        </Flex>
                    </GridItem>
                    <GridItem h='10' marginLeft={10}>
                        <Flex marginBottom={3}>
                            <Spacer></Spacer>
                            <Link href="/app"><Button backgroundColor='gray.200'>Verwijder taak</Button></Link>
                        </Flex>    
                        <Box h='60vh' padding='20px' bg='gray.200' color='black' marginBottom={3} rounded='lg'>
                            <Flex flexDirection='column'>
                                <Text fontWeight='bold'>This is output from the docker container.</Text>
                                <Text h='auto' marginTop='10px' paddingTop='5px' borderTop='1px solid black'>output output <br/> output</Text>
                            </Flex>
                        </Box>
                        <Button color='blue.400'>Verbinden met Jupiter Notebook</Button>                      
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    )
    
    //<p>The task with id {router.query.id} is displayed here</p>;
}
