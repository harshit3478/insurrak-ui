import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Claim } from '@/types';

interface ClaimState {
  items: Claim[];
  total: number;
  selectedId: string | null;
}

const initialState: ClaimState = {
  items: [],
  total: 0,
  selectedId: null,
};

const claimSlice = createSlice({
  name: 'claim',
  initialState,
  reducers: {
    setClaims(state, action: PayloadAction<Claim[]>) {
      state.items = action.payload;
      state.total = action.payload.length;
    },
    updateClaimStatus(
      state,
      action: PayloadAction<{ id: string; status: Claim['status'] }>
    ) {
      const claim = state.items.find(c => c.id === action.payload.id);
      if (claim) claim.status = action.payload.status;
    },
    selectClaim(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
  },
});

export const { setClaims, updateClaimStatus, selectClaim } =
  claimSlice.actions;
export default claimSlice.reducer;
