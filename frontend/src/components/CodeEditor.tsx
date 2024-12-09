import { Box } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import { useRef, useState } from 'react';
import { LangSelector } from './LangSelector';
import { CODE_SNIPPETS, LANGUAGE_VERSIONS} from '../constants';
import {Output} from "./Output.tsx";
type Language = keyof typeof CODE_SNIPPETS;
import {
    createSubmission,
    getSubmission,
    createBatchSubmission,
    createRunSubmission,
    getBatchSubmission,
    submitProblem, getFileData,
    runProblem
} from "../api/problemApi.ts";

import {io} from "socket.io-client";
import {useEffect} from "react"
const server_url = import.meta.env.VITE_SERVER_URL;
const socket = io(server_url, { transports: ["websocket"] });

export const CodeEditor = () => {
    const [code, setCode] = useState<string>(CODE_SNIPPETS["cpp"]);
    const [language, setLanguage] = useState<Language>("cpp");
    const editorRef = useRef<any>(null);
    const problem_id: string = "234";

    useEffect(() => {
        // Socket connection setup
        socket.on("connect", () => {
            console.log("Connected to Socket.IO server with id:", socket.id);
        });

        socket.on("join", (uid) => {
            console.log(`Socket joined room with UID: ${uid}`);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO server");
        });

        // Clean up socket listeners on component unmount
        return () => {
            socket.off("connect");
            socket.off("join");
            socket.off("disconnect");
            socket.off("update");
        };
    }, []);


    const onMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (language: Language) => {
        setLanguage(language);
        setCode(CODE_SNIPPETS[language] || "");
    };

    // Function to read a file
    const readFile = async (filePath: string) => {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filePath}`);
            }
            const content = await response.text();
            return content;
        } catch (error) {
            console.error(error);
        }
    };

    const handleOnRun = async () =>{
        try {
            const { uid } = await runProblem({ problem_id });
            console.log("UID for submission:", uid);

            // Join the socket room with the UID
            socket.emit("join", uid);

            // Set up the listener for the 'update' event
            socket.on("update", (data) => {
                console.log("UpdatedSubmission:", data);
                // Handle the data received from the server
                // You can pass this data to the Output component to show the results
            });

            // Create run submission
            const result = await createRunSubmission({ problem_id, uid });
            console.log("Run Submission Result:", result);
        } catch (error) {
            console.error("Error in handleOnRun:", error);
        }

        // const inputFiles = ['input_0.txt', 'input_1.txt', 'input_2.txt'];  // Add your input file names here
        // const outputFiles = ['output_0.txt', 'output_1.txt', 'output_2.txt'];
        // //axios call to fetch psURLs from the server
        //
        // const input: string[]= [];
        // const output: string[] = [];
        //
        // // Read input files
        // for (const file of inputFiles) {
        //     const content = await readFile(`Problems/sum/input/${file}`);
        //     if (content) input.push(btoa(content));
        // }
        //
        // // Read output files
        // for (const file of outputFiles) {
        //     const content = await readFile(`Problems/sum/output/${file}`);
        //     if (content) output.push(btoa(content));
        // }
        //
        // //Read files from the aws S3
        //
        //
        // //make a batch submission
        // const submissions = input.map((input, index) =>{
        //     return {
        //         source_code: btoa(code),
        //         language_id:  LANGUAGE_VERSIONS[language].id,
        //         stdin: input,
        //         expected_output: output[index] as string
        //     }
        // });
        //
        // const result = await createBatchSubmission({submissions});
        // console.log(result);
        //
        // const tokens = result.map((obj: { token: any; }) => obj.token).join(",");
        //
        // setTimeout(async () =>{
        //     const status = await getBatchSubmission(tokens);
        //     console.log(status);
        // }, 5000);

        // console.log(input);
        // console.log(output);

        // const data = {
        //     source_code: btoa(code),
        //     language_id: LANGUAGE_VERSIONS[language].id,
        // }
        //
        // console.log(data);
        // const result = await createSubmission(data);
        // console.log(result);

        // setTimeout(async () =>{
        //     const status = await getSubmission(result.token);
        //     console.log(status);
        //     console.log(atob(status.stdout));
        // }, 5000);
    }

    const handleOnSubmit = async () => {
        try {
            const { submission_id, input_urls, exp_output_urls, callback_urls } = await submitProblem({ problem_id, code: btoa(code),  language_id:  LANGUAGE_VERSIONS[language].id});

            // Use Promise.all to fetch data concurrently for input and output
            const input: string[] = await Promise.all(input_urls.map((url: string) => getFileData(url)));
            const output: string[] = await Promise.all(exp_output_urls.map((url: string) => getFileData(url)));

            // Verify that submissions array is populated
            const base_url: string = "https://d661-2409-40d2-102a-4185-2c70-e125-bf30-b171.ngrok-free.app";
            const submissions = input.map((inputValue, index) => ({
                source_code: btoa(code),
                language_id: LANGUAGE_VERSIONS[language].id,
                stdin: btoa(inputValue),
                expected_output: btoa(output[index]),
                callback_url:`${base_url}${callback_urls[index]}`
            }));

            console.log("Submissions array:", submissions); // Check if populated
            if (submissions.length === 0) {
                console.error("Error: Submissions array is empty");
                return;
            }

            // Make a batch submission only if submissions array is not empty
            const result = await createBatchSubmission({ submissions });
            console.log(result);

            // const tokens = result.map((obj: { token: any; }) => obj.token).join(",");
            // setTimeout(async () =>{
            //     const status = await getBatchSubmission(tokens);
            //     console.log(status);
            // }, 5000);
        } catch (error) {
            console.error("Error in handleOnSubmit:", error);
        }
    };


    return (
        <Box>
            <LangSelector language={language} onSelect={onSelect} />
            <Editor
                height="50vh"
                theme='vs-dark'
                language={language}
                value={code}
                onMount={onMount}
                onChange={(code) => setCode(code || "")}
            />

            <Output onRun={handleOnRun} onSubmit={handleOnSubmit}/>
        </Box>
    );
};
