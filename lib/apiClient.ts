import { Company, Role, User } from "@/types";

// export const API_BASE_URL = 'http://20.244.42.244:8000/api/v1';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/";

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/register', // Assuming this endpoint, not in user's snippet
  LOGOUT: '/auth/logout', // Assuming this endpoint
  ME: '/auth/me', // Assuming this endpoint
  COMPANIES: '/companies',
  USERS: '/users/', // Note the trailing slash from user's snippet
};

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const api = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  post: async <T = unknown>(endpoint: string, data: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`POST ${endpoint} failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  patch: async <T = unknown>(endpoint: string, data: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`PATCH ${endpoint} failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
      // Handle 204 No Content
      return response.status === 204 ? { success: true } : await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

export const apiClient = {
  // Auth Methods
  login: async (credentials: { email: string; password: string }) => {
    // Standard OAuth2 password flow often expects form data, not JSON.
    // It also typically uses 'username' as the key for the user identifier.
    const body = new URLSearchParams({
      username: credentials.email,
      password: credentials.password,
    });

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }
    return await response.json();
  },
  signup: (data: { name: string; email: string; password: string }) => {
    // Unauthenticated post
    return fetch(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(res => {
        if (!res.ok) throw new Error('Signup failed');
        return res.json();
    });
  },
  logout: () => {
    return api.post(API_ENDPOINTS.LOGOUT, {});
  },
  getCurrentUser: () => {
    return api.get(API_ENDPOINTS.ME);
  },

  // User Methods
  getAll: () => {
    return api.get(API_ENDPOINTS.USERS);
  },
  getById: (id: string) => {
    return api.get(`${API_ENDPOINTS.USERS}${id}/`);
  },
  createUser: (data: { name: string; email: string; password: string; role: Role }): Promise<User> => {
    return api.post(API_ENDPOINTS.USERS, data);
  },
  updateProfile: (userId: string, data: Partial<User>): Promise<User> => {
    return api.patch(`${API_ENDPOINTS.USERS}${userId}/`, data);
  },
  deleteUser: (id: string) => {
    return api.delete(`${API_ENDPOINTS.USERS}${id}/`);
  },
  updateUserRole: (userId: string, role: string) => {
    return api.patch(`${API_ENDPOINTS.USERS}${userId}/`, { role });
  },

  // Company Methods
  getAllCompanies: (): Promise<Company[]> => {
    return api.get(API_ENDPOINTS.COMPANIES);
  },
  getCompanyById: (companyId: number): Promise<Company> => {
    return api.get(`${API_ENDPOINTS.COMPANIES}/${companyId}/`);
  },
  createCompany: (data: Omit<Company, 'id' | 'status'>): Promise<Company> => {
    return api.post(API_ENDPOINTS.COMPANIES, data);
  },
  updateCompany: (companyId: number, data: Partial<Omit<Company, 'id'>>): Promise<Company> => {
    return api.patch(`${API_ENDPOINTS.COMPANIES}/${companyId}/`, data);
  },
  deleteCompany: (id: number): Promise<{ success: boolean }> => {
    return api.delete(`${API_ENDPOINTS.COMPANIES}/${id}/`);
  },
};
