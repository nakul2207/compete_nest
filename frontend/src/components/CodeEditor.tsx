import { Box } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import { useRef, useState } from 'react';
import { LangSelector } from './LangSelector';
import { CODE_SNIPPETS,LANGUAGE_VERSIONS} from '../constants';
import {Output} from "./Output.tsx";
type Language = keyof typeof CODE_SNIPPETS;
import {createSubmission, getSubmission} from "../api/problemApi.ts";

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

    const handleOnRun = async () =>{
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
