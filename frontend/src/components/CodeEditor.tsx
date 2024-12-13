import {useEffect, useRef, useState} from "react"
import { Button } from "./ui/button"
import { Maximize2, Minimize2 } from 'lucide-react'
import {Editor} from "@monaco-editor/react";
import {languages } from "../assets/mapping.ts";
import {LangSelector} from "./LangSelector.tsx";
import { useAppSelector, useAppDispatch } from '../redux/hook.ts'
import {setCode, setLanguage} from '../redux/slice/problemSlice.tsx'

interface CodeEditorProps {
  runCode: () => void
  submitCode: () => void
  isFullScreen: boolean
  handleFullScreen: (isFullScreen: boolean) => void
}

export function CodeEditor({ runCode, submitCode, isFullScreen, handleFullScreen }: CodeEditorProps) {
    const code = useAppSelector((state) => state.problem.code);
    const languageId =  useAppSelector((state) => state.problem.languageId);
    const dispatch = useAppDispatch()

    // const [code, setCode] = useState("")
    const editorRef = useRef<any>(null);

    const onSelect = (language_id: string) => {
        dispatch(setLanguage(language_id));
        dispatch(setCode(atob(languages[language_id].boilerplate) as string || ""));
    };

    const onMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    useEffect(() =>{
        dispatch(setCode(atob(languages[languageId].boilerplate) as string || ""));
    }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <LangSelector language_id={languageId} onSelect={onSelect} />
          
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
            onChange={(code) => dispatch(setCode(code || ""))}
        />

      <div className="flex justify-end items-center gap-2 p-4 border-t">
        <Button variant="outline" onClick={runCode}>Run Code</Button>
        <Button onClick={submitCode}>Submit</Button>
      </div>
    </div>
  )
}

