import { useState, useCallback } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonItem,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonLabel,
  IonSpinner,
} from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import { login as apiLogin } from "../services/api";
import { Auth } from "../services/auth";

const validateEmail = (correo: string) => {
  const erroresCorreo = [];
  if (!correo) {
    return "El correo es obligatorio.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    erroresCorreo.push("Por favor, ingresa un correo válido.");
  } else {
    const atIndex = correo.indexOf("@");
    const localPart = correo.substring(0, atIndex);
    const domainPart = correo.substring(atIndex + 1);

    if (localPart.length > 64) {
      erroresCorreo.push(
        "La parte local (antes del @) no debe exceder los 64 caracteres."
      );
    }
    if (domainPart.length > 255) {
      erroresCorreo.push(
        "El dominio (después del @) no debe exceder los 255 caracteres."
      );
    }
  }
  return erroresCorreo.length > 0 ? erroresCorreo.join(" ") : undefined;
};

const validatePassword = (password: string) => {
  const erroresPassword = [];
  if (!password) {
    return "La contraseña es obligatoria.";
  }

  if (password.length < 8 || password.length > 20) {
    erroresPassword.push("Debe tener entre 8 y 20 caracteres.");
  }
  if (!/[a-z]/.test(password)) {
    erroresPassword.push("Debe incluir al menos una minúscula.");
  }
  if (!/[A-Z]/.test(password)) {
    erroresPassword.push("Debe incluir al menos una mayúscula.");
  }
  if (!/\d/.test(password)) {
    erroresPassword.push("Debe incluir al menos un número.");
  }
  if (!/[@$!%*?&._-]/.test(password)) {
    erroresPassword.push("Debe incluir un carácter especial (@$!%*?&._-).");
  }
  if (/[^A-Za-z\d@$!%*?&._-]/.test(password)) {
    erroresPassword.push("No debe contener caracteres inválidos o espacios.");
  }

  return erroresPassword.length > 0 ? erroresPassword.join(" ") : undefined;
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

const Login: React.FC = () => {
  const router = useIonRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [errors, setErrors] = useState<{ correo?: string; password?: string }>(
    {}
  );
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCorreoChange = useCallback(
    (e: any) => setCorreo(e.detail.value ?? ""),
    []
  );
  const handlePasswordChange = useCallback(
    (e: any) => setPassword(e.detail.value ?? ""),
    []
  );
  const handleRememberChange = useCallback(
    (e: any) => setRemember(e.detail.checked),
    []
  );
  
  const validarFormulario = useCallback(() => {
    const correoError = validateEmail(correo);
    const passwordError = validatePassword(password);

    const nuevosErrores: { correo?: string; password?: string } = {};
    if (correoError) nuevosErrores.correo = correoError;
    if (passwordError) nuevosErrores.password = passwordError;

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [correo, password]);

  const handleSubmit = useCallback(
  async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const data = await apiLogin(correo, password /* sin remember */);

      // Persistir SIEMPRE en localStorage
      Auth.login(data.token, data.user);
      if (data.user.rol) Auth.setRole(data.user.rol);

      let path = "/";
      switch (data.user.rol) {
        case "PASEADOR":
          path = "/panel-paseador/inicio";
          break;
        case "DUEÑO":
          path = "/tabs/tab1";
          break;
      }
      router.push(path, "root");
    } catch (err: any) {
      setLoginError(
        err?.response?.data?.error || err?.message || "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  },
  [correo, password, router, validarFormulario]
);

  const goToRecuperar = useCallback(() => {
    router.push("/recuperar-clave", "forward");
  }, [router]);

  const goToRegistro = useCallback(() => {
    router.push("/registro", "forward");
  }, [router]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="selective-yellow">
          <IonTitle className="coffeecake" color="prussian-blue">
            Paws At Route
          </IonTitle>
        </IonToolbar>
        <HeaderWave />
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <IonCard>
          <IonCardHeader className="ion-text-center">
            <IonCardTitle color="prussian-blue">Iniciar sesión</IonCardTitle>
            <IonCardSubtitle>¡Bienvenido de vuelta!</IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent>
            <form onSubmit={handleSubmit} noValidate>
              <IonItem>
                <IonInput
                  label="Correo"
                  placeholder="ejemplo@gmail.com"
                  labelPlacement="stacked"
                  type="email"
                  autocomplete="email"
                  inputmode="email"
                  value={correo}
                  onIonChange={handleCorreoChange}
                />
              </IonItem>
              {errors.correo && (
                <IonText color="danger">
                  <p className="ion-padding-start">{errors.correo}</p>
                </IonText>
              )}

              <IonItem className="ion-margin-top">
                <IonInput
                  label="Contraseña"
                  placeholder="********"
                  labelPlacement="stacked"
                  type="password"
                  autocomplete="current-password"
                  value={password}
                  onIonChange={handlePasswordChange}
                  minlength={10}
                  maxlength={20}
                >
                  <IonInputPasswordToggle slot="end" color="prussian-blue" />
                </IonInput>
              </IonItem>
              {errors.password && (
                <IonText color="danger">
                  <p className="ion-padding-start">{errors.password}</p>
                </IonText>
              )}

              {loginError && (
                <IonText color="danger">
                  <p className="ion-text-center ion-margin-top">{loginError}</p>
                </IonText>
              )}

              <IonButton
                expand="block"
                className="ion-margin-top"
                color="prussian-blue"
                shape="round"
                type="submit"
                disabled={loading}
              >
                {loading ? <IonSpinner name="dots" /> : "Iniciar sesión"}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <IonText className="ion-margin-top ion-text-center">
          <p>
            ¿Olvidaste tu contraseña?{" "}
            <IonButton
              fill="clear"
              className="clickable-link"
              onClick={goToRecuperar}
            >
              Restablecer
            </IonButton>
          </p>
        </IonText>

        <IonText className="ion-margin-top ion-text-center">
          <p>
            ¿No tienes cuenta?{" "}
            <IonButton
              fill="clear"
              className="clickable-link"
              onClick={goToRegistro}
            >
              Regístrate
            </IonButton>
          </p>
        </IonText>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonTitle className="ion-text-center">Paws At Route</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Login;