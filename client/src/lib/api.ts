// API Configuration and Endpoints
// export const API_BASE_URL = 'https://merovotebackend-app-hxb0g6deh8auc5gh.centralindia-01.azurewebsites.net';
export const API_BASE_URL = 'https://merovotebackend-app-hxb0g6deh8auc5gh.centralindia-01.azurewebsites.net';

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  GOOGLE_LOGIN: `${API_BASE_URL}/auth/google`,
  FACEBOOK_LOGIN: `${API_BASE_URL}/auth/facebook`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  GOOGLE_CALLBACK: `${API_BASE_URL}/auth/google/callback`,
  FACEBOOK_CALLBACK: `${API_BASE_URL}/auth/facebook/callback`,
} as const;

// HTTP Status Code
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
} as const;

// API Client Functions
export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Google Authentication - Redirects to OAuth flow
  static async googleLogin(): Promise<ApiResponse<AuthResponse>> {
    // This method is no longer used since we redirect directly to backend
    // Keeping for potential future use
    return this.request<AuthResponse>(AUTH_ENDPOINTS.GOOGLE_LOGIN, {
      method: 'GET'
    });
  }

  // Facebook Authentication - Redirects to OAuth flow
  static async facebookLogin(): Promise<ApiResponse<AuthResponse>> {
    // This method is no longer used since we redirect directly to backend
    // Keeping for potential future use
    return this.request<AuthResponse>(AUTH_ENDPOINTS.FACEBOOK_LOGIN, {
      method: 'GET'
    });
  }

  // Logout
  static async logout(): Promise<ApiResponse> {
    return this.request(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  }

  // Refresh Token
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }
}

// Local Storage Utilities
export class StorageManager {
  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static setUserData(userData: any): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  static getUserData(): any {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  static clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
