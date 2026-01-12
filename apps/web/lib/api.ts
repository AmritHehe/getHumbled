import type { ApiResponse, AuthResponse, Contest, SignInData, SignUpData, CreateContestData, CreateMCQData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
    private token: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    getToken(): string | null {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An error occurred',
            };
        }
    }

    // User Auth endpoints (role: USER)
    async signUp(data: Omit<SignUpData, 'role'>): Promise<ApiResponse<{ name: string; email: string }>> {
        return this.request('/user/signUp', {
            method: 'POST',
            body: JSON.stringify({ ...data, role: 'USER' }),
        });
    }

    async signIn(data: Omit<SignInData, 'role'>): Promise<ApiResponse<AuthResponse>> {
        const response = await this.request<AuthResponse>('/user/signIn', {
            method: 'POST',
            body: JSON.stringify({ ...data, role: 'USER' }),
        });

        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    // Admin Auth endpoints (role: ADMIN)
    async adminSignUp(data: Omit<SignUpData, 'role'>): Promise<ApiResponse<{ name: string; email: string }>> {
        const payload = { ...data, role: 'ADMIN' };
        console.log('Admin SignUp payload:', payload);
        return this.request('/signUp', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async adminSignIn(data: Omit<SignInData, 'role'>): Promise<ApiResponse<AuthResponse>> {
        const payload = { ...data, role: 'ADMIN' };
        console.log('Admin SignIn payload:', payload);
        const response = await this.request<AuthResponse>('/signin', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    signOut() {
        this.setToken(null);
    }

    // Contest endpoints - uses public route if no token
    async getContests(status: 'UPCOMING' | 'LIVE' | 'CLOSED' | 'ALL' = 'ALL'): Promise<ApiResponse<Contest[]>> {
        const endpoint = this.token ? '/contests' : '/contests/public';
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({ status }),
        });
    }

    async getContest(contestId: string): Promise<ApiResponse<Contest>> {
        const endpoint = this.token ? '/getContest' : '/contest/public';
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({ contestId }),
        });
    }

    // Protected routes (require auth)
    async createContest(data: CreateContestData): Promise<ApiResponse<{ contestId: string }>> {
        return this.request('/contests/new', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async createMCQ(data: CreateMCQData): Promise<ApiResponse<void>> {
        return this.request('/question/new', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new ApiClient();
