import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonText,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonChip,
} from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import { useState, useCallback } from "react";
import {
  personOutline,
  callOutline,
  idCardOutline,
  mailOutline,
  lockClosedOutline,
  mapOutline,
  documentAttachOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
} from "ionicons/icons";
import { register as apiRegister } from "../services/api";

const validateRol = (rol: string) => {
  if (!rol) return "Debes seleccionar un rol.";
  return undefined;
};

const validateNombre = (nombre: string) => {
  const errores = [];
  if (!nombre) return "Obligatorio.";
  if (nombre.length < 3 || nombre.length > 15) errores.push("3-15 caracteres.");
  if (/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g.test(nombre)) errores.push("Solo letras.");
  return errores.length > 0 ? errores.join(" ") : undefined;
};

const validateApellido = (apellido: string) => {
  const errores = [];
  if (!apellido) return "Obligatorio.";
  if (apellido.length < 3 || apellido.length > 15)
    errores.push("3-15 caracteres.");
  if (/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g.test(apellido)) errores.push("Solo letras.");
  return errores.length > 0 ? errores.join(" ") : undefined;
};

const validateTelefono = (telefono: string) => {
  if (!telefono) return "Obligatorio.";
  if (telefono.length !== 9) return "Debe tener 9 dígitos.";
  return undefined;
};

const validateRut = (rut: string) => {
  if (!rut) return "Obligatorio.";
  if (!/^\d{7,8}-[\dkK]$/.test(rut)) return "Formato 12345678-9.";
  return undefined;
};

const validateEmail = (correo: string) => {
  if (!correo) return "El correo es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return "Correo inválido.";
  return undefined;
};

const validatePassword = (password: string) => {
  const erroresPassword = [];
  if (!password) return "Obligatoria.";
  if (password.length < 8) erroresPassword.push("Min 8 caracteres.");
  if (!/[A-Z]/.test(password)) erroresPassword.push("Una mayúscula.");
  if (!/\d/.test(password)) erroresPassword.push("Un número.");
  return erroresPassword.length > 0 ? erroresPassword.join(" ") : undefined;
};

const validateComuna = (comuna: string) => {
  if (!comuna) return "Selecciona una comuna.";
  return undefined;
};

const validateFiles = (
  rol: string,
  carnet: File | null,
  antecedentes: File | null
) => {
  if (rol === "paseador" && (!carnet || !antecedentes)) {
    return "Debes adjuntar ambos documentos.";
  }
  return undefined;
};

const HeaderWave: React.FC = () => (
  <div style={{ overflow: "hidden" }}>
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 1200 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        fill: "var(--ion-color-selective-yellow)",
        width: "125%",
        height: 35,
      }}
    >
      <path
        d="M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z"
        opacity=".25"
      />
      <path
        d="M0 0v15.81c13 21.11 27.64 41.05 47.69 56.24C99.41 111.27 165 111 224.58 91.58c31.15-10.15 60.09-26.07 89.67-39.8 40.92-19 84.73-46 130.83-49.67 36.26-2.85 70.9 9.42 98.6 31.56 31.77 25.39 62.32 62 103.63 73 40.44 10.79 81.35-6.69 119.13-24.28s75.16-39 116.92-43.05c59.73-5.85 113.28 22.88 168.9 38.84 30.2 8.66 59 6.17 87.09-7.5 22.43-10.89 48-26.93 60.65-49.24V0z"
        opacity=".5"
      />
      <path d="M0 0v5.63C149.93 59 314.09 71.32 475.83 42.57c43-7.64 84.23-20.12 127.61-26.46 59-8.63 112.48 12.24 165.56 35.4C827.93 77.22 886 95.24 951.2 90c86.53-7 172.46-45.71 248.8-84.81V0z" />
    </svg>
  </div>
);

type FormErrors = {
  rol?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rut?: string;
  correo?: string;
  password?: string;
  comuna?: string;
  files?: string;
};

const Registro: React.FC = () => {
  const router = useIonRouter();

  const [rol, setRol] = useState<string>("dueño"); // Default a dueño
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rut, setRut] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [comuna, setComuna] = useState("");

  const [carnetFile, setCarnetFile] = useState<File | null>(null);
  const [antecedentesFile, setAntecedentesFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

  const handleNombreInput = useCallback((e: any) => {
    const input = e.detail.value || "";
    setNombre(input.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, ""));
  }, []);
  const handleApellidoInput = useCallback((e: any) => {
    const input = e.detail.value || "";
    setApellido(input.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, ""));
  }, []);
  const handleTelefonoInput = useCallback((e: any) => {
    const input = e.detail.value || "";
    setTelefono(input.replace(/\D/g, "").slice(0, 9));
  }, []);
  const handleRutInput = useCallback((e: any) => {
    let input = e.detail.value || "";
    input = input.replace(/[^0-9Kk-]/g, "").replace(/(?!^)-(?=.*-)/g, "");
    setRut(input.slice(0, 10));
  }, []);

  const validarFormulario = useCallback(() => {
    const nuevosErrores: FormErrors = {};
    nuevosErrores.rol = validateRol(rol);
    nuevosErrores.nombre = validateNombre(nombre);
    nuevosErrores.apellido = validateApellido(apellido);
    nuevosErrores.telefono = validateTelefono(telefono);
    nuevosErrores.rut = validateRut(rut);
    nuevosErrores.correo = validateEmail(correo);
    nuevosErrores.password = validatePassword(password);
    nuevosErrores.comuna = validateComuna(comuna);
    nuevosErrores.files = validateFiles(rol, carnetFile, antecedentesFile);

    const activeErrors = Object.fromEntries(
      Object.entries(nuevosErrores).filter(([_, v]) => v !== undefined)
    );
    setErrors(activeErrors);
    return Object.keys(activeErrors).length === 0;
  }, [
    rol,
    nombre,
    apellido,
    telefono,
    rut,
    correo,
    password,
    comuna,
    carnetFile,
    antecedentesFile,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrorMsg(null);
    if (!validarFormulario()) return;

    setSubmitting(true);
    try {
      const rolApi = rol === "paseador" ? "PASEADOR" : "DUEÑO";
      await apiRegister({
        rut,
        nombre,
        apellido,
        telefono,
        correo,
        clave: password,
        comuna,
        rol: rolApi,
        carnet: rolApi === "PASEADOR" ? carnetFile ?? undefined : undefined,
        antecedentes:
          rolApi === "PASEADOR" ? antecedentesFile ?? undefined : undefined,
      });
      router.push("/login", "root");
    } catch (err: any) {
      setApiErrorMsg(
        err?.response?.data?.error ||
          err?.message ||
          "No se pudo completar el registro."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="selective-yellow">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" color="prussian-blue" />
          </IonButtons>
          <IonTitle className="coffeecake" color="prussian-blue">
            Paws At Route
          </IonTitle>
        </IonToolbar>
        <HeaderWave />
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <IonText color="prussian-blue" className="ion-text-center">
            <h1 style={{ fontWeight: 800, margin: "10px 0" }}>
              Crea tu cuenta
            </h1>
            <p style={{ color: "#666", marginTop: 0 }}>
              Únete a nuestra comunidad
            </p>
          </IonText>

          <IonCard
            style={{
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              overflow: "visible",
            }}
          >
            <IonCardContent>
              {/* Selector de Rol Mejorado */}
              <div className="ion-margin-bottom">
                <IonLabel
                  style={{ marginLeft: "5px", fontWeight: 600, color: "#555" }}
                >
                  ¿Qué deseas hacer?
                </IonLabel>
                <IonSegment
                  value={rol}
                  onIonChange={(e) => setRol(e.detail.value as string)}
                  style={{
                    background: "#f4f5f8",
                    borderRadius: "12px",
                    padding: "4px",
                    marginTop: "8px",
                  }}
                >
                  <IonSegmentButton value="dueño">
                    <IonLabel style={{ fontWeight: 700 }}>Dueño</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="paseador">
                    <IonLabel style={{ fontWeight: 700 }}>Paseador</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>

              <div
                style={{
                  marginBottom: "20px",
                  padding: "10px",
                  background: rol === "dueño" ? "#e8f5e9" : "#fff3e0",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IonIcon
                  icon={rol === "dueño" ? checkmarkCircleOutline : timeOutline}
                  style={{
                    fontSize: "24px",
                    marginRight: "10px",
                    color:
                      rol === "dueño"
                        ? "var(--ion-color-success)"
                        : "var(--ion-color-warning)",
                  }}
                />
                <IonText
                  style={{
                    fontSize: "0.85rem",
                    color: "#444",
                    lineHeight: "1.3",
                  }}
                >
                  {rol === "dueño"
                    ? "Tu cuenta estará activa de inmediato para solicitar paseos."
                    : "Tu cuenta requerirá aprobación de un administrador (carnet y antecedentes)."}
                </IonText>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <IonGrid className="ion-no-padding">
                  <IonRow>
                    <IonCol size="6">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonIcon
                          slot="start"
                          icon={personOutline}
                          color="medium"
                        />
                        <IonInput
                          fill="outline"
                          label="Nombre"
                          labelPlacement="floating"
                          value={nombre}
                          onIonInput={handleNombreInput}
                          maxlength={15}
                        />
                      </IonItem>
                      {errors.nombre && (
                        <IonText color="danger">
                          <p
                            style={{
                              fontSize: "0.75rem",
                              margin: "-10px 0 10px 5px",
                            }}
                          >
                            {errors.nombre}
                          </p>
                        </IonText>
                      )}
                    </IonCol>
                    <IonCol size="6">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonInput
                          fill="outline"
                          label="Apellido"
                          labelPlacement="floating"
                          value={apellido}
                          onIonInput={handleApellidoInput}
                          maxlength={15}
                        />
                      </IonItem>
                      {errors.apellido && (
                        <IonText color="danger">
                          <p
                            style={{
                              fontSize: "0.75rem",
                              margin: "-10px 0 10px 5px",
                            }}
                          >
                            {errors.apellido}
                          </p>
                        </IonText>
                      )}
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="6">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonIcon
                          slot="start"
                          icon={idCardOutline}
                          color="medium"
                        />
                        <IonInput
                          fill="outline"
                          label="RUT"
                          labelPlacement="floating"
                          placeholder="12345678-9"
                          value={rut}
                          onIonInput={handleRutInput}
                          maxlength={10}
                        />
                      </IonItem>
                      {errors.rut && (
                        <IonText color="danger">
                          <p
                            style={{
                              fontSize: "0.75rem",
                              margin: "-10px 0 10px 5px",
                            }}
                          >
                            {errors.rut}
                          </p>
                        </IonText>
                      )}
                    </IonCol>
                    <IonCol size="6">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonIcon
                          slot="start"
                          icon={callOutline}
                          color="medium"
                        />
                        <IonLabel
                          slot="start"
                          style={{ margin: 0, color: "#666" }}
                        >
                          +569
                        </IonLabel>
                        <IonInput
                          fill="outline"
                          label="Teléfono"
                          labelPlacement="floating"
                          type="tel"
                          value={telefono}
                          onIonInput={handleTelefonoInput}
                          maxlength={9}
                        />
                      </IonItem>
                      {errors.telefono && (
                        <IonText color="danger">
                          <p
                            style={{
                              fontSize: "0.75rem",
                              margin: "-10px 0 10px 5px",
                            }}
                          >
                            {errors.telefono}
                          </p>
                        </IonText>
                      )}
                    </IonCol>
                  </IonRow>

                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon slot="start" icon={mapOutline} color="medium" />
                    <IonSelect
                      fill="outline"
                      label="Comuna"
                      labelPlacement="floating"
                      value={comuna}
                      onIonChange={(e) => setComuna(e.detail.value)}
                    >
                      {[
                        "Alhué",
                        "Buin",
                        "Calera de Tango",
                        "Cerrillos",
                        "Cerro Navia",
                        "Colina",
                        "Conchalí",
                        "Curacaví",
                        "El Bosque",
                        "El Monte",
                        "Estación Central",
                        "Huechuraba",
                        "Independencia",
                        "Isla de Maipo",
                        "La Cisterna",
                        "La Florida",
                        "La Granja",
                        "La Pintana",
                        "La Reina",
                        "Lampa",
                        "Las Condes",
                        "Lo Barnechea",
                        "Lo Espejo",
                        "Lo Prado",
                        "Macul",
                        "Maipú",
                        "María Pinto",
                        "Melipilla",
                        "Ñuñoa",
                        "Padre Hurtado",
                        "Paine",
                        "Pedro Aguirre Cerda",
                        "Peñaflor",
                        "Peñalolén",
                        "Pirque",
                        "Providencia",
                        "Pudahuel",
                        "Puente Alto",
                        "Quilicura",
                        "Quinta Normal",
                        "Recoleta",
                        "Renca",
                        "San Bernardo",
                        "San Joaquín",
                        "San José de Maipo",
                        "San Miguel",
                        "San Pedro",
                        "San Ramón",
                        "Santiago",
                        "Talagante",
                        "Tiltil",
                        "Vitacura",
                      ].map((c) => (
                        <IonSelectOption key={c} value={c}>
                          {c}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  {errors.comuna && (
                    <IonText color="danger">
                      <p
                        style={{
                          fontSize: "0.75rem",
                          margin: "-10px 0 10px 5px",
                        }}
                      >
                        {errors.comuna}
                      </p>
                    </IonText>
                  )}

                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon slot="start" icon={mailOutline} color="medium" />
                    <IonInput
                      fill="outline"
                      label="Correo"
                      labelPlacement="floating"
                      type="email"
                      value={correo}
                      onIonChange={(e) => setCorreo(e.detail.value!)}
                    />
                  </IonItem>
                  {errors.correo && (
                    <IonText color="danger">
                      <p
                        style={{
                          fontSize: "0.75rem",
                          margin: "-10px 0 10px 5px",
                        }}
                      >
                        {errors.correo}
                      </p>
                    </IonText>
                  )}

                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon
                      slot="start"
                      icon={lockClosedOutline}
                      color="medium"
                    />
                    <IonInput
                      fill="outline"
                      label="Contraseña"
                      labelPlacement="floating"
                      type="password"
                      value={password}
                      onIonChange={(e) => setPassword(e.detail.value!)}
                    >
                      <IonInputPasswordToggle slot="end" color="medium" />
                    </IonInput>
                  </IonItem>
                  {errors.password && (
                    <IonText color="danger">
                      <p
                        style={{
                          fontSize: "0.75rem",
                          margin: "-10px 0 10px 5px",
                        }}
                      >
                        {errors.password}
                      </p>
                    </IonText>
                  )}

                  {rol === "paseador" && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        border: "1px dashed #bdbdbd",
                        borderRadius: "12px",
                      }}
                    >
                      <IonText color="medium">
                        <h6
                          style={{
                            margin: "0 0 10px 0",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          Documentación requerida (PDF)
                        </h6>
                      </IonText>

                      <IonItem
                        lines="none"
                        style={{
                          "--background": "transparent",
                          "--padding-start": 0,
                        }}
                      >
                        <IonIcon
                          slot="start"
                          icon={documentAttachOutline}
                          color="secondary"
                        />
                        <div style={{ width: "100%" }}>
                          <IonLabel
                            position="stacked"
                            style={{ marginBottom: "5px" }}
                          >
                            Carnet de Identidad
                          </IonLabel>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              setCarnetFile(e.target.files?.[0] ?? null)
                            }
                            style={{ fontSize: "0.8rem" }}
                          />
                        </div>
                      </IonItem>

                      <IonItem
                        lines="none"
                        style={{
                          "--background": "transparent",
                          "--padding-start": 0,
                        }}
                      >
                        <IonIcon
                          slot="start"
                          icon={documentAttachOutline}
                          color="secondary"
                        />
                        <div style={{ width: "100%" }}>
                          <IonLabel
                            position="stacked"
                            style={{ marginBottom: "5px" }}
                          >
                            Antecedentes Penales
                          </IonLabel>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              setAntecedentesFile(e.target.files?.[0] ?? null)
                            }
                            style={{ fontSize: "0.8rem" }}
                          />
                        </div>
                      </IonItem>
                      {errors.files && (
                        <IonChip color="danger" outline>
                          <IonLabel>{errors.files}</IonLabel>
                        </IonChip>
                      )}
                    </div>
                  )}
                </IonGrid>

                {apiErrorMsg && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "15px",
                      color: "var(--ion-color-danger)",
                    }}
                  >
                    <IonIcon
                      icon={alertCircleOutline}
                      style={{ marginRight: "5px" }}
                    />
                    <IonText>
                      <p style={{ margin: 0 }}>{apiErrorMsg}</p>
                    </IonText>
                  </div>
                )}

                <IonButton
                  expand="block"
                  shape="round"
                  type="submit"
                  disabled={submitting}
                  color="prussian-blue"
                  className="ion-margin-top"
                  style={{
                    height: "50px",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  {submitting ? <IonSpinner name="crescent" /> : "Crear Cuenta"}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Registro;