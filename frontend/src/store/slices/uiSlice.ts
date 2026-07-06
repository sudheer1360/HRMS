import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  breadcrumbs: { label: string; path?: string }[];
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as UIState['theme']) || 'system',
  sidebarCollapsed: false,
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<UIState['theme']>) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setBreadcrumbs(state, action: PayloadAction<UIState['breadcrumbs']>) {
      state.breadcrumbs = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, setBreadcrumbs } = uiSlice.actions;
export default uiSlice.reducer;
