import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for the problem data
interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    constraints: string;
    inputFormat: string;
    outputFormat: string;
    ownerCode: string;
    ownerCodeLanguage: string;
    resourcePath: Array<string>;
    topics: Array<string>;
    companies: Array<string>;
}

// Define the initial state for code
interface ProblemState extends Problem {
    code: string;
    languageId: string;
    example_inputs: Array<string>;
    example_exp_outputs: Array<string>;
    code_outputs: Array<Object>;
    recent_submission: Object;
}

const initialState: ProblemState = {
    id: "",
    title: "",
    description: "",
    difficulty: "",
    constraints: "",
    inputFormat: "",
    outputFormat: "",
    ownerCode: "",
    ownerCodeLanguage: "",
    resourcePath: [],
    topics: [],
    companies: [],

    code: "",
    languageId: "54",
    example_inputs: ["1 2", "0 0", "3 4"],
    example_exp_outputs: ["3", "0", "7"],
    code_outputs: [],
    recent_submission: {},
};

export const problemSlice = createSlice({
    name: "problem",
    initialState,
    reducers: {
        setCode: (state, action: PayloadAction<string>) => {
            state.code = action.payload;
        },
        clearCode: (state) => {
            state.code = "";
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.languageId = action.payload;
        },
        setCodeOutputs: (state, action: PayloadAction<Array<Object>>) => {
            state.code_outputs = action.payload;
        },
        setRecentSubmission: (state, action: PayloadAction<Object>) => {
            state.recent_submission = action.payload;
        },
        setProblem: (state, action: PayloadAction<Problem>) => {
            const problem = action.payload;

            state.id = problem.id;
            state.title = problem.title;
            state.description = problem.description;
            state.difficulty = problem.difficulty;
            state.constraints = problem.constraints;
            state.inputFormat = problem.inputFormat;
            state.outputFormat = problem.outputFormat;
            state.ownerCode = problem.ownerCode;
            state.ownerCodeLanguage = problem.ownerCodeLanguage;
            state.resourcePath = problem.resourcePath;
            state.topics = problem.topics;
            state.companies = problem.companies;
        },
    },
});

export const { setCode, clearCode, setLanguage, setCodeOutputs, setRecentSubmission, setProblem } =
    problemSlice.actions;
export default problemSlice.reducer;
