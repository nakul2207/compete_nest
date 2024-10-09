import { Box } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import { useRef, useState } from 'react';
import { LangSelector } from './LangSelector';
import { CODE_SNIPPETS } from '../constants';

type Language = keyof typeof CODE_SNIPPETS;

export const CodeEditor = () => {
    const [value, setValue] = useState<string>(CODE_SNIPPETS["javascript"]);
    const [language, setLanguage] = useState<string>("javascript");
    const editorRef = useRef<any>(null);

    const onMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    const onSelect = (language: Language) => {
        setLanguage(language);
        setValue(CODE_SNIPPETS[language] || "");
    };

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
        </Box>
    );
};
