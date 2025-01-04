import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Company {
    id: string;
    name: string;
}

const initialState: Company[] = [];

export const companySlice = createSlice({
    name: "companies",
    initialState,
    reducers: {
        setCompanies: (state, action: PayloadAction<Company[]>) => {
            state.length = 0; // Clear the current state
            state.push(...action.payload); // Add new elements
        },
        editCompany: (state, action: PayloadAction<Company>) => {
            const company = state.find(c => c.id === action.payload.id);
            if (company) {
                company.name = action.payload.name.trim(); // Directly mutate the found company
            }
        },
        removeCompany: (state, action: PayloadAction<string>) => {
            return state.filter(company => company.id !== action.payload); // Replace state with the filtered array
        }
    }
});

export const { setCompanies, editCompany, removeCompany } = companySlice.actions;
export default companySlice.reducer;
