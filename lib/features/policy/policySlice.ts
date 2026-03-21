import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Policy } from '@/types';

interface PolicyState {
  items: Policy[];
  total: number;
  selectedId: string | null;
}

const initialState: PolicyState = {
  items: [],
  total: 0,
  selectedId: null,
};

const policySlice = createSlice({
  name: 'policy',
  initialState,
  reducers: {
    setPolicies(state, action: PayloadAction<Policy[]>) {
      state.items = action.payload;
    },
    addPolicy(state, action: PayloadAction<Policy>) {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    updatePolicy(state, action: PayloadAction<Policy>) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    deletePolicy(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p.id !== action.payload);
      state.total -= 1;
    },
    selectPolicy(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
  },
});

export const { setPolicies, addPolicy, updatePolicy, deletePolicy, selectPolicy } =
  policySlice.actions;
export default policySlice.reducer;
