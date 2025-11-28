import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonItem,
  IonAlert,
  IonSpinner,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonSkeletonText,
  IonAvatar,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useIonRouter } from "@ionic/react";
import {
  calendarOutline,
  timeOutline,
  locationOutline,
  hourglassOutline,
  walkOutline,
  paw,
  refreshOutline,
} from "ionicons/icons";
import { Auth } from "../services/auth";
import {
  listMisPaseosComoPaseador,
  listPaseosDisponibles,
  aceptarPaseo,
  startPaseo,
  finishPaseo,
  type PaseoListItem,
  type Paginated,
} from "../services/api";
import { estadoLabel, estadoColor, type Estado } from "../utils/estadoPaseo";

const PanelPaseador: React.FC = () => {
  const router = useIonRouter();
  const [view, setView] = useState<"mis-paseos" | "disponibles">("mis-paseos");

  useEffect(() => {
    const u = Auth.getUser();
    if (!u) return router.push("/login", "root");
    if (u.rol !== "PASEADOR") return router.push("/tabs/tab1", "root");
  }, [router]);

  const user = Auth.getUser();
  const nombrePaseador = useMemo(() => (user?.nombre || "").toString(), [user]);

  const [misPaseos, setMisPaseos] = useState<Paginated<PaseoListItem> | null>(
    null
  );
  const [disponibles, setDisponibles] =
    useState<Paginated<PaseoListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    open: boolean;
    header?: string;
    message?: string;
  }>({ open: false });

  const cargar = async (event?: CustomEvent) => {
    if (!event) setLoading(true);
    try {
      const [a, b] = await Promise.all([
        listMisPaseosComoPaseador({ page: 1, pageSize: 50 }),
        listPaseosDisponibles({ page: 1, pageSize: 50 }),
      ]);

      const activos = {
        ...a,
        items: (a.items || []).filter((p) => p.estado !== "FINALIZADO"),
        total: (a.items || []).filter((p) => p.estado !== "FINALIZADO").length,
      };

      setMisPaseos(activos);
      setDisponibles(b);
    } catch (e: any) {
      setAlert({
        open: true,
        header: "Error",
        message:
          e?.response?.data?.error ||
          e?.message ||
          "No se pudieron cargar los paseos",
      });
    } finally {
      setLoading(false);
      if (event) (event.target as HTMLIonRefresherElement).complete();
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const tomarPaseo = async (idPaseo: number) => {
    try {
      setWorkingId(idPaseo);
      await aceptarPaseo(idPaseo);
      await cargar();
      setAlert({
        open: true,
        header: "¡Éxito!",
        message: "El paseo ha sido asignado a ti.",
      });
      setView("mis-paseos");
    } catch (e: any) {
      setAlert({
        open: true,
        header: "Error",
        message:
          e?.response?.data?.error || e?.message || "No se pudo tomar el paseo",
      });
    } finally {
      setWorkingId(null);
    }
  };

  const iniciar = async (idPaseo: number) => {
    try {
      setWorkingId(idPaseo);
      await startPaseo(idPaseo);
      await cargar();
    } catch (e: any) {
      setAlert({
        open: true,
        header: "Error",
        message:
          e?.response?.data?.error ||
          e?.message ||
          "No se pudo iniciar el paseo",
      });
    } finally {
      setWorkingId(null);
    }
  };

  const finalizar = async (idPaseo: number) => {
    try {
      setWorkingId(idPaseo);
      await finishPaseo(idPaseo);
      await cargar();
      setAlert({
        open: true,
        header: "Gran trabajo",
        message: "El paseo ha finalizado correctamente.",
      });
    } catch (e: any) {
      setAlert({
        open: true,
        header: "Error",
        message:
          e?.response?.data?.error ||
          e?.message ||
          "No se pudo finalizar el paseo",
      });
    } finally {
      setWorkingId(null);
    }
  };

  const fmtFecha = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
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

  const renderSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <IonCard key={i} className="ion-margin-bottom">
          <IonCardContent>
            <IonSkeletonText
              animated
              style={{ width: "60%", height: "20px", marginBottom: "10px" }}
            />
            <IonSkeletonText
              animated
              style={{ width: "40%", height: "15px", marginBottom: "20px" }}
            />
            <IonSkeletonText
              animated
              style={{ width: "100%", height: "40px" }}
            />
          </IonCardContent>
        </IonCard>
      ))}
    </>
  );

  const renderEmptyState = (msg: string) => (
    <div
      className="ion-text-center ion-padding"
      style={{ marginTop: "40px", opacity: 0.6 }}
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
          margin: "0 auto 20px auto",
        }}
      >
        <IonIcon icon={walkOutline} style={{ fontSize: "40px" }} />
      </div>
      <IonText>
        <h3>{msg}</h3>
      </IonText>
      <IonButton fill="clear" onClick={() => cargar()}>
        <IonIcon slot="start" icon={refreshOutline} />
        Recargar
      </IonButton>
    </div>
  );

  const renderCard = (p: PaseoListItem, type: "mio" | "disponible") => (
    <IonCard
      key={p.idPaseo}
      className="ion-margin-bottom"
      style={{ borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
    >
      <IonCardHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <IonCardSubtitle
              color="primary"
              style={{
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {p.duenio ? `${p.duenio.nombre} ${p.duenio.apellido}` : "Usuario"}
            </IonCardSubtitle>
            <IonCardTitle
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                marginTop: "4px",
                color: "var(--ion-color-prussian-blue)",
              }}
            >
              {p.mascota?.nombre ?? "Mascota"}
            </IonCardTitle>
          </div>
          <IonChip
            color={estadoColor[p.estado as Estado]}
            outline
            style={{
              margin: 0,
              height: "24px",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            {estadoLabel[p.estado as Estado]}
          </IonChip>
        </div>
      </IonCardHeader>

      <IonCardContent>
        <IonGrid className="ion-no-padding">
          <IonRow>
            <IonCol size="6">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                  color: "#555",
                }}
              >
                <IonIcon
                  icon={calendarOutline}
                  style={{
                    marginRight: "8px",
                    color: "var(--ion-color-selective-yellow)",
                  }}
                />
                <IonLabel style={{ fontSize: "0.9rem" }}>
                  {fmtFecha(p.fecha)}
                </IonLabel>
              </div>
            </IonCol>
            <IonCol size="6">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                  color: "#555",
                }}
              >
                <IonIcon
                  icon={timeOutline}
                  style={{
                    marginRight: "8px",
                    color: "var(--ion-color-selective-yellow)",
                  }}
                />
                <IonLabel style={{ fontSize: "0.9rem" }}>
                  {fmtHora(p.hora)}
                </IonLabel>
              </div>
            </IonCol>
            <IonCol size="6">
              <div
                style={{ display: "flex", alignItems: "center", color: "#555" }}
              >
                <IonIcon
                  icon={hourglassOutline}
                  style={{
                    marginRight: "8px",
                    color: "var(--ion-color-selective-yellow)",
                  }}
                />
                <IonLabel style={{ fontSize: "0.9rem" }}>
                  {p.duracion} min
                </IonLabel>
              </div>
            </IonCol>
          </IonRow>

          <div
            style={{
              display: "flex",
              alignItems: "start",
              marginTop: "12px",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <IonIcon
              icon={locationOutline}
              style={{
                minWidth: "20px",
                marginTop: "2px",
                marginRight: "8px",
                color: "var(--ion-color-medium)",
              }}
            />
            <IonText
              color="dark"
              style={{ fontSize: "0.9rem", lineHeight: "1.4" }}
            >
              {p.lugarEncuentro}
            </IonText>
          </div>
        </IonGrid>

        <div className="ion-margin-top">
          {type === "mio" ? (
            <>
              {(p.estado === "PENDIENTE" || p.estado === "ACEPTADO") && (
                <IonButton
                  color="success"
                  expand="block"
                  shape="round"
                  onClick={() => iniciar(p.idPaseo)}
                  disabled={workingId === p.idPaseo}
                  style={{ fontWeight: 600 }}
                >
                  {workingId === p.idPaseo ? (
                    <IonSpinner name="dots" />
                  ) : (
                    "Iniciar Paseo"
                  )}
                </IonButton>
              )}
              {p.estado === "EN_CURSO" && (
                <IonButton
                  color="warning"
                  expand="block"
                  shape="round"
                  onClick={() => finalizar(p.idPaseo)}
                  disabled={workingId === p.idPaseo}
                  style={{ fontWeight: 600 }}
                >
                  {workingId === p.idPaseo ? (
                    <IonSpinner name="dots" />
                  ) : (
                    "Finalizar Paseo"
                  )}
                </IonButton>
              )}
            </>
          ) : (
            <IonButton
              color="prussian-blue"
              expand="block"
              shape="round"
              onClick={() => tomarPaseo(p.idPaseo)}
              disabled={workingId === p.idPaseo}
              style={{ fontWeight: 600 }}
            >
              {workingId === p.idPaseo ? (
                <IonSpinner name="dots" />
              ) : (
                "Aceptar Trabajo"
              )}
            </IonButton>
          )}
        </div>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="selective-yellow">
          <IonTitle color="prussian-blue" className="coffeecake">
            Paws At Route
          </IonTitle>
        </IonToolbar>
        <div
          style={{
            background: "var(--ion-color-selective-yellow)",
            paddingBottom: "10px",
          }}
        >
          <IonSegment
            value={view}
            onIonChange={(e) => setView(e.detail.value as any)}
            style={{
              width: "90%",
              margin: "0 auto",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "10px",
              padding: "4px",
            }}
          >
            <IonSegmentButton value="mis-paseos">
              <IonLabel color="prussian-blue" style={{ fontWeight: 700 }}>
                Mis Paseos
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="disponibles">
              <IonLabel color="prussian-blue" style={{ fontWeight: 700 }}>
                Disponibles
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
        <div style={{ overflow: "hidden", marginTop: "-1px" }}>
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

      <IonContent fullscreen className="ion-padding-horizontal">
        <IonRefresher slot="fixed" onIonRefresh={(e) => cargar(e)}>
          <IonRefresherContent pullingIcon={paw} refreshingSpinner="circles" />
        </IonRefresher>

        <div className="ion-padding-top ion-padding-bottom">
          <IonItem lines="none">
            <IonAvatar
              slot="start"
              style={{
                background: "var(--ion-color-prussian-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IonIcon
                icon={paw}
                style={{ color: "white", fontSize: "20px" }}
              />
            </IonAvatar>
            <IonLabel>
              <p>Bienvenido de vuelta,</p>
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  color: "var(--ion-color-prussian-blue)",
                }}
              >
                {nombrePaseador}
              </h2>
            </IonLabel>
          </IonItem>
        </div>

        {view === "mis-paseos" && (
          <div className="animate__animated animate__fadeIn">
            {loading
              ? renderSkeleton()
              : misPaseos && misPaseos.items.length > 0
              ? misPaseos.items.map((p) => renderCard(p, "mio"))
              : renderEmptyState("No tienes paseos activos.")}
          </div>
        )}

        {view === "disponibles" && (
          <div className="animate__animated animate__fadeIn">
            {loading
              ? renderSkeleton()
              : disponibles && disponibles.items.length > 0
              ? disponibles.items.map((p) => renderCard(p, "disponible"))
              : renderEmptyState("No hay paseos nuevos disponibles.")}
          </div>
        )}

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

export default PanelPaseador;