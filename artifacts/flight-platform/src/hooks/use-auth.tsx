import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetCurrentUser, 
  useLoginUser, 
  useRegisterUser,
  type User,
  type LoginRequest,
  type RegisterRequest
} from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  token: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("flight_token"));
  const queryClient = useQueryClient();

  // Custom request options injection for authenticated calls
  const requestOptions = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

  const { data: user, isLoading, refetch } = useGetCurrentUser({
    request: requestOptions,
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem("flight_token", newToken);
    setToken(newToken);
    setTimeout(() => refetch(), 100);
  };

  const login = async (data: LoginRequest) => {
    const res = await loginMutation.mutateAsync({ data });
    handleAuthSuccess(res.token);
  };

  const register = async (data: RegisterRequest) => {
    const res = await registerMutation.mutateAsync({ data });
    handleAuthSuccess(res.token);
  };

  const logout = () => {
    localStorage.removeItem("flight_token");
    setToken(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isLoading: !!token && isLoading,
      login,
      register,
      logout,
      token,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Utility hook to get request options for other queries/mutations
export function useApiAuthOptions() {
  const { token } = useAuth();
  return {
    request: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  };
}
