import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export type AuthState = {
  isAuthenticated: boolean
  username: string | null
  status: 'idle' | 'loading' | 'failed'
  error?: string
}

const ADMIN = {
  username: 'admin@gym.com',
  password: 'admin123',
}

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
  status: 'idle',
}

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { username: string; password: string }) => {
    await new Promise((r) => setTimeout(r, 650))
    const ok =
      payload.username.trim().toLowerCase() === ADMIN.username &&
      payload.password === ADMIN.password
    if (!ok) {
      throw new Error('Invalid credentials')
    }
    return { username: ADMIN.username }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false
      state.username = null
      state.status = 'idle'
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.isAuthenticated = true
        state.username = action.payload.username
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Login failed'
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer

