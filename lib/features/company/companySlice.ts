import { Company } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Mock data generation from your component
const mockCompanies: Company[] = Array(12).fill(null).map((_, i) => ({
  id: i,
  name: 'Bold text column',
  companyId: 'Regular text column',
  admin: 'Regular text column',
  adminEmail: 'Regular text column',
  branches: 'Regular text column',
  activePolicies: 'Regular text column',
  status: [1, 3, 6, 8, 10].includes(i) ? 'Inactive' : 'Active'
}));

interface CompaniesState {
  companies: Company[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: CompaniesState = {
  companies: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setMockCompanies(state) {
      state.companies = mockCompanies;
      state.meta.total = mockCompanies.length;
    },
    deleteCompany(state, action: PayloadAction<number>) {
      state.companies = state.companies.filter(c => c.id !== action.payload);
      state.meta.total = state.companies.length;
    },
    addCompany(state, action: PayloadAction<Company>) {
      state.companies.unshift(action.payload);
      state.meta.total += 1;
    },
    updateCompany(state, action: PayloadAction<Company>) {
      const index = state.companies.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
    },
  },
});

export const { setMockCompanies, deleteCompany, addCompany, updateCompany } = companySlice.actions;
export default companySlice.reducer;