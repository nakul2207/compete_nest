import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state for code
interface ProblemState {
    problem_id: string
    code: string
    languageId: string
    example_inputs: Array<string>
    example_exp_outputs: Array<string>
    code_outputs: Array<Object>
    recent_submission: Object
}

const initialState: ProblemState = {
    problem_id: "234",
    code: "",
    languageId: "54",
    example_inputs: ["1 2", "0 0", "3 4"],
    example_exp_outputs: ["3", "0", "7"],
    code_outputs: [],
    recent_submission: {}
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
        setLanguage: (state, action: PayloadAction<string>) =>{
            state.languageId = action.payload;
        },
        setCodeOutputs: (state, action: PayloadAction<Array<Object>>) =>{
            state.code_outputs = action.payload;
        },
        setRecentSubmission: (state, action: PayloadAction<Object>) =>{
            state.recent_submission = action.payload;
        }

    },
});

export const { setCode, clearCode, setLanguage, setCodeOutputs, setRecentSubmission } = problemSlice.actions;
export default problemSlice.reducer;