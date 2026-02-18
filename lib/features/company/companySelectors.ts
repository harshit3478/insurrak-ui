import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

const selectCompanyState = (state: RootState) => state.company;

export const selectCompanies = createSelector(
  [selectCompanyState],
  (companiesState) => companiesState.companies
);

export const selectCompaniesMeta = createSelector(
  [selectCompanyState],
  (companiesState) => companiesState.meta
);