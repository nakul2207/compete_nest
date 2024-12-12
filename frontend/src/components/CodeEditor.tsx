import {useEffect, useRef, useState} from "react"
import { Button } from "./ui/button"
import { Maximize2, Minimize2 } from 'lucide-react'
import {Editor} from "@monaco-editor/react";
import {languages } from "../assets/mapping.ts";
import {LangSelector} from "./LangSelector.tsx";

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  runCode: () => void
  submitCode: () => void
  isFullScreen: boolean
  handleFullScreen: (isFullScreen: boolean) => void
}

export function CodeEditor({ code, setCode, runCode, submitCode, isFullScreen, handleFullScreen }: CodeEditorProps) {
    const editorRef = useRef<any>(null);
    const [language, setLanguage] = useState("54");

    const onSelect = (language_id: string) => {
        setLanguage(language_id);
        setCode(atob(languages[language_id].boilerplate) as string || "");
    };

    const onMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    useEffect(() =>{
        setCode(atob(languages[language].boilerplate) as string || "");
    }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <LangSelector language_id={language} onSelect={onSelect} />
          
        <Button
          variant="outline"
          size="icon"
          className="top-2 right-2 z-50"
          onClick={() => handleFullScreen(!isFullScreen)}
        >
          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

        <Editor
            height="80vh"
            theme="vs-dark"
            language={"cpp"}
            value={code}
            onMount={onMount}
            onChange={(code) => setCode(code || "")}
        />

      <div className="flex justify-end items-center gap-2 p-4 border-t">
        <Button variant="outline" onClick={runCode}>Run Code</Button>
        <Button onClick={submitCode}>Submit</Button>
      </div>
    </div>
  )
}

