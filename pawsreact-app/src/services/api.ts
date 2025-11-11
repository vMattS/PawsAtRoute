// src/services/api.ts
import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/** Base URL desde Vite o fallback */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://pawsatroute-production.up.railway.app/api";

/** Cliente Axios */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

/** Token en memoria + persistido */
let accessToken: string | null = localStorage.getItem("access_token") || null;

let token: string | null = localStorage.getItem("access_token");
/** ——— Interceptor de REQUEST: adjunta Bearer ——— */
api.interceptors.request.use((config) => {
  if (!accessToken) accessToken = localStorage.getItem("access_token");
  if (accessToken && config.headers) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

/** ——— Interceptor de RESPONSE: intenta refresh 401 ——— */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        accessToken = (res.data as any).token;
        if (accessToken) localStorage.setItem("access_token", accessToken);

        if (originalRequest.headers)
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("No se pudo refrescar el token:", refreshError);
        accessToken = null;
        localStorage.removeItem("access_token");
        localStorage.removeItem("usuario");     // ← añade
        localStorage.removeItem("role");        // ← añade
        localStorage.removeItem("isLoggedIn");
        // Importante: NO navegues aquí con window.location si usas Router
        // deja que la UI maneje la redirección cuando detecte no login.
      }
    }
    return Promise.reject(error);
  }
);

/** ——— Tipos ——— */
export interface LoginResponse {
  token: string;
  user: {
    idUsuario: number;
    nombre: string;
    correo: string;
    rol: string;   // PASEADOR | DUEÑO (backend)
    token: string; // si también viene aquí, ok
  };
  remember: boolean;
}

export type EstadoPaseo =
  | "PENDIENTE"
  | "ACEPTADO"
  | "EN_CURSO"
  | "FINALIZADO"
  | "CANCELADO";

export type Paseo = {
  idPaseo: number;
  mascotaId: number;
  duenioId: number;
  paseadorId: number | null;
  fecha: string; // ISO
  hora: string; // ISO
  duracion: number; // minutos
  lugarEncuentro: string;
  estado: EstadoPaseo;
  notas?: string | null;
};

export type Mascota = {
  idMascota: number;
  usuarioId: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
};

export type Paginated<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export type PaseoListItem = Paseo & {
  mascota: { nombre: string; especie: string; raza: string };
  duenio?: { nombre: string; apellido: string };
  paseador?: { nombre: string; apellido: string } | null;
  paseadorNombre?: string | null;
};

/** ——— Helpers ——— */
function withAbort<T>(fn: (signal: AbortSignal) => Promise<T>, ms = 12000) {
  return new Promise<T>((resolve, reject) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), ms);
    fn(controller.signal).then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/** ——— Auth API ——— */
export const login = async (
  correo: string,
  password: string,
  remember = false
): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>(
    "/auth/login",
    { email: correo, password, remember },
    { withCredentials: false } // ← MUY IMPORTANTE (cookie RT)
  );

  // Acceso en memoria + persistido para el interceptor
  accessToken = res.data.token;
  if (accessToken) localStorage.setItem("access_token", accessToken);

  // (opcional) si quieres mantener "usuario" suelto además de Auth
  localStorage.setItem("usuario", JSON.stringify(res.data.user));

  return res.data;
};


export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout"); // revoca RT
  } catch (e) {
    // incluso si falla, borra local para no bloquear la UI
    console.warn("logout error (continuando):", e);
  } finally {
    accessToken = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("usuario");       
    localStorage.removeItem("role");          
    localStorage.removeItem("isLoggedIn");    
    console.log(accessToken);
  }
};

export const getProfile = async (): Promise<any> => {
  const res = await api.get("/auth/profile");
  return res.data;
};

export const register = async (data: {
  rut: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  clave: string;
  comuna: string;
  rol: string; // 'DUEÑO' | 'PASEADOR'
  carnet?: File;
  antecedentes?: File;
}) => {
  let res;
  if (data.rol === "PASEADOR") {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && typeof v !== "object")
        formData.append(k, String(v));
    });
    if (data.carnet) formData.append("carnet", data.carnet);
    if (data.antecedentes) formData.append("antecedentes", data.antecedentes);
    res = await api.post("/auth/register", formData);
  } else {
    res = await api.post("/auth/register", data);
  }
  return res.data;
};

/** ——— Códigos/recuperación ——— */
export const sendVerificationCode = async (correo: string) =>
  withAbort(async () => {
    const res = await api.post("/auth/send-code", { correo });
    return res.data as { message: string };
  });

export const verifyCode = async (correo: string, codigo: number) =>
  withAbort(async () => {
    const res = await api.post("/auth/verify-code", { correo, codigo });
    return res.data as { message: string };
  });

export const resetPassword = async (correo: string, nuevaClave: string) =>
  withAbort(async () => {
    const res = await api.put("/auth/reset-password", { correo, nuevaClave });
    return res.data as { message: string };
  });

/** ——— Paseos ——— */
export const crearPaseo = async (payload: {
  mascotaId: number;
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:mm"
  duracion: number;
  lugarEncuentro: string;
  notas?: string;
  duenioId?: number;
}) => {
  const res = await api.post<{ paseo: Paseo }>("/auth/paseos", payload);
  return res.data.paseo;
};

export const listPaseos = async (params?: {
  mias?: boolean;
  disponibles?: boolean;
  estado?: EstadoPaseo;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
}) => {
  const res = await api.get<Paginated<PaseoListItem>>("/auth/listpaseos", {
    params,
  });
  return res.data;
};

export const listPaseosDisponibles = async (params?: {
  page?: number;
  pageSize?: number;
  desde?: string;
  hasta?: string;
}) => {
  const res = await api.get<
    Paginated<
      Paseo & {
        mascota: { nombre: string; especie: string; raza: string };
      }
    >
  >("/auth/listpaseos", { params: { disponibles: true, ...(params || {}) } });
  return res.data;
};

export const listMisPaseosComoPaseador = async (params?: {
  page?: number;
  pageSize?: number;
  desde?: string;
  hasta?: string;
  estado?: EstadoPaseo;
}) => {
  const res = await api.get<
    Paginated<
      Paseo & {
        mascota: { nombre: string; especie: string; raza: string };
      }
    >
  >("/auth/listpaseos", { params: { mias: true, ...(params || {}) } });
  return res.data;
};

export const aceptarPaseo = async (idPaseo: number) => {
  const res = await api.post<{ paseo: Paseo }>(
    `/auth/paseos/${idPaseo}/accept`
  );
  return res.data.paseo;
};

export const startPaseo = async (idPaseo: number) => {
  const res = await api.post<{ paseo: Paseo }>(
    `/auth/paseos/${idPaseo}/start`
  );
  return res.data.paseo;
};

export const finishPaseo = async (idPaseo: number) => {
  const res = await api.post<{ paseo: Paseo }>(
    `/auth/paseos/${idPaseo}/finish`
  );
  return res.data.paseo;
};

export const createMascota = async (payload: {
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
}) => {
  const res = await api.post<{ mascota: Mascota }>(
    "/auth/crearmascotas",
    payload
  );
  return res.data.mascota;
};

export const listMisMascotas = async (params?: {
  page?: number;
  pageSize?: number;
}) => {
  const res = await api.get<Paginated<Mascota>>("/auth/mismascotas", {
    params,
  });
  return res.data;
};

export const listMascotasByDuenio = async (
  duenioId: number,
  params?: { page?: number; pageSize?: number }
) => {
  const res = await api.get<Paginated<Mascota>>(
    `/auth/dueno/${duenioId}/mascotas`,
    { params }
  );
  return res.data;
};

export default api;