import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonCard,
  IonCardContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonChip,
  IonSkeletonText,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useIonRouter } from "@ionic/react";
import {
  cashOutline,
  trophyOutline,
  calendarOutline,
  timeOutline,
  locationOutline,
  hourglassOutline,
  walletOutline,
  paw,
  refreshOutline,
} from "ionicons/icons";
import { Auth } from "../services/auth";
import {
  listMisPaseosComoPaseador,
  type PaseoListItem,
  type Paginated,
} from "../services/api";

const fmtFecha = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};
const fmtHora = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const tarifaPorMinuto = (min: number) => {
  switch (min) {
    case 30:
      return 10000;
    case 60:
      return 15000;
    case 90:
      return 20000;
    case 120:
      return 25000;
    default:
      return 0;
  }
};

const badgeColor: Record<string, string> = {
  PENDIENTE: "warning",
  ACEPTADO: "tertiary",
  EN_CURSO: "medium",
  FINALIZADO: "success",
  CANCELADO: "danger",
};

const EstadisticasPaseador: React.FC = () => {
  const router = useIonRouter();

  const [data, setData] = useState<Paginated<PaseoListItem> | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async (event?: CustomEvent) => {
    if (!event) setLoading(true);
    try {
      const u = Auth.getUser();
      if (!u || u.rol !== "PASEADOR") return;

      const res = await listMisPaseosComoPaseador({
        estado: "FINALIZADO",
        page: 1,
        pageSize: 100,
      });
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      if (event) (event.target as HTMLIonRefresherElement).complete();
    }
  };

  useEffect(() => {
    const u = Auth.getUser();
    if (!u) {
      router.push("/login", "root");
      return;
    }
    if (u.rol !== "PASEADOR") {
      router.push("/tabs/tab1", "root");
      return;
    }
    cargarDatos();
  }, [router]);

  const items = data?.items ?? [];
  const completados = items.length;

  const saldo = useMemo(
    () => items.reduce((acc, p) => acc + tarifaPorMinuto(p.duracion), 0),
    [items]
  );

  const renderSkeleton = () => (
    <>
      <IonGrid>
        <IonRow>
          <IonCol size="6">
            <IonSkeletonText
              animated
              style={{ height: "120px", borderRadius: "16px" }}
            />
          </IonCol>
          <IonCol size="6">
            <IonSkeletonText
              animated
              style={{ height: "120px", borderRadius: "16px" }}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonSkeletonText
        animated
        style={{
          height: "40px",
          width: "60%",
          marginTop: "20px",
          marginBottom: "10px",
        }}
      />
      {[1, 2, 3].map((i) => (
        <IonSkeletonText
          key={i}
          animated
          style={{
            height: "60px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        />
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
        <IonRefresher slot="fixed" onIonRefresh={cargarDatos}>
          <IonRefresherContent pullingIcon={paw} refreshingSpinner="circles" />
        </IonRefresher>

        <div className="ion-margin-bottom">
          <IonText color="prussian-blue">
            <h1 style={{ fontWeight: 800, margin: 0, fontSize: "2rem" }}>
              Tu Rendimiento
            </h1>
            <p style={{ marginTop: "5px", color: "#666" }}>
              Resumen de tu actividad reciente.
            </p>
          </IonText>
        </div>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            <IonGrid className="ion-no-padding ion-margin-bottom">
              <IonRow>
                <IonCol size="6">
                  <IonCard
                    style={{
                      margin: "0 8px 0 0",
                      height: "100%",
                      borderRadius: "20px",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <IonCardContent
                      className="ion-text-center"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          background: "#e0f7fa",
                          borderRadius: "50%",
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 10px auto",
                        }}
                      >
                        <IonIcon
                          icon={walletOutline}
                          style={{ fontSize: "24px", color: "#0097a7" }}
                        />
                      </div>
                      <IonText
                        color="medium"
                        style={{ fontSize: "0.9rem", fontWeight: 600 }}
                      >
                        Ganancias
                      </IonText>
                      <IonText
                        color="dark"
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 800,
                          marginTop: "5px",
                        }}
                      >
                        ${saldo.toLocaleString("es-CL")}
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="6">
                  <IonCard
                    style={{
                      margin: "0 0 0 8px",
                      height: "100%",
                      borderRadius: "20px",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <IonCardContent
                      className="ion-text-center"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          background: "#fff9c4",
                          borderRadius: "50%",
                          width: "50px",
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 10px auto",
                        }}
                      >
                        <IonIcon
                          icon={trophyOutline}
                          style={{ fontSize: "24px", color: "#fbc02d" }}
                        />
                      </div>
                      <IonText
                        color="medium"
                        style={{ fontSize: "0.9rem", fontWeight: 600 }}
                      >
                        Paseos
                      </IonText>
                      <IonText
                        color="dark"
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 800,
                          marginTop: "5px",
                        }}
                      >
                        {completados}
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="ion-margin-top ion-padding-top">
              <IonText color="prussian-blue">
                <h2 style={{ fontWeight: 700, fontSize: "1.3rem" }}>
                  Historial de Paseos
                </h2>
              </IonText>

              {completados === 0 ? (
                <div
                  className="ion-text-center ion-padding"
                  style={{ marginTop: "30px", opacity: 0.7 }}
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
                    <IonIcon
                      icon={calendarOutline}
                      style={{ fontSize: "40px", color: "#999" }}
                    />
                  </div>
                  <p>Aún no has completado ningún paseo.</p>
                  <IonText color="primary" style={{ fontWeight: 600 }}>
                    ¡Comienza a aceptar solicitudes!
                  </IonText>
                </div>
              ) : (
                <IonAccordionGroup style={{ marginTop: "10px" }}>
                  {items.map((p) => (
                    <IonAccordion
                      key={p.idPaseo}
                      value={`p-${p.idPaseo}`}
                      style={{
                        background: "white",
                        marginBottom: "10px",
                        borderRadius: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <IonItem
                        slot="header"
                        lines="none"
                        style={{ "--background": "transparent" }}
                      >
                        <div style={{ width: "100%" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "4px",
                            }}
                          >
                            <IonText
                              style={{
                                fontWeight: 700,
                                fontSize: "1rem",
                                color: "var(--ion-color-prussian-blue)",
                              }}
                            >
                              {p.mascota?.nombre ?? "Mascota"}
                            </IonText>
                            <IonChip
                              color={badgeColor[p.estado] || "medium"}
                              style={{
                                height: "20px",
                                fontSize: "0.65rem",
                                margin: 0,
                              }}
                            >
                              {p.estado === "FINALIZADO"
                                ? "COMPLETADO"
                                : p.estado}
                            </IonChip>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "0.85rem",
                              color: "#888",
                            }}
                          >
                            <IonIcon
                              icon={calendarOutline}
                              style={{ marginRight: "4px", fontSize: "0.9rem" }}
                            />
                            {fmtFecha(p.fecha)}
                          </div>
                        </div>
                      </IonItem>

                      <div
                        slot="content"
                        style={{ padding: "0 16px 16px 16px" }}
                      >
                        <div
                          style={{
                            borderTop: "1px solid #f0f0f0",
                            paddingTop: "12px",
                          }}
                        >
                          <IonGrid className="ion-no-padding">
                            <IonRow>
                              <IonCol size="6">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <IonIcon
                                    icon={timeOutline}
                                    style={{
                                      marginRight: "8px",
                                      color:
                                        "var(--ion-color-selective-yellow)",
                                    }}
                                  />
                                  <IonText style={{ fontSize: "0.9rem" }}>
                                    {fmtHora(p.hora)}
                                  </IonText>
                                </div>
                              </IonCol>
                              <IonCol size="6">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <IonIcon
                                    icon={hourglassOutline}
                                    style={{
                                      marginRight: "8px",
                                      color:
                                        "var(--ion-color-selective-yellow)",
                                    }}
                                  />
                                  <IonText style={{ fontSize: "0.9rem" }}>
                                    {p.duracion} min
                                  </IonText>
                                </div>
                              </IonCol>
                              <IonCol size="6">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <IonIcon
                                    icon={cashOutline}
                                    style={{
                                      marginRight: "8px",
                                      color: "var(--ion-color-success)",
                                    }}
                                  />
                                  <IonText
                                    style={{
                                      fontSize: "0.9rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    $
                                    {tarifaPorMinuto(p.duracion).toLocaleString(
                                      "es-CL"
                                    )}
                                  </IonText>
                                </div>
                              </IonCol>
                            </IonRow>
                          </IonGrid>

                          <div
                            style={{
                              marginTop: "12px",
                              background: "#f9f9f9",
                              padding: "10px",
                              borderRadius: "8px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "start",
                                marginBottom: "6px",
                              }}
                            >
                              <IonIcon
                                icon={locationOutline}
                                style={{
                                  minWidth: "16px",
                                  marginTop: "3px",
                                  marginRight: "6px",
                                  color: "#666",
                                }}
                              />
                              <IonText
                                style={{ fontSize: "0.85rem", color: "#444" }}
                              >
                                {p.lugarEncuentro}
                              </IonText>
                            </div>
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <IonIcon
                                icon={paw}
                                style={{
                                  fontSize: "16px",
                                  marginRight: "6px",
                                  color: "#666",
                                }}
                              />
                              <IonText
                                style={{ fontSize: "0.85rem", color: "#444" }}
                              >
                                Dueño:{" "}
                                <b>
                                  {p.duenio
                                    ? `${p.duenio.nombre} ${p.duenio.apellido}`
                                    : "—"}
                                </b>
                              </IonText>
                            </div>
                          </div>
                        </div>
                      </div>
                    </IonAccordion>
                  ))}
                </IonAccordionGroup>
              )}
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default EstadisticasPaseador;