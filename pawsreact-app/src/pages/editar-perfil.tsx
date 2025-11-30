import { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonAvatar,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
  IonButton,
  IonAlert,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import {
  personOutline,
  callOutline,
  mapOutline,
  cameraOutline,
  saveOutline,
  arrowBackOutline,
} from "ionicons/icons";

const EditarPerfil: React.FC = () => {
  const router = useIonRouter();
  const [showAlert, setShowAlert] = useState(false);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="selective-yellow">
          <IonButtons slot="start">
            <IonButton onClick={() => router.goBack()} color="prussian-blue">
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
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

      <IonContent className="ion-padding" fullscreen>
        <div
          style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "20px" }}
        >
          {/* AVATAR FUERA DE LA TARJETA (Sibling Layout) */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              position: "relative",
              zIndex: 10 /* Asegura que esté por encima de la tarjeta */,
              marginBottom:
                "-60px" /* Truco: Margen negativo para que la tarjeta suba */,
            }}
          >
            <div style={{ position: "relative" }}>
              <IonAvatar
                style={{
                  width: "120px",
                  height: "120px",
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  background: "#f4f5f8",
                  overflow: "hidden",
                }}
              >
                <img
                  alt="Avatar"
                  src="https://ionicframework.com/docs/img/demos/avatar.svg"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </IonAvatar>

              {/* Botón de cámara */}
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  zIndex: 20,
                }}
              >
                <label htmlFor="avatar-upload">
                  <div
                    style={{
                      background: "var(--ion-color-prussian-blue)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      cursor: "pointer",
                      border: "2px solid white",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    }}
                  >
                    <IonIcon icon={cameraOutline} size="small" />
                  </div>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>

          <IonCard
            style={{
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              paddingTop:
                "60px" /* Relleno superior para compensar el avatar superpuesto */,
              marginTop: "0",
              overflow: "visible",
            }}
          >
            <IonCardHeader
              className="ion-text-center"
              style={{ paddingBottom: "0" }}
            >
              <IonCardTitle color="prussian-blue" style={{ fontWeight: 800 }}>
                Editar Perfil
              </IonCardTitle>
              <IonCardSubtitle>
                Actualiza tu información personal
              </IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowAlert(true);
                }}
              >
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
                          label="Nombre"
                          labelPlacement="floating"
                          fill="outline"
                          placeholder="Ej. Benjamín"
                          minlength={2}
                          maxlength={20}
                          type="text"
                        />
                      </IonItem>
                    </IonCol>
                    <IonCol size="6">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonInput
                          label="Apellido"
                          labelPlacement="floating"
                          fill="outline"
                          placeholder="Ej. Pérez"
                          minlength={2}
                          maxlength={20}
                          type="text"
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon slot="start" icon={callOutline} color="medium" />
                    <IonInput
                      label="Teléfono"
                      labelPlacement="floating"
                      fill="outline"
                      placeholder="Ej. 987654321"
                      type="tel"
                      minlength={9}
                      maxlength={9}
                    />
                  </IonItem>

                  <IonItem lines="none" className="ion-margin-bottom">
                    <IonIcon slot="start" icon={mapOutline} color="medium" />
                    <IonSelect
                      label="Comuna"
                      labelPlacement="floating"
                      fill="outline"
                      placeholder="Selecciona comuna"
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

                  <IonButton
                    expand="block"
                    shape="round"
                    color="prussian-blue"
                    type="submit"
                    className="ion-margin-top"
                    style={{ height: "50px", fontWeight: 600 }}
                  >
                    <IonIcon slot="start" icon={saveOutline} />
                    Guardar Cambios
                  </IonButton>
                </IonGrid>
              </form>
            </IonCardContent>
          </IonCard>
        </div>

        <IonAlert
          isOpen={showAlert}
          header="Perfil actualizado"
          subHeader="Se actualizó el perfil exitosamente."
          buttons={["Aceptar"]}
          onDidDismiss={() => {
            setShowAlert(false);
            router.push("/tabs/tab3");
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default EditarPerfil;