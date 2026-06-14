import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  reauthenticate,
  type AuthUser,
} from "./api";

export const TOKEN_KEY = "sanctum_token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Restore a previous session on first load (if a token is stored).
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    reauthenticate(token)
      .then((res) => {
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        setUser(res.user);
        setStatus("authenticated");
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    setUser(res.user);
    setStatus("authenticated");
  };

  const signOut = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await apiLogout(token);
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("unauthenticated");
  };

  const isAdmin = !!user && !!user.isAdmin;

  return (
    <AuthContext.Provider value={{ user, status, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
