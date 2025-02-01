import {useEffect, useRef, useCallback, useMemo, useState} from "react"
import { Button } from "./ui/button"
import { Maximize2, Minimize2, Sun, Moon } from 'lucide-react'
import { Editor, useMonaco } from "@monaco-editor/react"
import {languages } from "../assets/mapping.ts";
import {LangSelector} from "./LangSelector.tsx";
import { useAppSelector, useAppDispatch } from '../redux/hook.ts'
import {
    pushSubmission,
    setCode,
    setCodeOutputs,
    setLanguage,
    setRecentSubmission,
    updateRecentSubmission
} from '../redux/slice/problemSlice.tsx'
import {createBatchSubmission, createSubmission, getFileData, submitProblem} from "../api/problemApi.ts";

import {io} from "socket.io-client";
const server_url = import.meta.env.VITE_SERVER_URL;
const socket = io(server_url, { transports: ["websocket"] });

interface CodeEditorProps {
    handleTab: (currentTab:string) => void
    isFullScreen: boolean
    handleFullScreen: (isFullScreen: boolean) => void
}

type Language = {
    name: string;
    is_archived: boolean;
    boilerplate: string;
};

type LanguageMap = {
    [key: string]: Language;
};

const monacoLanguageMap: { [key: string]: string } = {
    "50": "c",
    "54": "cpp",
    "62": "java",
    "63": "javascript",
    "35": "python"
}

export function CodeEditor({handleTab, isFullScreen, handleFullScreen }: CodeEditorProps) {
    const code = useAppSelector((state) => state.problem.code);
    const problem  = useAppSelector((state) => state.problem);
    const languageId =  useAppSelector((state) => state.problem.languageId);
    const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark')
    const editorRef = useRef<any>(null);
    const monaco = useMonaco()
    const dispatch = useAppDispatch();

    const onSelect = (language_id: string) => {
        dispatch(setLanguage(language_id));
        dispatch(setCode(atob(getLanguageBoilerplate(language_id)) as string || ""));
    }

    const onMount = useCallback((editor: any) => {
        editorRef.current = editor;
        editor.focus();
    }, []);

    useEffect(() =>{
        dispatch(setCode(atob(getLanguageBoilerplate(languageId))));
    }, [dispatch, languageId]);

    const getLanguageBoilerplate = useCallback((languageId: string): string => {
        const languageMap: LanguageMap = languages;
        return languageMap[languageId]?.boilerplate || "Unknown Language";
    }, []);

    const editorOptions = useMemo(() => ({
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        roundedSelection: false,
        padding: { top: 10 },
        cursorStyle: "line",
        automaticLayout: true,
        wordWrap: "on",
        tabSize: 4,
        insertSpaces: true,
        fontFamily: "monospace"
    }), []);

    useEffect(() => {
        if (monaco) {
            monaco.editor.setTheme(theme)
        }
    }, [monaco, theme])

    const runCode = async () => {
        try {
            // Initialize outputs as a new array
            let updatedOutputs = problem.example_inputs.map(() => ({
                status: "Code Running...",
                output: null,
            }));

            dispatch(setCodeOutputs([...updatedOutputs])); // Dispatch initial state update

            // Process each input asynchronously
            const results = await Promise.all(
                problem.example_inputs.map(async (inputValue, index) => {
                    try {
                        // Prepare the data for submission
                        const data = {
                            source_code: btoa(problem.code), // Encode source code in Base64
                            language_id: problem.languageId,
                            stdin: btoa(inputValue), // Encode stdin in Base64
                            expected_output: btoa(problem.example_exp_outputs[index]), // Encode expected output
                        };

                        // Create submission and await the result
                        const result = await createSubmission(data);

                        // Return the result for the current input
                        if (result.status.id === 3 || result.stdout) {
                            return {
                                status: result.status.description,
                                output: atob(result.stdout),
                            };
                        } else {
                            return {
                                status: result.status.description,
                                output: null,
                            };
                        }
                    } catch (submissionError) {
                        console.error(`Error processing submission for input ${index}:`, submissionError);
                        return {
                            status: "Error in Submission",
                            output: null,
                        };
                    }
                })
            );

            // Update the outputs in state after processing all submissions
            dispatch(setCodeOutputs([...results])); // Use a new array reference
            handleTab("testcases"); // Change tab after all submissions are processed
        } catch (error) {
            console.error("Error processing submissions:", error);
        }
    };

    const submitCode = async () => {
        try {
            const { submission_id, input_urls, exp_output_urls, callback_urls } = await submitProblem({ problem_id: problem.id, code: btoa(code),  language_id: parseInt(problem.languageId)});

            // Use Promise.all to fetch data concurrently for input and output
            const input: string[] = await Promise.all(input_urls.map((url: string) => getFileData(url)));
            const output: string[] = await Promise.all(exp_output_urls.map((url: string) => getFileData(url)));
            const sub = {
                id: submission_id,
                acceptedTestcases: 0,
                status: 2,
                evaluated_testcase: 0,
                totalTestcases: input_urls.length,
                memory: 0,
                time: 0,
                problemId: problem.id,
                language: problem.languageId,
                userCode: btoa(code),
                userId: "123",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }

            //updating redux state
            dispatch(pushSubmission(sub));
            dispatch(setRecentSubmission(sub));
            handleTab("results");

            // Verify that submissions array is populated
            const base_url: string = "https://9f76-59-153-99-135.ngrok-free.app";
            const submissions = input.map((inputValue, index) => ({
                source_code: btoa(code),
                language_id: problem.languageId,
                stdin: btoa(inputValue),
                expected_output: btoa(output[index]),
                callback_url:`${base_url}${callback_urls[index]}`
            }));

            console.log("Submissions array:", submissions);
            if (submissions.length === 0) {
                console.error("Error: Submissions array is empty");
                return;
            }

            // Join the socket room with the UID
            socket.emit("join", submission_id);

            // Set up the listener for the 'update' event
            socket.on("update", (data) => {
                // console.log("UpdatedSubmission:", data);

                //updating redux state
                dispatch(updateRecentSubmission(data.updatedSubmission));
                dispatch(setRecentSubmission(data.updatedSubmission));
            });

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
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
                <LangSelector language_id={languageId} onSelect={onSelect} />
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                    >
                        {theme === 'vs-dark' ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="top-2 right-2 z-50"
                        onClick={() => handleFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <Editor
                height="80vh"
                theme={theme}
                language={monacoLanguageMap[languageId]}
                value={code}
                onMount={onMount}
                onChange={(value) => dispatch(setCode(value || ""))}
                options={editorOptions}
            />

            <div className="flex justify-end items-center gap-2 p-4 border-t">
                <Button variant="outline" onClick={runCode}>Run Code</Button>
                <Button onClick={submitCode}>Submit</Button>
            </div>
        </div>
    )
}

