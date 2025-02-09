import { useEffect, useRef, useCallback, useMemo, useState } from "react"
import { Button } from "./ui/button"
import { Maximize2, Minimize2, Sun, Moon } from 'lucide-react'
import { Editor, useMonaco } from "@monaco-editor/react"
import { languages } from "../assets/mapping.ts";
import { LangSelector } from "./LangSelector.tsx";
import { useAppSelector, useAppDispatch } from '../redux/hook.ts'
import {
    pushSubmission,
    setCode,
    setCodeOutputs,
    setLanguage,
    setRecentSubmission,
    updateRecentSubmission
} from '../redux/slice/problemSlice.tsx'
import { createSubmission, getFileData, submitProblem, updateSubmission } from "../api/problemApi.ts";
import { toast } from "sonner";
import { Loader } from 'lucide-react';

interface CodeEditorProps {
    handleTab: (currentTab: string) => void
    isFullScreen: boolean
    handleFullScreen: (isFullScreen: boolean) => void
}
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
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
    "71": "python"
}

export function CodeEditor({ handleTab, isFullScreen, handleFullScreen }: CodeEditorProps) {
    const { user } = useAppSelector((state) => state.auth);
    const code = useAppSelector((state) => state.problem.code);
    const problem = useAppSelector((state) => state.problem);
    const languageId = useAppSelector((state) => state.problem.languageId);
    const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark')
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    useEffect(() => {
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
        lineNumbers: "on" as "on",
        roundedSelection: false,
        padding: { top: 10 },
        cursorStyle: "line" as "line",
        automaticLayout: true,
        wordWrap: "on" as "on",
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
        setIsRunning(true);
        try {
            let updatedOutputs = problem.example_inputs.map(() => ({
                status: "Code Running...",
                output: null,
            }));

            dispatch(setCodeOutputs([...updatedOutputs]));

            const results = await Promise.all(
                problem.example_inputs.map(async (inputValue, index) => {
                    try {
                        const data = {
                            source_code: btoa(problem.code),
                            language_id: problem.languageId,
                            stdin: btoa(inputValue),
                            expected_output: btoa(problem.example_exp_outputs[index]),
                        };

                        const result = await createSubmission(data);

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

            dispatch(setCodeOutputs([...results]));
            handleTab("testcases");
        } catch (error) {
            console.error("Error processing submissions:", error);
        } finally {
            setIsRunning(false);
        }
    };

    const submitCode = async () => {
        setIsSubmitting(true);
        try {
            if (!user) {
                toast.error("Please login to submit code");
                return;
            }

            const { submission_id, input_urls, exp_output_urls, callback_urls } = await submitProblem({ problem_id: problem.id, code: btoa(code), language_id: parseInt(problem.languageId) });

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
                userId: user?.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }

            dispatch(pushSubmission(sub));
            dispatch(setRecentSubmission(sub));
            handleTab("results");

            let updatedSubmission = null;
            for (let index = 0; index < input.length; index++) {
                try {
                    const inputData = {
                        source_code: btoa(code),
                        language_id: problem.languageId,
                        stdin: btoa(input[index]),
                        expected_output: btoa(output[index]),
                    };

                    const result = await createSubmission(inputData);
                    const data = await updateSubmission(result, callback_urls[index]);

                    if (data.updatedSubmission) {
                        updatedSubmission = data.updatedSubmission;
                        dispatch(updateRecentSubmission(data.updatedSubmission));
                        dispatch(setRecentSubmission(data.updatedSubmission));

                        if (data.updatedSubmission.status > 3) {
                            break;
                        }
                    } else {
                        console.error("Error in handleOnSubmit:", data.message);
                        break;
                    }
                } catch (error) {
                    console.error("Error in handleOnSubmit:", error);
                    break;
                }
            }

            if (updatedSubmission) {
                if (updatedSubmission.status === 3) {
                    toast.success("Solution Accepted");
                } else {
                    toast.error("Solution Rejected: " + updatedSubmission.status);
                }
            }
        } catch (error) {
            console.error("Error in handleOnSubmit:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col">
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
                height="65vh"
                theme={theme}
                language={monacoLanguageMap[languageId]}
                value={code}
                onMount={onMount}
                onChange={(value) => dispatch(setCode(value || ""))}
                options={editorOptions}
            />

            <div className="flex justify-end items-center gap-2 p-4 border-t">
                <Button variant="outline" onClick={runCode} disabled={isRunning} className="min-w-[100px]">
                    {isRunning ? <Loader className="animate-spin h-4 w-4" /> : "Run Code"}
                </Button>
                <Button onClick={submitCode} disabled={isSubmitting} className="min-w-[100px]">
                    {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : "Submit"}
                </Button>
            </div>
        </div>
    )
}

