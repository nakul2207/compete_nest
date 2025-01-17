import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


// Define the initial state using that type
const initialState = {
  value : false,
}

export const toggleSlice = createSlice({
  name: 'isLogin',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setIsLoginPage: (state,action:PayloadAction<boolean>) => {
      state.value = action.payload;
    },
  },
})

export const {setIsLoginPage} = toggleSlice.actions

export default toggleSlice.reducer