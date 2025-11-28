import { useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import {
  addCircleOutline,
  pawOutline,
  calendarOutline,
  timeOutline,
  hourglassOutline,
  locationOutline,
  personOutline,
  walkOutline,
  refreshOutline,
} from "ionicons/icons";
import { Auth, type Usuario } from "../services/auth";
import {
  listPaseos,
  type Paginated,
  type PaseoListItem,
} from "../services/api";

const Tab1: React.FC = () => {
  const router = useIonRouter();

  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState<Paginated<PaseoListItem> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

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
    setUser(u);
  }, [router]);

  const soloNoFinalizados = (items: PaseoListItem[]) =>
    (items || []).filter((p) => p.estado !== "FINALIZADO");

  const cargarDatos = async (reset = false, event?: CustomEvent) => {
    if (!user) return;
    if (reset) {
      setLoading(true);
      setPage(1);
    }

    setErr(null);
    try {
      const res = await listPaseos({ mias: true, page: 1, pageSize });
      setData({
        ...res,
        items: soloNoFinalizados(res.items),
        total: soloNoFinalizados(res.items).length,
      });
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Error cargando paseos");
    } finally {
      setLoading(false);
      if (event) (event.target as HTMLIonRefresherElement).complete();
    }
  };

  useEffect(() => {
    cargarDatos(true);
  }, [user, pageSize]);

  const cargarMas = async () => {
    if (!data) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await listPaseos({ mias: true, page: nextPage, pageSize });
      const nuevos = soloNoFinalizados(res.items);
      setData((prev) =>
        prev
          ? {
              ...res,
              items: [...(prev.items || []), ...nuevos],
              total: (prev.items?.length || 0) + nuevos.length,
            }
          : res
      );
      setPage(nextPage);
    } catch (e: any) {
      setErr(
        e?.response?.data?.error || e?.message || "Error cargando más paseos"
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // Formato de fecha más ordenado (dd/mm/yyyy)
  const formatFecha = (iso?: string) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  // Formato de hora limpio (HH:mm)
  const formatHora = (iso?: string) => {
    if (!iso) return "—";
    try {
      // Maneja tanto ISO completo como formato HH:mm:ss
      const d = iso.includes("T")
        ? new Date(iso)
        : new Date(`2000-01-01T${iso}`);
      return d.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return "warning";
      case "ACEPTADO":
        return "tertiary";
      case "EN_CURSO":
        return "success";
      default:
        return "medium";
    }
  };

  const renderSkeleton = () => (
    <>
      {[1, 2].map((i) => (
        <IonCard
          key={i}
          style={{
            borderRadius: "16px",
            boxShadow: "none",
            background: "#f4f5f8",
          }}
        >
          <IonCardContent>
            <IonSkeletonText
              animated
              style={{ width: "60%", height: "20px", marginBottom: "10px" }}
            />
            <IonSkeletonText
              animated
              style={{ width: "40%", height: "15px" }}
            />
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="selective-yellow">
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

      <IonContent className="ion-padding" fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={(e) => cargarDatos(false, e)}>
          <IonRefresherContent pullingIcon={walkOutline} />
        </IonRefresher>

        <div className="ion-margin-bottom">
          <IonText color="prussian-blue">
            <h1 style={{ fontWeight: 800, margin: 0 }}>
              Hola, {user?.nombre || "Dueño"}
            </h1>
            <p style={{ marginTop: "4px", color: "#666" }}>
              Gestiona tus mascotas y paseos.
            </p>
          </IonText>
        </div>

        <IonGrid className="ion-no-padding ion-margin-bottom">
          <IonRow>
            <IonCol size="6">
              <IonCard
                button
                onClick={() => router.push("/nuevo-paseo")}
                style={{
                  margin: "0 8px 0 0",
                  height: "100%",
                  borderRadius: "16px",
                  background: "var(--ion-color-prussian-blue)",
                  color: "white",
                }}
              >
                <IonCardContent className="ion-text-center">
                  <IonIcon
                    icon={addCircleOutline}
                    style={{ fontSize: "32px", marginBottom: "8px" }}
                  />
                  <IonText>
                    <h3
                      style={{ fontWeight: 700, margin: 0, fontSize: "0.9rem" }}
                    >
                      Nuevo Paseo
                    </h3>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard
                button
                onClick={() => router.push("/registro-mascota")}
                style={{
                  margin: "0 0 0 8px",
                  height: "100%",
                  borderRadius: "16px",
                  background: "white",
                  border: "1px solid #e0e0e0",
                }}
              >
                <IonCardContent className="ion-text-center">
                  <IonIcon
                    icon={pawOutline}
                    color="prussian-blue"
                    style={{ fontSize: "32px", marginBottom: "8px" }}
                  />
                  <IonText color="prussian-blue">
                    <h3
                      style={{ fontWeight: 700, margin: 0, fontSize: "0.9rem" }}
                    >
                      Nueva Mascota
                    </h3>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonText color="prussian-blue" className="ion-margin-top">
          <h2
            style={{ fontWeight: 700, fontSize: "1.2rem", marginTop: "20px" }}
          >
            Mis paseos activos
          </h2>
        </IonText>

        {loading && !data ? (
          renderSkeleton()
        ) : (
          <>
            {err && (
              <div className="ion-padding ion-text-center">
                <IonText color="danger">
                  <p>{err}</p>
                </IonText>
                <IonButton fill="clear" onClick={() => cargarDatos(true)}>
                  Reintentar
                </IonButton>
              </div>
            )}

            {data?.items?.length ? (
              <>
                {data.items.map((p) => (
                  <IonCard
                    key={p.idPaseo}
                    style={{
                      borderRadius: "16px",
                      margin: "10px 0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <IonCardHeader style={{ paddingBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <IonCardTitle
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 800,
                              color: "var(--ion-color-prussian-blue)",
                            }}
                          >
                            {p.mascota?.nombre ?? "Mascota"}
                          </IonCardTitle>
                          <IonCardSubtitle
                            style={{
                              textTransform: "none",
                              fontSize: "0.85rem",
                            }}
                          >
                            {p.mascota?.raza || "Raza no especificada"}
                          </IonCardSubtitle>
                        </div>
                        <IonChip
                          color={estadoColor(p.estado)}
                          style={{
                            margin: 0,
                            height: "24px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}
                        >
                          {p.estado}
                        </IonChip>
                      </div>
                    </IonCardHeader>

                    <IonCardContent>
                      <div
                        style={{
                          background: "#f8f9fa",
                          borderRadius: "12px",
                          padding: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <IonGrid className="ion-no-padding">
                          <IonRow>
                            <IonCol size="4">
                              <div style={{ textAlign: "center" }}>
                                <IonIcon
                                  icon={calendarOutline}
                                  color="medium"
                                />
                                <IonText color="dark">
                                  <p
                                    style={{
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      margin: "4px 0 0 0",
                                    }}
                                  >
                                    {formatFecha(p.fecha)}
                                  </p>
                                </IonText>
                              </div>
                            </IonCol>
                            <IonCol size="4">
                              <div
                                style={{
                                  textAlign: "center",
                                  borderLeft: "1px solid #e0e0e0",
                                  borderRight: "1px solid #e0e0e0",
                                }}
                              >
                                <IonIcon icon={timeOutline} color="medium" />
                                <IonText color="dark">
                                  <p
                                    style={{
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      margin: "4px 0 0 0",
                                    }}
                                  >
                                    {/* AQUI ESTABA EL ERROR: Usar la función formateadora */}
                                    {formatHora(p.hora)}
                                  </p>
                                </IonText>
                              </div>
                            </IonCol>
                            <IonCol size="4">
                              <div style={{ textAlign: "center" }}>
                                <IonIcon
                                  icon={hourglassOutline}
                                  color="medium"
                                />
                                <IonText color="dark">
                                  <p
                                    style={{
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      margin: "4px 0 0 0",
                                    }}
                                  >
                                    {p.duracion} min
                                  </p>
                                </IonText>
                              </div>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "start",
                          marginBottom: "10px",
                        }}
                      >
                        <IonIcon
                          icon={locationOutline}
                          style={{
                            marginRight: "8px",
                            marginTop: "2px",
                            color: "var(--ion-color-medium)",
                          }}
                        />
                        <IonText style={{ fontSize: "0.9rem", color: "#444" }}>
                          {p.lugarEncuentro}
                        </IonText>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingTop: "10px",
                          borderTop: "1px dashed #e0e0e0",
                        }}
                      >
                        <IonIcon
                          icon={personOutline}
                          style={{
                            marginRight: "8px",
                            color: "var(--ion-color-prussian-blue)",
                          }}
                        />
                        <IonText style={{ fontSize: "0.9rem" }}>
                          {p.paseador ? (
                            <>
                              Paseador:{" "}
                              <span style={{ fontWeight: 700 }}>
                                {p.paseador.nombre} {p.paseador.apellido}
                              </span>
                            </>
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              Esperando asignación...
                            </span>
                          )}
                        </IonText>
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}

                {loadingMore && (
                  <div className="ion-text-center ion-padding">
                    <IonSpinner name="dots" />
                  </div>
                )}

                {data.total > data.items.length && (
                  <div className="ion-text-center ion-margin-top">
                    <IonButton
                      fill="clear"
                      onClick={cargarMas}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Cargando..." : "Ver más antiguos"}
                    </IonButton>
                  </div>
                )}
              </>
            ) : (
              <div
                className="ion-text-center ion-padding"
                style={{ marginTop: "30px", opacity: 0.6 }}
              >
                <div
                  style={{
                    background: "#f4f5f8",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 15px auto",
                  }}
                >
                  <IonIcon icon={walkOutline} style={{ fontSize: "40px" }} />
                </div>
                <IonText>
                  <p>No tienes paseos pendientes ni en curso.</p>
                  <p style={{ fontSize: "0.9rem" }}>
                    ¡Solicita uno nuevo arriba!
                  </p>
                </IonText>
                <IonButton fill="clear" onClick={() => cargarDatos(true)}>
                  <IonIcon slot="start" icon={refreshOutline} />
                  Actualizar
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab1;