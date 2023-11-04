import React, { useState } from "react";
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Image } from "react-native";
import "react-native-gesture-handler";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

function Login() {
  const [emailFocused, setEmailFocused] = useState('');
  const [passwordFocused, setPasswordFocused] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace('HomeLogin');
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, emailFocused, passwordFocused)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      <Image source={require('../images/car.png')} style={styles.logoImage} />
      <Text style={styles.logo}>Hans Motors</Text>
      <Text style={styles.heading}>Iniciar Sesión</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => setEmailFocused(true)}
          activeOpacity={1}
        >
          <Text style={emailFocused ? styles.labelFocused : styles.label}>
            Correo electrónico
          </Text>
          <TextInput
            placeholder=""
            style={styles.input}
            placeholderTextColor="#A0A0A0"
            // onFocus={() => setEmailFocused(true)}
            // onBlur={() => setEmailFocused(false)}
            onChangeText={(text) => setEmailFocused(text)}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => setPasswordFocused(true)}
          activeOpacity={1}
        >
          <Text style={passwordFocused ? styles.labelFocused : styles.label}>
            Contraseña
          </Text>
          <TextInput
            placeholder=""
            style={styles.input}
            secureTextEntry
            placeholderTextColor="#A0A0A0"
            onChangeText={(text) => setPasswordFocused(text)}
            // onFocus={() => setPasswordFocused(true)}
            // onBlur={() => setPasswordFocused(false)}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 446,
    height: 60,
  },
  logo: {
    fontSize: 50,  
    fontWeight: "bold",
    marginBottom: 20,
    color: "#525FE1",
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    marginRight: '40%',
    color: "#333",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  label: {
    position: "absolute",
    left: 15,
    top: 15,
    color: "#A0A0A0",
  },
  labelFocused: {
    position: "absolute",
    left: 15,
    top: 0,
    color: "#525FE1",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#525FE1",
    paddingVertical: 10,
    paddingLeft: 15,
    marginBottom: 20,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#525FE1",
    borderRadius: 30,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Login;