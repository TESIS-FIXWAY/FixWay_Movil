import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Alert } from 'react-native';
import { auth, db } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  doc 
} from "firebase/firestore";

import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg'; // Importa QRCode

function Perfil() {
  const navigation = useNavigation();
  const [user, setUser] = React.useState([]);

  React.useEffect(() => {
    const identifyUser = auth.currentUser;
    if (identifyUser) {
      const userRef = doc(db, "users", identifyUser.uid);
      onSnapshot(userRef, (snapshot) => {
        setUser(snapshot.data());
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

  return (
    <View style={styles.container}>
      <View style={styles.rectangulo}>
        <Text style={styles.logo}>Hans Motors</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <MaterialIcons name="exit-to-app" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {!user ? (
        <Text>No hay datos</Text>
      ) : (
        <View style={styles.profileContainer}>
          <Text style={styles.subtitle}>Credencial de Usuario</Text>
          <Text style={styles.meca}>mecanico</Text>

          <View style={styles.qrCodeContainer}>
            <QRCode
              value={`Rut: ${user.rut}\nNombre: ${user.nombre} ${user.apellido}\nDirección: ${user.direccion}\nEmail: ${user.email}`}size={150}/>
          </View>

          <View style={styles.section}>
            <FontAwesome name="id-card-o" size={20} color="#7377FF" />
            <Text style={styles.label}>Rut:</Text>
            <Text style={styles.text}>{user.rut}</Text>
          </View>
          <View style={styles.section}>
            <FontAwesome name="user" size={20} color="#7377FF" />
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.text}>{user.nombre} {user.apellido}</Text>
          </View>
          <View style={styles.section}>
            <FontAwesome name="map-marker" size={20} color="#7377FF" />
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.text}>{user.direccion}</Text>
          </View>
          <View style={styles.section}>
            <FontAwesome name="envelope-o" size={20} color="#7377FF" />
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.text}>{user.email}</Text>
          </View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  rectangulo: {
    backgroundColor: "#66BAFF",
    height: 130,
    width: "100%",
    flexDirection: 'row', // Añadido para alinear elementos en una fila
    justifyContent: 'space-between', // Añadido para espaciar elementos en una fila
    alignItems: 'center',  // Centrado verticalmente
    paddingHorizontal: 20, // Añadido para agregar espaciado a los lados
  },
  logo: {
    fontSize: 40,
    marginHorizontal: 'auto', // Añadido para centrar horizontalmente
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center', // Añadido para centrar el texto
  },
  buttonContainer: {
    flexDirection: 'row', // Añadido para alinear el botón a la derecha
  },
  logoutButton: {
    marginLeft: 'auto', // Añadido para mover el botón a la derecha
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
    color: "#000",
    textAlign: "center",
  },
  meca: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#000",
    textAlign: "center",
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#7377FF",
  },
  text: {
    marginLeft: 5,
    fontSize: 16,
    color: "#7377FF",
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default Perfil;
