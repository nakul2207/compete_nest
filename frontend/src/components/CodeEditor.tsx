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
    getBatchSubmission,
    submitProblem, getFileData,
} from "../api/problemApi.ts";

export const CodeEditor = () => {
    const [code, setCode] = useState<string>(CODE_SNIPPETS["cpp"]);
    const [language, setLanguage] = useState<Language>("cpp");
    const editorRef = useRef<any>(null);
    const problem_id: string = "234";

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
            const base_url: string = "https://ded7-2409-40d2-1327-f33f-d590-34ab-b5da-7c3.ngrok-free.app";
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
