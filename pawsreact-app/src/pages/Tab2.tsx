import {
  IonAccordion,
  IonAccordionGroup,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonLabel,
  IonChip,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useIonRouter } from "@ionic/react";
import {
  trophyOutline,
  calendarOutline,
  timeOutline,
  hourglassOutline,
  locationOutline,
  personOutline,
  paw,
  refreshOutline,
} from "ionicons/icons";
import { Auth } from "../services/auth";
import {
  listPaseos,
  type Paginated,
  type PaseoListItem,
} from "../services/api";

const fmtFecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("es-CL", {
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

const Tab2: React.FC = () => {
  const router = useIonRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Paginated<PaseoListItem> | null>(null);

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

  const cargarDatos = async (event?: CustomEvent) => {
    if (!event) setLoading(true);
    setErr(null);
    try {
      const res = await listPaseos({
        mias: true,
        estado: "FINALIZADO",
        page: 1,
        pageSize: 100,
      });
      setData(res);
    } catch (e: any) {
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          "No se pudo cargar el historial"
      );
    } finally {
      setLoading(false);
      if (event) (event.target as HTMLIonRefresherElement).complete();
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const items = useMemo(() => data?.items ?? [], [data]);
  const completados = items.length;

  const renderSkeleton = () => (
    <>
      <IonSkeletonText
        animated
        style={{
          width: "100%",
          height: "120px",
          borderRadius: "20px",
          marginBottom: "20px",
        }}
      />
      <IonSkeletonText
        animated
        style={{ width: "50%", height: "20px", marginBottom: "10px" }}
      />
      {[1, 2, 3].map((i) => (
        <IonSkeletonText
          key={i}
          animated
          style={{
            width: "100%",
            height: "60px",
            borderRadius: "12px",
            marginBottom: "10px",
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
          <IonRefresherContent pullingIcon={paw} />
        </IonRefresher>

        <div className="ion-margin-bottom">
          <IonText color="prussian-blue">
            <h1 style={{ fontWeight: 800, margin: 0, fontSize: "2rem" }}>
              Tus Estadísticas
            </h1>
            <p style={{ marginTop: "5px", color: "#666" }}>
              Resumen de actividad con tus mascotas.
            </p>
          </IonText>
        </div>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            <IonGrid className="ion-no-padding ion-margin-bottom">
              <IonRow>
                <IonCol size="12">
                  <IonCard
                    style={{
                      margin: 0,
                      borderRadius: "20px",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                      background:
                        "linear-gradient(135deg, #fff9c4 0%, #fff 100%)",
                    }}
                  >
                    <IonCardContent
                      className="ion-text-center"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <IonText
                          color="medium"
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Paseos Completados
                        </IonText>
                        <IonText color="dark">
                          <h1
                            style={{
                              fontWeight: 800,
                              fontSize: "3rem",
                              margin: "5px 0 0 0",
                              color: "var(--ion-color-prussian-blue)",
                            }}
                          >
                            {completados}
                          </h1>
                        </IonText>
                      </div>
                      <div
                        style={{
                          background: "var(--ion-color-selective-yellow)",
                          borderRadius: "50%",
                          width: "60px",
                          height: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 10px rgba(255, 193, 7, 0.3)",
                        }}
                      >
                        <IonIcon
                          icon={trophyOutline}
                          style={{
                            fontSize: "30px",
                            color: "var(--ion-color-prussian-blue)",
                          }}
                        />
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="ion-margin-top ion-padding-top">
              <IonText color="prussian-blue">
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1.3rem",
                    marginBottom: "15px",
                  }}
                >
                  Historial de Paseos
                </h2>
              </IonText>

              {err && (
                <IonText color="danger">
                  <p>{err}</p>
                </IonText>
              )}

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
                  <p>Aún no tienes paseos finalizados en tu historial.</p>
                </div>
              ) : (
                <IonAccordionGroup>
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
                              color="success"
                              style={{
                                height: "20px",
                                fontSize: "0.65rem",
                                margin: 0,
                                fontWeight: 700,
                              }}
                            >
                              COMPLETADO
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
                                marginBottom: "8px",
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
                                icon={personOutline}
                                style={{
                                  fontSize: "16px",
                                  marginRight: "6px",
                                  color: "#666",
                                }}
                              />
                              <IonText
                                style={{ fontSize: "0.85rem", color: "#444" }}
                              >
                                Paseador:{" "}
                                <b>
                                  {p.paseador
                                    ? `${p.paseador.nombre} ${p.paseador.apellido}`
                                    : "No asignado"}
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

export default Tab2;