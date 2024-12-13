import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state for code
interface ProblemState {
    code: string;
    languageId: string
}

const initialState: ProblemState = {
    code: "",
    languageId: "54"
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
        }
    },
});

export const { setCode, clearCode, setLanguage } = problemSlice.actions;
export default problemSlice.reducer;