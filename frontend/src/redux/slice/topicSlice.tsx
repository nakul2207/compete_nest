import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Topic {
    id: string;
    name: string;
}

const initialState: Topic[] = [];

export const topicSlice = createSlice({
    name: "topics",
    initialState,
    reducers: {
        setTopics: (state, action: PayloadAction<Topic[]>) => {
            state.length = 0; // Clear the current state
            state.push(...action.payload); // Add new elements
        },
        editTopic: (state, action: PayloadAction<Topic>) => {
            const company = state.find(c => c.id === action.payload.id);
            if (company) {
                company.name = action.payload.name.trim(); // Directly mutate the found company
            }
        },
        removeTopic: (state, action: PayloadAction<string>) => {
            return state.filter(company => company.id !== action.payload); // Replace state with the filtered array
        }
    }
});

export const { setTopics, editTopic, removeTopic } = topicSlice.actions;
export default topicSlice.reducer;
