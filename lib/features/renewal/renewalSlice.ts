import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Renewal } from '@/types';
import { MOCK_RENEWALS } from '@/lib/mockData/renewals';

interface RenewalState {
  items: Renewal[];
  total: number;
}

const initialState: RenewalState = {
  items: [],
  total: 0,
};

const renewalSlice = createSlice({
  name: 'renewal',
  initialState,
  reducers: {
    setMockRenewals(state) {
      state.items = MOCK_RENEWALS;
      state.total = MOCK_RENEWALS.length;
    },
    setRenewals(state, action: PayloadAction<Renewal[]>) {
      state.items = action.payload;
      state.total = action.payload.length;
    },
    updateRenewalStatus(
      state,
      action: PayloadAction<{ id: string; status: Renewal['status'] }>
    ) {
      const renewal = state.items.find(r => r.id === action.payload.id);
      if (renewal) renewal.status = action.payload.status;
    },
  },
});

export const { setMockRenewals, setRenewals, updateRenewalStatus } =
  renewalSlice.actions;
export default renewalSlice.reducer;
