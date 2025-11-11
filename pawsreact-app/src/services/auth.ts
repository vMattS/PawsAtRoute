// src/services/auth.ts
export type Usuario = {
  idUsuario: number;
  nombre?: string;
  correo?: string;
  rol?: string; // "DUEÑO" | "PASEADOR"
  [k: string]: any;
};

const KEYS = {
  logged: "isLoggedIn",
  token: "token",
  user: "usuario",
  userId: "usuarioId",
  role: "role",
} as const;

// Lee SIEMPRE de localStorage
const get = (key: string): string | null => localStorage.getItem(key);
const remove = (key: string) => localStorage.removeItem(key);

export const Auth = {
  isLoggedIn: (): boolean => get(KEYS.logged) === "true",

  // SIEMPRE a localStorage (sin recordarme)
  login: (token: string, user: Usuario) => {
    // limpia por si hay restos
    remove(KEYS.logged);
    remove(KEYS.token);
    remove(KEYS.userId);
    remove(KEYS.user);
    remove(KEYS.role);

    localStorage.setItem(KEYS.logged, "true");
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.userId, String(user.idUsuario ?? ""));
    localStorage.setItem(KEYS.user, JSON.stringify(user));
    if (user.rol) localStorage.setItem(KEYS.role, user.rol);
  },

  setRole: (rol: string) => localStorage.setItem(KEYS.role, rol),

  getToken: (): string | null => get(KEYS.token),
  getUserId: (): string | null => get(KEYS.userId),
  getUser: (): Usuario | null => {
    const raw = get(KEYS.user);
    try { return raw ? (JSON.parse(raw) as Usuario) : null; } catch { return null; }
  },
  getRole: (): string => get(KEYS.role) ?? (Auth.getUser()?.rol ?? ""),

  logout: () => {
    remove(KEYS.logged);
    remove(KEYS.token);
    remove(KEYS.userId);
    remove(KEYS.user);
    remove(KEYS.role);
  },
};
