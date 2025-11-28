import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonChip,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonText,
  IonSpinner,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonTextarea,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useIonRouter } from "@ionic/react";
import {
  pawOutline,
  calendarOutline,
  timeOutline,
  locationOutline,
  cashOutline,
  createOutline,
  alertCircleOutline,
  addCircleOutline,
  walkOutline,
} from "ionicons/icons";
import { Auth } from "../services/auth";
import { listMisMascotas, crearPaseo, type Mascota } from "../services/api";

const MAX_MASCOTAS = 3;

const NuevoPaseo: React.FC = () => {
  const router = useIonRouter();

  useEffect(() => {
    const u = Auth.getUser();
    if (!u) {
      router.push("/login", "root");
      return;
    }
    if (u.rol !== "DUEÑO") {
      router.push("/panel-paseador/inicio", "root");
      return;
    }
  }, [router]);

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [selMascotas, setSelMascotas] = useState<number[]>([]);
  const [fechaISO, setFechaISO] = useState<string>("");
  const [duracionMin, setDuracionMin] = useState<string>("60");
  const [lugar, setLugar] = useState<string>("");
  const [metodoPago, setMetodoPago] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    open: boolean;
    header?: string;
    message?: string;
  }>({ open: false });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await listMisMascotas({ page: 1, pageSize: 50 });
        setMascotas(res.items || []);
      } catch (e: any) {
        setErr(
          e?.response?.data?.error ||
            e?.message ||
            "No se pudieron cargar tus mascotas"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleMascota = (id: number, checked: boolean) => {
    setSelMascotas((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        if (prev.length >= MAX_MASCOTAS) return prev;
        return [...prev, id];
      } else {
        return prev.filter((x) => x !== id);
      }
    });
  };

  const fechaStr = useMemo(() => {
    if (!fechaISO) return "";
    try {
      const d = new Date(fechaISO);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return "";
    }
  }, [fechaISO]);

  const horaStr = useMemo(() => {
    if (!fechaISO) return "";
    try {
      const d = new Date(fechaISO);
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mi}`;
    } catch {
      return "";
    }
  }, [fechaISO]);

  const validar = (): string | null => {
    if (!selMascotas.length) return "Debes seleccionar al menos una mascota.";
    if (selMascotas.length > MAX_MASCOTAS)
      return `Solo puedes seleccionar hasta ${MAX_MASCOTAS}.`;
    if (!fechaStr || !horaStr) return "Debes elegir fecha y hora.";
    if (!duracionMin) return "Debes elegir la duración.";
    if (!lugar || lugar.trim().length < 10)
      return "Ingresa una ubicación válida (mín. 10 caracteres).";
    return null;
  };

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validar();
    if (v) {
      setAlert({ open: true, header: "Atención", message: v });
      return;
    }

    const u = Auth.getUser();
    if (!u?.idUsuario) {
      setAlert({
        open: true,
        header: "Sesión",
        message: "Debes iniciar sesión nuevamente.",
      });
      router.push("/login", "root");
      return;
    }

    setSubmitting(true);
    setErr(null);

    try {
      const payloadBase = {
        fecha: fechaStr,
        hora: horaStr,
        duracion: Number(duracionMin),
        lugarEncuentro: lugar.trim(),
        notas: [notas, metodoPago ? `Método de pago: ${metodoPago}` : ""]
          .filter(Boolean)
          .join(" | "),
        duenioId: Number(u.idUsuario),
      };

      await Promise.all(
        selMascotas.map((mascotaId) =>
          crearPaseo({ ...payloadBase, mascotaId })
        )
      );

      setAlert({
        open: true,
        header: "¡Listo!",
        message: "Tu solicitud de paseo ha sido publicada exitosamente.",
      });
      setTimeout(() => router.push("/tabs/tab1", "root"), 1500);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo publicar el paseo";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const duracionOptions = [
    { val: "30", label: "30 min", price: "$10.000" },
    { val: "60", label: "1 hora", price: "$15.000" },
    { val: "90", label: "1h 30m", price: "$20.000" },
    { val: "120", label: "2 horas", price: "$25.000" },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="selective-yellow">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" color="prussian-blue" />
          </IonButtons>
          <IonTitle className="coffeecake" color="prussian-blue">
            Paws At Route
          </IonTitle>
        </IonToolbar>
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
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <IonText color="prussian-blue" className="ion-text-center">
            <h1 style={{ fontWeight: 800, margin: "10px 0" }}>
              Solicitar Paseo
            </h1>
            <p style={{ marginTop: 0, color: "#666" }}>
              Planifica la próxima aventura de tu mascota
            </p>
          </IonText>

          <IonCard
            style={{
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              overflow: "visible",
              marginTop: "20px",
            }}
          >
            <IonCardContent>
              {loading ? (
                <div className="ion-text-center ion-padding">
                  <IonSpinner name="dots" />
                  <p>Cargando información...</p>
                </div>
              ) : (
                <form onSubmit={publicar}>
                  {/* SECCIÓN MASCOTAS */}
                  <div className="ion-margin-bottom">
                    <IonLabel
                      style={{
                        fontWeight: 700,
                        color: "var(--ion-color-prussian-blue)",
                        marginLeft: "5px",
                      }}
                    >
                      <IonIcon
                        icon={pawOutline}
                        style={{ verticalAlign: "middle", marginRight: "5px" }}
                      />
                      ¿Quién va de paseo?{" "}
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 400,
                          color: "#999",
                        }}
                      >
                        ({selMascotas.length}/{MAX_MASCOTAS})
                      </span>
                    </IonLabel>

                    {mascotas.length ? (
                      <IonList lines="none" style={{ paddingTop: "10px" }}>
                        {mascotas.map((m) => {
                          const isSelected = selMascotas.includes(m.idMascota);
                          const isDisabled =
                            !isSelected && selMascotas.length >= MAX_MASCOTAS;
                          return (
                            <IonItem
                              key={m.idMascota}
                              style={{
                                "--background": isSelected
                                  ? "#e0f7fa"
                                  : "#f4f5f8",
                                "--border-radius": "10px",
                                marginBottom: "8px",
                                border: isSelected
                                  ? "1px solid var(--ion-color-primary)"
                                  : "1px solid transparent",
                              }}
                            >
                              <IonCheckbox
                                slot="start"
                                checked={isSelected}
                                disabled={isDisabled}
                                onIonChange={(e) =>
                                  toggleMascota(m.idMascota, e.detail.checked)
                                }
                              />
                              <IonLabel>
                                <h3 style={{ fontWeight: 700 }}>{m.nombre}</h3>
                                <p>{m.raza || "Sin raza"}</p>
                              </IonLabel>
                            </IonItem>
                          );
                        })}
                      </IonList>
                    ) : (
                      <div
                        className="ion-text-center ion-padding"
                        style={{
                          background: "#fff3e0",
                          borderRadius: "10px",
                          marginTop: "10px",
                        }}
                      >
                        <p style={{ fontSize: "0.9rem", color: "#e65100" }}>
                          No tienes mascotas registradas.
                        </p>
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => router.push("/registro-mascota")}
                        >
                          Registrar ahora
                        </IonButton>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN FECHA Y HORA */}
                  <div className="ion-margin-bottom ion-margin-top">
                    <IonLabel
                      style={{
                        fontWeight: 700,
                        color: "var(--ion-color-prussian-blue)",
                        marginLeft: "5px",
                      }}
                    >
                      <IonIcon
                        icon={calendarOutline}
                        style={{ verticalAlign: "middle", marginRight: "5px" }}
                      />
                      Fecha y Hora
                    </IonLabel>
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <IonDatetimeButton datetime="datetime-nuevo" />
                      <IonText color="medium" style={{ fontSize: "0.85rem" }}>
                        Selecciona día y horario
                      </IonText>
                    </div>
                    <IonModal keepContentsMounted>
                      <IonDatetime
                        id="datetime-nuevo"
                        presentation="date-time"
                        minuteValues="0,5,10,15,20,25,30,35,40,45,50,55"
                        onIonChange={(e) =>
                          setFechaISO(String(e.detail.value || ""))
                        }
                      />
                    </IonModal>
                  </div>

                  {/* SECCIÓN DURACIÓN (Grid Visual) */}
                  <div className="ion-margin-bottom ion-margin-top">
                    <IonLabel
                      style={{
                        fontWeight: 700,
                        color: "var(--ion-color-prussian-blue)",
                        marginLeft: "5px",
                      }}
                    >
                      <IonIcon
                        icon={walkOutline}
                        style={{ verticalAlign: "middle", marginRight: "5px" }}
                      />
                      Duración del paseo
                    </IonLabel>
                    <IonGrid
                      className="ion-no-padding"
                      style={{ marginTop: "10px" }}
                    >
                      <IonRow>
                        {duracionOptions.map((opt) => (
                          <IonCol size="6" key={opt.val}>
                            <div
                              onClick={() => setDuracionMin(opt.val)}
                              style={{
                                border:
                                  duracionMin === opt.val
                                    ? "2px solid var(--ion-color-success)"
                                    : "1px solid #e0e0e0",
                                background:
                                  duracionMin === opt.val ? "#f1f8e9" : "white",
                                borderRadius: "10px",
                                padding: "10px",
                                textAlign: "center",
                                cursor: "pointer",
                                margin: "4px",
                                transition: "all 0.2s",
                              }}
                            >
                              <IonText color="dark">
                                <h4 style={{ fontWeight: 700, margin: 0 }}>
                                  {opt.label}
                                </h4>
                              </IonText>
                              <IonText color="success">
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {opt.price}
                                </p>
                              </IonText>
                            </div>
                          </IonCol>
                        ))}
                      </IonRow>
                    </IonGrid>
                  </div>

                  {/* SECCIÓN DETALLES (Inputs) */}
                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon
                      slot="start"
                      icon={locationOutline}
                      color="medium"
                    />
                    <IonInput
                      label="Ubicación"
                      labelPlacement="floating"
                      fill="outline"
                      placeholder="Av. Principal 123"
                      value={lugar}
                      onIonChange={(e) => setLugar(e.detail.value || "")}
                      counter={true}
                      maxlength={100}
                    />
                  </IonItem>

                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon slot="start" icon={cashOutline} color="medium" />
                    <IonSelect
                      label="Método de Pago"
                      labelPlacement="floating"
                      fill="outline"
                      placeholder="Seleccionar"
                      value={metodoPago}
                      onIonChange={(e) =>
                        setMetodoPago(String(e.detail.value || ""))
                      }
                    >
                      <IonSelectOption value="efectivo">
                        Efectivo
                      </IonSelectOption>
                      <IonSelectOption value="transferencia">
                        Transferencia
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon slot="start" icon={createOutline} color="medium" />
                    <IonTextarea
                      label="Notas (Opcional)"
                      labelPlacement="floating"
                      fill="outline"
                      placeholder="Ej: Tocar timbre fuerte..."
                      value={notas}
                      onIonChange={(e) => setNotas(e.detail.value || "")}
                      counter={true}
                      maxlength={120}
                      rows={2}
                    />
                  </IonItem>

                  {err && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "15px",
                        color: "var(--ion-color-danger)",
                      }}
                    >
                      <IonIcon
                        icon={alertCircleOutline}
                        style={{ marginRight: "5px" }}
                      />
                      <IonText>
                        <p style={{ margin: 0 }}>{err}</p>
                      </IonText>
                    </div>
                  )}

                  <IonButton
                    type="submit"
                    expand="block"
                    shape="round"
                    color="prussian-blue"
                    className="ion-margin-top"
                    disabled={submitting || !mascotas.length}
                    style={{ height: "50px", fontWeight: 700 }}
                  >
                    {submitting ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Publicar Paseo
                      </>
                    )}
                  </IonButton>
                </form>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        <IonAlert
          isOpen={alert.open}
          header={alert.header}
          message={alert.message}
          buttons={["Aceptar"]}
          onDidDismiss={() => setAlert({ open: false })}
        />
      </IonContent>
    </IonPage>
  );
};

export default NuevoPaseo;