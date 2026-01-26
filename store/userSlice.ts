// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// JWT payload 타입 확장
interface CustomJwtPayload {
  sub?: string;
  role?: string;
  [key: string]: any;
}

const initialState = {
  username: null as string | null,
  role: null as string | null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserFromToken(state, action) {
      const token = action.payload;
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        state.username = decoded.sub ?? null;
        state.role = decoded.role ?? null;
        state.isAuthenticated = true;
      } catch {
        // 토큰 에러 처리
        state.username = null;
        state.role = null;
        state.isAuthenticated = false;
      }
    },
    logout(state) {
      // localStorage에서 accessToken 삭제
      if (typeof window !== 'undefined') {
        localStorage.removeItem("accessToken");
      }
      state.username = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUserFromToken, logout } = userSlice.actions;
export default userSlice.reducer;
