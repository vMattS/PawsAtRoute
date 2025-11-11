import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "./panel-components/ConfirmModal";
import {
  adminListPaseadoresPendientes,
  adminAprobarPaseador,
  adminRechazarPaseador,
  type AdminPaseadorPendiente,
  adminListUsuarios,
  adminSetStatus,
  type AdminUsuario,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function PanelAdmin() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();

  // ====== Hooks (declarar todos antes de cualquier return condicional) ======
  // Tabla 1: pendientes
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "", message: "", confirmText: "", confirmColor: "", onConfirm: () => {},
  });

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminPaseadorPendiente[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [q, setQ] = useState("");

  // Tabla 2: usuarios (paseadores aprobados y dueños)
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<AdminUsuario[]>([]);
  const [errUsers, setErrUsers] = useState<string | null>(null);
  const [workingUserId, setWorkingUserId] = useState<number | null>(null);
  const [qUsers, setQUsers] = useState("");

  // ================== Cargas ==================
  const cargarPendientes = async () => {
    setLoading(true); setErr(null);
    try {
      const data = await adminListPaseadoresPendientes();
      const onlyPend = (data.items || []).filter(
        r => r.rol === "PASEADOR" && !r.status
      );
      setRows(onlyPend);
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "No se pudo cargar la lista");
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
  setLoadingUsers(true); setErrUsers(null);
  try {
    const data = await adminListUsuarios();
    // Mostrar TODOS los paseadores (habilitados y deshabilitados) y todos los dueños
    const filtered = (data.items || []).filter(
      u => u.rol === "PASEADOR" || u.rol === "DUEÑO"
    );
    setUsers(filtered);
  } catch (e: any) {
    setErrUsers(e?.response?.data?.error || e?.message || "No se pudo cargar usuarios");
  } finally {
    setLoadingUsers(false);
  }
};


  useEffect(() => { void cargarPendientes(); void cargarUsuarios(); }, []);


// Nombre “Nombre Apellido”, con fallback
const fullName = useMemo(() => {
  if (!user) return "…";
  const cap = (s: string) =>
    s ? s.trim().toLowerCase().replace(/^\p{L}/u, c => c.toUpperCase()) : "";
  return [cap(user.nombre), cap(user.apellido)].filter(Boolean).join(" ");
}, [user]);

// Rol bonito
const prettyRol = useMemo(() => {
  if (!user?.rol) return "";
  return user.rol === "PASEADOR" ? "Paseador"
       : user.rol === "DUEÑO"    ? "Dueño"
       : "Administrador";
}, [user]);

  // ================== Memorizados ==================
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.trim().toLowerCase();
    return rows.filter(r =>
      `${r.nombre} ${r.apellido}`.toLowerCase().includes(s) ||
      (r.correo ?? "").toLowerCase().includes(s) ||
      (r.telefono ?? "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  const filteredUsers = useMemo(() => {
    if (!qUsers.trim()) return users;
    const s = qUsers.trim().toLowerCase();
    return users.filter(u =>
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(s) ||
      (u.correo ?? "").toLowerCase().includes(s) ||
      (u.telefono ?? "").toLowerCase().includes(s) ||
      u.rol.toLowerCase().includes(s)
    );
  }, [qUsers, users]);

  // ================== Helpers UI ==================
  const handleViewPdf = (fileUrl?: string | null) => {
  if (!fileUrl) return;
  setPdfSrc(fileUrl);      // ← usa el link de Cloudinary directo
  setPdfModalOpen(true);
};

  const handleOpenModal = (
    title: string, message: string, confirmText: string, confirmColor: string, onConfirm: () => void
  ) => {
    setModalConfig({ title, message, confirmText, confirmColor, onConfirm });
    setModalOpen(true);
  };

  // ================== Acciones Pendientes ==================
  const aprobar = (r: AdminPaseadorPendiente) => {
    handleOpenModal(
      "Aprobar paseador",
      `¿Aprobar a ${r.nombre} ${r.apellido}?`,
      "Aprobar",
      "bg-emerald-500",
      async () => {
        try {
          setWorkingId(r.idUsuario);
          await adminAprobarPaseador(r.idUsuario);
          await Promise.all([cargarPendientes(), cargarUsuarios()]);
        } catch (e: any) {
          alert(e?.response?.data?.error || e?.message || "No se pudo aprobar");
        } finally {
          setWorkingId(null);
          setModalOpen(false);
        }
      }
    );
  };


  
  const rechazar = (r: AdminPaseadorPendiente) => {
  handleOpenModal(
    "Denegar solicitud",
    `¿Denegar a ${r.nombre} ${r.apellido}?`,
    "Denegar",
    "bg-red-500",
    async () => {
      // --- OPTIMISTA: quita de pendientes y agrega a usuarios como deshabilitado ---
      setRows(prev => prev.filter(p => p.idUsuario !== r.idUsuario));

      setUsers(prev => {
        const existe = prev.some(u => u.idUsuario === r.idUsuario);
        const nuevo: AdminUsuario = {
          idUsuario: r.idUsuario,
          nombre: r.nombre,
          apellido: r.apellido,
          correo: r.correo,
          telefono: r.telefono ?? null,
          rol: "PASEADOR",
          status: false,                // ← deshabilitado
          carnetIdentidad: r.carnetIdentidad ?? null,
          antecedentes: r.antecedentes ?? null,
        };
        return existe
          ? prev.map(u => u.idUsuario === r.idUsuario ? { ...u, ...nuevo } : u)
          : [nuevo, ...prev];
      });

      try {
        setWorkingId(r.idUsuario);
        await adminRechazarPaseador(r.idUsuario, { revertToDueno: false });
        // Revalidar ambas tablas para quedar consistentes con el back
        await Promise.all([cargarPendientes(), cargarUsuarios()]);
      } catch (e: any) {
        // Rollback simple: recargar ambas tablas
        await Promise.all([cargarPendientes(), cargarUsuarios()]);
        alert(e?.response?.data?.error || e?.message || "No se pudo denegar");
      } finally {
        setWorkingId(null);
        setModalOpen(false);
      }
    }
  );
};


  // ================== Acciones Usuarios (toggle status) ==================
  const toggleStatus = async (u: AdminUsuario) => {
  const next = !u.status;

  // --- OPTIMISTA: actualiza "usuarios" ---
  setUsers(prev => {
    if (u.rol === "PASEADOR" && !next) {
      // paseador deshabilitado deja de estar en la tabla de aprobados
      return prev.filter(p => p.idUsuario !== u.idUsuario);
    }
    if (u.rol === "PASEADOR" && next) {
      const exists = prev.some(p => p.idUsuario === u.idUsuario);
      return exists
        ? prev.map(p => p.idUsuario === u.idUsuario ? { ...p, status: next } : p)
        : [...prev, { ...u, status: next }];
    }
    // Dueño siempre visible: solo muta status
    return prev.map(p => p.idUsuario === u.idUsuario ? { ...p, status: next } : p);
  });

  // --- OPTIMISTA: también actualiza "rows" (pendientes) ---
  setRows(prev => {
    // Solo afecta a paseadores
    if (u.rol !== "PASEADOR") return prev;

    if (!next) {
      // pasa a pendiente ⇒ agrégalo si no existe
      const exists = prev.some(r => r.idUsuario === u.idUsuario);
      if (exists) return prev;
      const nuevo: AdminPaseadorPendiente = {
        idUsuario: u.idUsuario,
        nombre: u.nombre,
        apellido: u.apellido,
        correo: u.correo,
        telefono: u.telefono ?? null,
        rol: "PASEADOR",
        status: false,
        carnetIdentidad: (u as any).carnetIdentidad ?? null,
        antecedentes: (u as any).antecedentes ?? null,
      };
      return [nuevo, ...prev];
    } else {
      // deja de ser pendiente ⇒ quítalo
      return prev.filter(r => r.idUsuario !== u.idUsuario);
    }
  });

  // --- Llamada real ---
  try {
    setWorkingUserId(u.idUsuario);
    await adminSetStatus(u.idUsuario, next);

    // Revalida AMBAS tablas para quedar 100% consistentes
    await Promise.all([cargarUsuarios(), cargarPendientes()]);
  } catch (e: any) {
    // Rollback en ambos estados si falla
    setUsers(prev =>
      // revierte a como estaba
      u.rol === "PASEADOR"
        ? (u.status
            ? [...prev, u] // si antes estaba habilitado, reintégralo
            : prev.map(p => p.idUsuario === u.idUsuario ? { ...p, status: u.status } : p))
        : prev.map(p => p.idUsuario === u.idUsuario ? { ...p, status: u.status } : p)
    );

    setRows(prev => {
      if (u.rol !== "PASEADOR") return prev;
      return u.status
        ? [...prev, { // si antes NO era pendiente, vuelve a agregarlo
            idUsuario: u.idUsuario,
            nombre: u.nombre,
            apellido: u.apellido,
            correo: u.correo,
            telefono: u.telefono ?? null,
            rol: "PASEADOR",
            status: false,
            carnetIdentidad: (u as any).carnetIdentidad ?? null,
            antecedentes: (u as any).antecedentes ?? null,
          }]
        : prev.filter(r => r.idUsuario !== u.idUsuario); // si antes SÍ era pendiente, quítalo
    });

    alert(e?.response?.data?.error || e?.message || "No se pudo actualizar el estado");
  } finally {
    setWorkingUserId(null);
  }
};


  // ================== Render ==================
  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center">Cargando…</div>;
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto text-prussian-blue p-4 sm:p-6 lg:p-8 my-6">
      <header className="mb-10 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-prussian-blue">¡Bienvenid@ {fullName}!</h1>
          <span className="bg-blue-green text-white text-sm md:text-base font-semibold px-3 py-1 rounded-full shadow-sm">
            {prettyRol}
          </span>
        </div>
        <p className="text-lg text-gray-700 max-w-3xl">
          Aquí puedes gestionar las solicitudes de los paseadores y habilitar o deshabilitar usuarios.
        </p>
      </header>

      <main className="grid grid-cols-1 gap-10">
        {/* ====== Tabla 1: Solicitudes de Paseadores (pendientes) ====== */}
        <section className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Gestión de paseadores (pendientes)</h2>

          <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="q"
              placeholder="Buscar paseador..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-green"
            />
            <button
              type="button"
              onClick={() => setQ("")}
              className="bg-blue-green hover:bg-prussian-blue text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
            >
              Limpiar
            </button>
          </form>

          {err && <div className="text-red-600 mb-4">{err}</div>}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-xl overflow-hidden">
              <thead className="bg-selective-yellow text-prussian-blue">
                <tr>
                  <th className="p-3 text-left font-semibold">Nombre</th>
                  <th className="p-3 text-left font-semibold">Correo</th>
                  <th className="p-3 text-center font-semibold">Carnet</th>
                  <th className="p-3 text-center font-semibold">Antecedentes</th>
                  <th className="p-3 text-center font-semibold">Estado</th>
                  <th className="p-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-gray-50">
                {loading ? (
                  <tr><td className="p-4" colSpan={6}>Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="p-4" colSpan={6}>No hay solicitudes pendientes</td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.idUsuario} className="hover:bg-gray-100 transition">
                      <td className="p-3">{r.nombre} {r.apellido}</td>
                      <td className="p-3">{r.correo}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleViewPdf(r.carnetIdentidad)}
                          disabled={!r.carnetIdentidad}
                          className={`${r.carnetIdentidad ? "bg-blue-green hover:bg-prussian-blue" : "bg-gray-300 cursor-not-allowed"} text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200`}
                        >
                          Ver PDF
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleViewPdf(r.antecedentes)}
                          disabled={!r.antecedentes}
                          className={`${r.antecedentes ? "bg-blue-green hover:bg-prussian-blue" : "bg-gray-300 cursor-not-allowed"} text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200`}
                        >
                          Ver PDF
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-gray-400 text-white px-3 py-1 rounded-lg text-sm">Pendiente</span>
                      </td>
                      <td className="p-3 flex flex-col sm:flex-row justify-center gap-3">
                        <button
                          onClick={() => aprobar(r)}
                          disabled={workingId === r.idUsuario}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          {workingId === r.idUsuario ? "..." : "Aprobar"}
                        </button>
                        <button
                          onClick={() => rechazar(r)}
                          disabled={workingId === r.idUsuario}
                          className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          {workingId === r.idUsuario ? "..." : "Denegar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ====== Tabla 2: Usuarios (paseadores aprobados + dueños) ====== */}
        <section className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Usuarios (Paseadores aprobados y Dueños)</h2>

          <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="qUsers"
              placeholder="Buscar por nombre, correo, teléfono o rol..."
              value={qUsers}
              onChange={(e) => setQUsers(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-green"
            />
            <button
              type="button"
              onClick={() => setQUsers("")}
              className="bg-blue-green hover:bg-prussian-blue text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
            >
              Limpiar
            </button>
          </form>

          {errUsers && <div className="text-red-600 mb-4">{errUsers}</div>}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-xl overflow-hidden">
              <thead className="bg-selective-yellow text-prussian-blue">
                <tr>
                  <th className="p-3 text-left font-semibold">Nombre</th>
                  <th className="p-3 text-left font-semibold">Correo</th>
                  <th className="p-3 text-center font-semibold">Rol</th>
                  <th className="p-3 text-center font-semibold">Estado</th>
                  <th className="p-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-gray-50">
                {loadingUsers ? (
                  <tr><td className="p-4" colSpan={5}>Cargando…</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td className="p-4" colSpan={5}>Sin registros</td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.idUsuario} className="hover:bg-gray-100 transition">
                      <td className="p-3">{u.nombre} {u.apellido}</td>
                      <td className="p-3">{u.correo}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          u.rol === "PASEADOR" ? "bg-emerald-100 text-emerald-800"
                          : u.rol === "DUEÑO" ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          u.status ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                        }`}>
                          {u.status ? "Habilitado" : "Deshabilitado"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={workingUserId === u.idUsuario}
                          className={`${
                            u.status
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-emerald-500 hover:bg-emerald-600"
                          } disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200`}
                        >
                          {workingUserId === u.idUsuario ? "..." : u.status ? "Deshabilitar" : "Habilitar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <ConfirmModal
        open={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmColor={modalConfig.confirmColor}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalOpen(false)}
      />

      {pdfModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[90%] max-w-3xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-prussian-blue">Visualización de documento</h3>
              <button
                onClick={() => setPdfModalOpen(false)}
                className="text-gray-500 hover:text-red-600 text-2xl font-bold"
                aria-label="Cerrar visor de PDF"
              >
                &times;
              </button>
            </div>
            <iframe
  src={pdfSrc || ""}
  className="w-full h-[70vh] border rounded-lg"
  title="Vista previa PDF"
  referrerPolicy="no-referrer"
/>

            <div className="mt-4 flex justify-end gap-3">
              <a
                href={pdfSrc || "#"}
                download
                className="bg-prussian-blue text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-green transition-all duration-200"
              >
                Descargar
              </a>
              <button
                onClick={() => setPdfModalOpen(false)}
                className="bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
