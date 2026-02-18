import { Company, Role, User } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/";

export type ApiClientOptions = RequestInit & {
  auth?: boolean;
};

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    if (typeof window === "undefined") return {};

    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    { auth = true, headers, ...options }: ApiClientOptions = {},
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: "include", // ✅ cookies support
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(auth ? this.getAuthHeaders() : {}),
        ...headers,
      },
    });

    // Handle 401 (Unauthorized) globally
    if (res.status === 401) {
      //   this.handleUnauthorized();
      //   throw new Error("Unauthorized");
      return null as T;
    }

    if (!res.ok) {
      const errorBody = await res
        .json()
        .catch(() => ({ error: "Network Error" }));
      throw new Error(errorBody?.error || "Request failed");
    }

    return res.json() as Promise<T>;
  }

  private handleUnauthorized() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
  }

  // Auth Methods
  async login(email: string, password: string) {
    return this.request<{
      token: string;
      user: { id: string; email: string; name: string };
    }>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(data: { name: string; email: string; password: string }) {
    return this.request("/api/auth/signup", {
      method: "POST",
      auth: false,
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request("/api/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request("/api/auth/me");
  }

  // User Methods
  async getAll() {
    return this.request("/api/users");
  }

  async getById(id: string) {
    return this.request(`/api/users/${id}`);
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }): Promise<User> {
    return apiClient.request("/api/users/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProfile(
    userId: string,
    data: { name: string; email: string; password: string; role: Role },
  ): Promise<User> {
    return this.request(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Admin Methods
  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  // Company Methods
  async getAllCompanies(): Promise<Company[]> {
    return this.request<Company[]>("/api/v1/companies");
  }

  async getCompanyById(companyId: number): Promise<Company> {
    return this.request<Company>(`/api/v1/companies/${companyId}`);
  }

  async createCompany(data: Omit<Company, "id">): Promise<Company> {
    return this.request<Company>("/api/v1/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCompany(
    companyId: number,
    data: Partial<Omit<Company, "id">>,
  ): Promise<Company> {
    return this.request<Company>(`/api/v1/companies/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
