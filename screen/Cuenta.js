import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

function Perfil() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identifyUser = auth.currentUser;
    if (identifyUser) {
      const userRef = doc(db, "users", identifyUser.uid);
      onSnapshot(userRef, (snapshot) => {
        setUser(snapshot.data());
        setLoading(false);
      });
    }
  }, []);

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
        Alert.alert("Cuenta cerrada");
      })
      .catch((error) => alert(error.message));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077B6" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Hans Motors</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Editar Usuario")}
          >
            <MaterialIcons name="settings" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
            <MaterialIcons name="exit-to-app" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {!user ? (
        <Text>No hay datos</Text>
      ) : (
        <View style={styles.profile}>
          <Text style={styles.subtitle}>Credencial de Usuario</Text>
          <Image
            source={require("../images/AutoSinFondo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.meca}>{user.rol}</Text>

          {renderProfileInfo("id-card-o", user.rut)}
          {renderProfileInfo("user", `${user.nombre} ${user.apellido}`)}
          {renderProfileInfo("map-marker", user.direccion)}
          {renderProfileInfo("envelope-o", user.email)}
        </View>
      )}
    </View>
  );
}

const renderProfileInfo = (iconName, text) => (
  <View style={styles.section}>
    <View style={styles.iconTextContainer}>
      <FontAwesome name={iconName} size={20} color="#0077B6" />
    </View>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    margin: 30,
    padding: 10,
    elevation: 3,
    maxHeight: "90%",
    width: '90%',
    alignSelf: 'center',
  },
  header: {
    backgroundColor: "#0077B6",
    height: 90,
    marginBottom: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    textAlign: "center",
  },
  meca: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0077B6",
    textAlign: "center",
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 70,
    marginBottom: 15,
  },
  text: {
    marginLeft: 5,
    fontSize: 16,
    color: "#0077B6",
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 180,
    height: 180,
    marginBottom: 7,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333333",
  },
});

export default Perfil;
