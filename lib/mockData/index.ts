// lib/mockData/index.ts
// Central barrel export for all mock data
export { MOCK_COMPANIES } from './companies';
export { MOCK_POLICIES } from './policies';
export { MOCK_CLAIMS } from './claims';
export { MOCK_RENEWALS } from './renewals';
export { MOCK_DOCUMENTS } from './documents';

// Re-export users from their existing location
export { MOCK_USERS } from '@/lib/features/user/userMockData';
