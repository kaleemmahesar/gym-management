import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'dark' | 'light'

type UiState = {
  theme: ThemeMode
}

const initialState: UiState = {
  theme: 'dark',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
  },
})

export const { setTheme, toggleTheme } = uiSlice.actions
export default uiSlice.reducer

