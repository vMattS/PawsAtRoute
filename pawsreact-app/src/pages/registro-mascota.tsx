import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonText,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { SelectChangeEventDetail } from "@ionic/core";
import { useIonRouter } from "@ionic/react";
import {
  pawOutline,
  textOutline,
  hourglassOutline,
  listOutline,
  addCircleOutline,
} from "ionicons/icons";
import { Auth } from "../services/auth";
import { createMascota } from "../services/api";

type Raza = { value: string; label: string };
type Especie = "canino" | "felino";

const razasData: Record<Especie, Raza[]> = {
  canino: [
    { value: "mestizo_canino", label: "Mestizo" },
    { value: "pastor_aleman", label: "Pastor Alemán" },
    { value: "labrador_retriever", label: "Labrador Retriever" },
    { value: "bulldog_frances", label: "Bulldog Francés" },
    { value: "golden_retriever", label: "Golden Retriever" },
    { value: "poodle", label: "Poodle (Caniche)" },
    { value: "beagle", label: "Beagle" },
    { value: "chihuahua", label: "Chihuahua" },
    { value: "pug", label: "Pug" },
    { value: "siberian_husky", label: "Husky Siberiano" },
    { value: "rottweiler", label: "Rottweiler" },
    { value: "shih_tzu", label: "Shih Tzu" },
    { value: "otra_canino", label: "Otra raza" },
  ],
  felino: [
    { value: "mestizo_felino", label: "Mestizo" },
    { value: "siames", label: "Siamés" },
    { value: "persa", label: "Persa" },
    { value: "maine_coon", label: "Maine Coon" },
    { value: "ragdoll", label: "Ragdoll" },
    { value: "british_shorthair", label: "British Shorthair" },
    { value: "sphynx", label: "Sphynx (Esfinge)" },
    { value: "gato_comun_europeo", label: "Gato Común Europeo" },
    { value: "otra_felino", label: "Otra raza" },
  ],
};

const RegistroMascota = () => {
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

  const [nombre, setNombre] = useState("");
  const [selectedEspecie, setSelectedEspecie] = useState<Especie | "">("");
  const [selectedRaza, setSelectedRaza] = useState<string>("");
  const [edadSelect, setEdadSelect] = useState<string>("");

  const [razasDisponibles, setRazasDisponibles] = useState<Raza[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    header?: string;
    message?: string;
  }>({
    open: false,
  });

  const handleEspecieChange = (e: CustomEvent<SelectChangeEventDetail>) => {
    const especie = e.detail.value as Especie;
    setSelectedEspecie(especie || "");
    if (especie) setRazasDisponibles(razasData[especie]);
    else setRazasDisponibles([]);
    setSelectedRaza("");
  };

  const edadToNumber = (v: string): number => {
    switch (v) {
      case "menor-1":
        return 0;
      case "1-a-2":
        return 2;
      case "3-a-5":
        return 4;
      case "6-a-9":
        return 7;
      case "10-a-mas":
        return 10;
      default:
        return 0;
    }
  };

  const razaLabel = useMemo(
    () => razasDisponibles.find((r) => r.value === selectedRaza)?.label ?? "",
    [razasDisponibles, selectedRaza]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !selectedEspecie || !selectedRaza || !edadSelect) {
      setAlert({
        open: true,
        header: "Campos incompletos",
        message: "Completa todos los campos para continuar.",
      });
      return;
    }

    setLoading(true);
    try {
      await createMascota({
        nombre: nombre.trim(),
        especie: selectedEspecie,
        raza: razaLabel,
        edad: edadToNumber(edadSelect),
      });

      setAlert({
        open: true,
        header: "¡Éxito!",
        message: "Se registró la mascota exitosamente.",
      });

      setTimeout(() => router.push("/tabs/tab1", "root"), 600);
    } catch (err: any) {
      setAlert({
        open: true,
        header: "Error",
        message:
          err?.response?.data?.error ||
          err?.message ||
          "No se pudo registrar la mascota",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <IonText className="ion-text-center">
            <h1
              style={{
                color: "var(--ion-color-prussian-blue)",
                fontWeight: 800,
                marginTop: "10px",
              }}
            >
              Nueva Mascota
            </h1>
            <p style={{ color: "#666", marginTop: "-5px" }}>
              Agrega un nuevo integrante a la familia
            </p>
          </IonText>

          <IonCard
            style={{
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              marginTop: "20px",
            }}
          >
            <IonCardHeader className="ion-text-center">
              <div
                style={{
                  background: "#f4f5f8",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px auto",
                }}
              >
                <IonIcon
                  icon={pawOutline}
                  style={{
                    fontSize: "30px",
                    color: "var(--ion-color-prussian-blue)",
                  }}
                />
              </div>
              <IonCardTitle
                color="prussian-blue"
                style={{ fontSize: "1.2rem", fontWeight: 700 }}
              >
                Datos de la Mascota
              </IonCardTitle>
              <IonCardSubtitle>Completa la información básica</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={onSubmit} noValidate>
                <IonGrid className="ion-no-padding">
                  {/* Nombre - Fila completa */}
                  <IonRow>
                    <IonCol size="12">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonIcon
                          slot="start"
                          icon={textOutline}
                          color="medium"
                        />
                        <IonInput
                          label="Nombre"
                          labelPlacement="floating"
                          placeholder="Ej. Firulais"
                          fill="outline"
                          required
                          value={nombre}
                          onIonChange={(e) => setNombre(e.detail.value ?? "")}
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  {/* Especie y Edad - Fila compartida */}
                  <IonRow>
                    <IonCol size="6">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonIcon
                          slot="start"
                          icon={pawOutline}
                          color="medium"
                        />
                        <IonSelect
                          label="Especie"
                          labelPlacement="floating"
                          fill="outline"
                          placeholder="Seleccionar"
                          required
                          value={selectedEspecie}
                          onIonChange={handleEspecieChange}
                        >
                          <IonSelectOption value="canino">
                            Canino
                          </IonSelectOption>
                          <IonSelectOption value="felino">
                            Felino
                          </IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCol>
                    <IonCol size="6">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonIcon
                          slot="start"
                          icon={hourglassOutline}
                          color="medium"
                        />
                        <IonSelect
                          label="Edad"
                          labelPlacement="floating"
                          fill="outline"
                          placeholder="Seleccionar"
                          required
                          value={edadSelect}
                          onIonChange={(e) => setEdadSelect(e.detail.value)}
                        >
                          <IonSelectOption value="menor-1">
                            Menor de 1 año
                          </IonSelectOption>
                          <IonSelectOption value="1-a-2">
                            1 a 2 años
                          </IonSelectOption>
                          <IonSelectOption value="3-a-5">
                            3 a 5 años
                          </IonSelectOption>
                          <IonSelectOption value="6-a-9">
                            6 a 9 años
                          </IonSelectOption>
                          <IonSelectOption value="10-a-mas">
                            10 años o más
                          </IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  {/* Raza - Fila completa */}
                  <IonRow>
                    <IonCol size="12">
                      <IonItem lines="none" className="ion-margin-bottom">
                        <IonIcon
                          slot="start"
                          icon={listOutline}
                          color="medium"
                        />
                        <IonSelect
                          label="Raza"
                          labelPlacement="floating"
                          fill="outline"
                          placeholder={
                            selectedEspecie
                              ? "Seleccione una raza"
                              : "Primero seleccione especie"
                          }
                          required
                          disabled={!selectedEspecie}
                          value={selectedRaza}
                          onIonChange={(e) => setSelectedRaza(e.detail.value)}
                        >
                          {razasDisponibles.map((raza) => (
                            <IonSelectOption
                              key={raza.value}
                              value={raza.value}
                            >
                              {raza.label}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonButton
                    color="prussian-blue"
                    expand="block"
                    shape="round"
                    className="ion-margin-top"
                    type="submit"
                    disabled={loading}
                    style={{ height: "50px", fontWeight: 600 }}
                  >
                    {loading ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Registrar Mascota
                      </>
                    )}
                  </IonButton>
                </IonGrid>
              </form>
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

export default RegistroMascota;