import { Box } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import { useRef, useState } from 'react';
import { LangSelector } from './LangSelector';
import { CODE_SNIPPETS, LANGUAGE_VERSIONS} from '../constants';
import {Output} from "./Output.tsx";
type Language = keyof typeof CODE_SNIPPETS;
import {createSubmission, getSubmission, createBatchSubmission, getBatchSubmission} from "../api/problemApi.ts";

export const CodeEditor = () => {
    const [value, setValue] = useState<string>(CODE_SNIPPETS["javascript"]);
    const [language, setLanguage] = useState<Language>("javascript");
    const editorRef = useRef<any>(null);

    const onMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (language: Language) => {
        setLanguage(language);
        setValue(CODE_SNIPPETS[language] || "");
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
        const inputFiles = ['input_0.txt', 'input_1.txt', 'input_2.txt'];  // Add your input file names here
        const outputFiles = ['output_0.txt', 'output_1.txt', 'output_2.txt'];

        const input: string[]= [];
        const output: string[] = [];

        // Read input files
        for (const file of inputFiles) {
            const content = await readFile(`Problems/sum/input/${file}`);
            if (content) input.push(btoa(content));
        }

        // Read output files
        for (const file of outputFiles) {
            const content = await readFile(`Problems/sum/output/${file}`);
            if (content) output.push(btoa(content));
        }

        const submissions = input.map((input, index) =>{
            return {
                source_code: btoa(value),
                language_id:  LANGUAGE_VERSIONS[language].id,
                stdin: input,
                expected_output: output[index] as string
            }
        });

        const result = await createBatchSubmission({submissions});
        console.log(result);

        const tokens = result.map((obj: { token: any; }) => obj.token).join(",");

        setTimeout(async () =>{
            const status = await getBatchSubmission(tokens);
            console.log(status);
        }, 5000);

        // console.log(input);
        // console.log(output);

        // const data = {
        //     source_code: btoa(value),
        //     language_id: LANGUAGE_VERSIONS[language].id,
        // }
        //
        // console.log(data);
        // const result = await createSubmission(data);
        // console.log(result);
        //
        // setTimeout(async () =>{
        //     const status = await getSubmission(result.token);
        //     console.log(status);
        //     console.log(atob(status.stdout));
        // }, 5000);
    }

    const handleOnSubmit = async() =>{
        const data = {
            source_code: btoa(value),
            language_id: LANGUAGE_VERSIONS[language].id,
        }

        console.log(data);
        const result = await createSubmission(data);
        console.log(result);

        setTimeout(async () =>{
            const status = await getSubmission(result.token);
            console.log(status);
            console.log(atob(status.stdout));
        }, 5000);
    }

    return (
        <Box>
            <LangSelector language={language} onSelect={onSelect} />
            <Editor
                height="50vh"
                theme='vs-dark'
                language={language}
                value={value}
                onMount={onMount}
                onChange={(value) => setValue(value || "")}
            />

            <Output onRun={handleOnRun} onSubmit={handleOnSubmit}/>
        </Box>
    );
};
