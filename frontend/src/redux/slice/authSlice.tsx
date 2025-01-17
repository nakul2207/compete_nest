import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the user object type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Define the overall state type
interface AuthState {
  isAuthenticated: boolean;
  user?: User | null; // Optional user object
}

// Function to provide the initial state dynamically
const getInitialState = (): AuthState => ({
  isAuthenticated: false,
  user: null, // Starts as null since no user is authenticated
});

export const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(), // Call the function to set initial state
  reducers: {
    // Sets the authentication status
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    // Sets the user object, ensuring only valid fields are set
    setUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        const { id, name, email, role } = action.payload; // Destructure only allowed fields
        state.user = { id, name, email, role }; // Ensure only these fields are set
      } else {
        state.user = null;
      }
    },
    // Clears user and authentication status
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    // Resets to the initial state dynamically
    resetState: () => getInitialState(),
  },
});

// Export actions
export const { setIsAuthenticated, setUser, logout, resetState } = authSlice.actions;

// Export reducer
export default authSlice.reducer;