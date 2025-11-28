import { useEffect, useState } from "react";
import { useIonRouter } from "@ionic/react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonText,
  IonButton,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonChip,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import {
  personCircleOutline,
  mailOutline,
  callOutline,
  locationOutline,
  logOutOutline,
  createOutline,
  ribbonOutline,
} from "ionicons/icons";
import { logout as apiLogout } from "../services/api";
import { Auth, type Usuario } from "../services/auth";

const Tab3: React.FC = () => {
  const router = useIonRouter();

  const [user, setUser] = useState<Usuario | null>(null);
  const [role, setRole] = useState<string>("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const u = Auth.getUser();
    if (!u) {
      router.push("/login", "root");
      return;
    }
    setUser(u);
    setRole(Auth.getRole());
  }, [router]);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await apiLogout();
    } catch (e) {
      console.warn("logout api error:", e);
    } finally {
      Auth.logout();
      router.push("/login", "root");
      setSigningOut(false);
    }
  };

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

      <IonContent fullscreen className="ion-padding">
        <div
          className="ion-text-center ion-margin-bottom"
          style={{ marginTop: "20px" }}
        >
          <IonAvatar
            style={{
              width: "100px",
              height: "100px",
              margin: "0 auto 15px auto",
              border: "4px solid white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IonIcon
                icon={personCircleOutline}
                style={{ fontSize: "100px", color: "#9e9e9e" }}
              />
            </div>
          </IonAvatar>

          <IonText color="prussian-blue">
            <h1
              style={{
                fontWeight: 800,
                margin: "0 0 5px 0",
                fontSize: "1.8rem",
              }}
            >
              {user?.nombre} {user?.apellido}
            </h1>
          </IonText>

          <IonChip
            outline
            color="primary"
            style={{
              marginTop: "5px",
              borderColor: "var(--ion-color-selective-yellow)",
              color: "var(--ion-color-prussian-blue)",
            }}
          >
            <IonIcon icon={ribbonOutline} color="warning" />
            <IonLabel style={{ fontWeight: 700 }}>
              {role || user?.rol || "USUARIO"}
            </IonLabel>
          </IonChip>
        </div>

        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard
                style={{
                  borderRadius: "20px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  margin: 0,
                }}
              >
                <IonCardContent className="ion-no-padding">
                  <IonList lines="full">
                    <IonItem
                      style={{
                        "--padding-start": "20px",
                        "--inner-padding-end": "20px",
                      }}
                    >
                      <IonIcon icon={mailOutline} slot="start" color="medium" />
                      <IonLabel>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#999",
                            marginBottom: "2px",
                          }}
                        >
                          Correo Electrónico
                        </p>
                        <IonText color="dark" style={{ fontSize: "1rem" }}>
                          {user?.correo || "No disponible"}
                        </IonText>
                      </IonLabel>
                    </IonItem>

                    <IonItem
                      style={{
                        "--padding-start": "20px",
                        "--inner-padding-end": "20px",
                      }}
                    >
                      <IonIcon icon={callOutline} slot="start" color="medium" />
                      <IonLabel>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#999",
                            marginBottom: "2px",
                          }}
                        >
                          Teléfono
                        </p>
                        <IonText color="dark" style={{ fontSize: "1rem" }}>
                          {user?.telefono || "No registrado"}
                        </IonText>
                      </IonLabel>
                    </IonItem>

                    <IonItem
                      lines="none"
                      style={{
                        "--padding-start": "20px",
                        "--inner-padding-end": "20px",
                      }}
                    >
                      <IonIcon
                        icon={locationOutline}
                        slot="start"
                        color="medium"
                      />
                      <IonLabel>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#999",
                            marginBottom: "2px",
                          }}
                        >
                          Comuna
                        </p>
                        <IonText color="dark" style={{ fontSize: "1rem" }}>
                          {user?.comuna || "No registrada"}
                        </IonText>
                      </IonLabel>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              <div className="ion-padding-top ion-margin-top">
                <IonButton
                  expand="block"
                  shape="round"
                  color="prussian-blue"
                  className="ion-margin-bottom"
                  onClick={() => router.push("/editar-perfil")}
                  style={{ height: "50px", fontSize: "1rem", fontWeight: 600 }}
                >
                  <IonIcon slot="start" icon={createOutline} />
                  Editar Perfil
                </IonButton>

                <IonButton
                  expand="block"
                  fill="outline"
                  shape="round"
                  color="danger"
                  onClick={handleLogout}
                  disabled={signingOut}
                  style={{
                    height: "50px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderWidth: "2px",
                  }}
                >
                  {signingOut ? (
                    <IonSpinner name="crescent" />
                  ) : (
                    <>
                      <IonIcon slot="start" icon={logOutOutline} />
                      Cerrar Sesión
                    </>
                  )}
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;