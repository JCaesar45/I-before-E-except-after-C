interface AuthPayload {
    clientId: string;
    accessKey: string;
}

interface AuthResponse {
    sessionToken: string;
    redirectUri: string;
    expiresAt: number;
}

interface ApiError {
    status: number;
    message: string;
}

class VaultApiClient {
    private readonly baseUrl: string;
    private readonly headers: HeadersInit;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...(options.headers as HeadersInit)
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw {
                    status: response.status,
                    message: errorData.error || 'Unknown API error'
                } as ApiError;
            }

            return await response.json() as T;
        } catch (error) {
            if ((error as ApiError).status) {
                throw error;
            }
            throw { status: 0, message: 'Network error' } as ApiError;
        }
    }

    public async authenticate(payload: AuthPayload): Promise<AuthResponse> {
        return this.request<AuthResponse>('/api/v1/authenticate', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
}

class SessionManager {
    private static instance: SessionManager;
    private token: string | null = null;
    private expiresAt: number = 0;

    private constructor() {}

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    public setSession(token: string, expiresAt: number): void {
        this.token = token;
        this.expiresAt = expiresAt;
        sessionStorage.setItem('aether_token', token);
        sessionStorage.setItem('aether_expires', expiresAt.toString());
    }

    public isValid(): boolean {
        const storedToken = sessionStorage.getItem('aether_token');
        const storedExpiry = sessionStorage.getItem('aether_expires');
        
        if (!storedToken || !storedExpiry) return false;
        
        this.token = storedToken;
        this.expiresAt = parseInt(storedExpiry, 10);
        
        return Date.now() / 1000 < this.expiresAt;
    }

    public getToken(): string | null {
        return this.isValid() ? this.token : null;
    }

    public clear(): void {
        this.token = null;
        this.expiresAt = 0;
        sessionStorage.removeItem('aether_token');
        sessionStorage.removeItem('aether_expires');
    }
}

export { VaultApiClient, SessionManager, AuthPayload, AuthResponse };
