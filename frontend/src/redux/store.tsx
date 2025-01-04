import { configureStore } from "@reduxjs/toolkit";
import problemReducer from "./slice/problemSlice.tsx"; // Adjust the path to your slice file
import companyReducer from "./slice/companySlice.tsx"
import topicReducer from "./slice/topicSlice.tsx"

export const store = configureStore({
    reducer: {
        problem: problemReducer,
        companies: companyReducer,
        topics: topicReducer
    },
});

// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;