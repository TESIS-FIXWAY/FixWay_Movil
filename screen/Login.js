// Importaciones de módulos y librerías
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";

// Definición del componente funcional Login
const Login = () => {
  // Estados del componente
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigation = useNavigation();

  // Efecto secundario para redireccionar cuando el usuario está autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace("Election");
      }
    });
    return unsubscribe;
  }, []);

  // Función para manejar el inicio de sesión
  const handleLogin = () => {
    setErrorMessage("");
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        let errorMessage = error.message;

        if (errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found") {
          errorMessage = "El correo o la contraseña es incorrecto";
        }

        setErrorMessage(errorMessage);
        console.log(errorCode, errorMessage);
      });
  };

  // JSX del componente
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centeredContainer}>
          <Text style={styles.title}>Hans Motors</Text>
          <Image
            source={require("../images/car.png")}
            style={styles.logoImage}
          />
          <Text style={styles.headerText}>Iniciar Sesión</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Icon
                name="envelope"
                size={20}
                color="#A0A0A0"
                style={styles.icon}
              />
              <TextInput
                placeholder=""
                style={[
                  styles.input,
                  {
                    borderBottomColor: emailFocused || email.length > 0 ? "#525FE1" : "#000",
                  },
                ]}
                placeholderTextColor="#A0A0A0"
                onChangeText={(text) => setEmail(text)}
                value={email}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.labelText,
                    {
                      top: emailFocused || email.length > 0 ? -10 : 8,
                      left: 40,
                      color: emailFocused || email.length > 0 ? "#525FE1" : "#A0A0A0",
                    },
                  ]}
                >
                  Correo electrónico
                </Text>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Icon
                name="lock"
                size={20}
                color="#A0A0A0"
                style={styles.icon}
              />
              <TextInput
                placeholder=""
                style={[
                  styles.input,
                  {
                    borderBottomColor: passwordFocused || password.length > 0 ? "#525FE1" : "#000",
                  },
                ]}
                secureTextEntry
                placeholderTextColor="#A0A0A0"
                onChangeText={(text) => setPassword(text)}
                value={password}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.labelText,
                    {
                      top: passwordFocused || password.length > 0 ? -10 : 8,
                      left: 40,
                      color: passwordFocused || password.length > 0 ? "#525FE1" : "#A0A0A0",
                    },
                  ]}
                >
                  Contraseña
                </Text>
              </View>
            </View>
          </View>

          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Estilos del componente utilizando StyleSheet
const styles = StyleSheet.create({
  // Contenedor principal del componente
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  // Contenedor de desplazamiento
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  // Contenedor centrado
  centeredContainer: {
    alignItems: "center",
  },

  // Título principal
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#525FE1",
  },

  // Imagen del logotipo
  logoImage: {
    width: 300,
    height: 47,
    marginBottom: 40,
  },

  // Texto de encabezado
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },

  // Contenedor de entrada de usuario
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },

  // Contenedor de cada entrada de usuario
  inputWrapper: {
    position: "relative",
    marginBottom: 30,
  },

  // Icono para las entradas de usuario
  icon: {
    position: "absolute",
    left: 8,
    top: 12,
    zIndex: 1,
  },

  // Contenedor de etiqueta sobre la entrada de usuario
  labelContainer: {
    position: "absolute",
    top: 0,
    left: 4,
    zIndex: 1,
  },

  // Texto de etiqueta sobre la entrada de usuario
  labelText: {
    fontSize: 14,
  },

  // Entrada de usuario
  input: {
    marginBottom:30,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 8,
    paddingLeft: 40,
    color: "#333",
  },

  // Texto de error
  errorText: {
    color: "red",
    marginBottom: 10,
  },

  // Botón de inicio de sesión
  loginButton: {
    backgroundColor: "#525FE1",
    borderRadius: 20,
    paddingVertical: 12,
    width: "80%",
    alignItems: "center",
    marginTop: 20,
  },

  // Texto dentro del botón de inicio de sesión
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});



// Exportar el componente Login para su uso en otras partes de la aplicación
export default Login;
