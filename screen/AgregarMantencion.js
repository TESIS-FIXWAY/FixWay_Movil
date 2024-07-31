import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { Picker } from "@react-native-picker/picker";
import Modal from "react-native-modal";
import { AgregarMantencionStyles } from "../styles/AgregarMantencionEstilo";
import { Button, TextInput, Card } from "react-native-paper";

function AgregarMantencion() {
  const [patente, setPatente] = useState("");
  const [tipoMantencion, setTipoMantencion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("");
  const [kilometrajeMantencion, setKilometrajeMantencion] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [productos, setProductos] = useState([]);
  const [mantencionesPendientes, setMantencionesPendientes] = useState([]);
  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState("");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [precioProducto, setPrecioProducto] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MaterialCommunityIcons
          name="car-arrow-right"
          size={26}
          right={20}
          color="#0077B6"
          onPress={() => navigation.navigate("Agregar Automovil")}
        />
      ),
    });
  }, [navigation]);

  const limpiarCampos = () => {
    setTipoMantencion("");
    setDescripcion("");
    setEstado("");
    setKilometrajeMantencion("");
    setProductoSeleccionado("");
    setCantidadProducto("");
    setCodigoProducto("");
    setPrecioProducto("");
    setErrorMessage("");
  };

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        if (!tipoMantencion) {
          setProductos([]);
          return;
        }

        const inventarioRef = collection(db, "inventario");
        const q = query(
          inventarioRef,
          where("categoria", "==", tipoMantencion)
        );

        const snapshot = await getDocs(q);
        const productosData = [];

        snapshot.forEach((doc) => {
          const producto = doc.data();
          productosData.push(producto);
        });

        setProductos(productosData);
      } catch (error) {
        console.error("Error al cargar productos:", error.message);
      }
    };

    cargarProductos();
  }, [tipoMantencion]);

  const handleCheckPatente = async (text) => {
    try {
      if (typeof text !== "string" || text.trim() === "") {
        setErrorMessage("La patente no es válida.");
        setPatente("");
        return;
      }

      setPatente(text);
      const carDocM = doc(db, "automoviles", text);
      const carDocSnapshotM = await getDoc(carDocM);

      if (carDocSnapshotM.exists() && carDocSnapshotM.data()) {
        setErrorMessage("Automóvil encontrado");
      } else {
        setErrorMessage("No se encontró un automóvil con esa patente");
      }
    } catch (error) {
      console.error("Error checking patente:", error.message);
      setErrorMessage("Error al verificar la patente. Inténtelo de nuevo.");
    }
  };

  const handleAddMantencion = async () => {
    try {
      if (
        !patente ||
        !tipoMantencion ||
        !descripcion ||
        !estado ||
        !kilometrajeMantencion ||
        !productoSeleccionado ||
        !cantidadProducto ||
        !precioProducto ||
        !codigoProducto
      ) {
        setErrorMessage("Por favor, complete todos los campos.");
        return;
      }

      if (typeof patente !== "string" || patente.trim() === "") {
        setErrorMessage("La patente no es válida.");
        return;
      }

      const mantencionData = {
        patente: patente,
        tipoMantencion: tipoMantencion,
        descripcion: descripcion,
        fecha: new Date().toISOString(),
        estado: estado,
        kilometrajeMantencion: kilometrajeMantencion,
        productos: [
          {
            nombreProducto: productoSeleccionado,
            cantidad: cantidadProducto,
            precio: precioProducto,
            codigoProducto: codigoProducto,
          },
        ],
      };

      setMantencionesPendientes([...mantencionesPendientes, mantencionData]);
      limpiarCampos();
    } catch (error) {
      console.error("Error saving maintenance:", error.message);
      setErrorMessage("Error al guardar la mantención. Inténtelo de nuevo.");
    }
  };

  const handleConfirmationAndSave = async () => {
    hideConfirmationModal();
    try {
      const batch = writeBatch(db);
      let tareaCount = 1;

      for (const mantencion of mantencionesPendientes) {
        const tareaId = `Tarea-${tareaCount}`;
        const mantencionDocRef = doc(
          db,
          "mantenciones",
          `${mantencion.patente}-${tareaId}`
        );

        const costoTotal = mantencion.productos.reduce(
          (total, producto) => total + producto.precio * producto.cantidad,
          0
        );

        const mantencionConCosto = { ...mantencion, costoTotal };

        batch.set(mantencionDocRef, mantencionConCosto);
        tareaCount++;
      }

      await batch.commit();

      setPatente("");
      setTipoMantencion("");
      setDescripcion("");
      setEstado("");
      setKilometrajeMantencion("");
      setProductoSeleccionado("");
      setPrecioProducto("");
      setCantidadProducto("");
      setCodigoProducto("");
      setErrorMessage("");

      setMantencionesPendientes([]);
    } catch (error) {
      console.error("Error saving mantenciones:", error.message);
      setErrorMessage("Error al guardar las mantenciones. Inténtelo de nuevo.");
    }
  };

  const handleProductoSeleccionado = (productoNombre) => {
    const productoExistente = productos.find(
      (p) => p.nombreProducto === productoNombre
    );
    if (productoExistente) {
      setProductoSeleccionado(productoNombre);
      setCantidadProducto(productoExistente.cantidad);
      setPrecioProducto(productoExistente.costo);
      setCodigoProducto(productoExistente.id);
    } else {
      console.error(
        `El producto ${productoNombre} no existe en la lista de productos.`
      );
    }
  };

  const showConfirmationModal = () => {
    setConfirmationModalVisible(true);
  };

  const hideConfirmationModal = () => {
    setConfirmationModalVisible(false);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
  };

  const translateEstado = (estado) => {
    switch (estado) {
      case "atencion_especial":
        return "Atención Especial";
      case "pendiente":
        return "Pendiente";
      case "prioridad":
        return "Prioridad";
      case "en proceso":
        return "En Proceso";
      case "terminado":
        return "Terminado";
      default:
        return estado;
    }
  };

  const formatoKilometraje = (amount) => {
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <ScrollView>
      <View style={AgregarMantencionStyles.container}>
        <View style={AgregarMantencionStyles.inputContainer}>
          <Icon
            name="car"
            size={20}
            color="black"
            style={AgregarMantencionStyles.icon}
          />
          <TextInput
            style={AgregarMantencionStyles.input}
            placeholder="Patente del auto"
            value={patente}
            autoCapitalize="characters"
            keyboardType="ascii-capable"
            mode="flat"
            label={"Patente"}
            onChangeText={(text) => handleCheckPatente(text)}
          />
        </View>
        {errorMessage ? (
          <Text style={AgregarMantencionStyles.errorText}>{errorMessage}</Text>
        ) : null}
        <View style={AgregarMantencionStyles.inputContainer}>
          <Icon
            name="wrench"
            size={20}
            color="black"
            style={AgregarMantencionStyles.icon}
          />
          <Picker
            selectedValue={tipoMantencion}
            onValueChange={(itemValue) => setTipoMantencion(itemValue)}
            style={AgregarMantencionStyles.picker}
          >
            <Picker.Item label="Todas las Categorías" value="" />
            <Picker.Item
              label="Sistema de Suspensión"
              value="Sistema de Suspensión"
            />
            <Picker.Item
              label="Afinación del Motor"
              value="Afinación del Motor"
            />
            <Picker.Item
              label="Sistema de Inyección Electrónica"
              value="Sistema de Inyección Electrónica"
            />
            <Picker.Item label="Sistema de Escape" value="Sistema de Escape" />
            <Picker.Item
              label="Sistema de Climatización"
              value="Sistema de Climatización"
            />
            <Picker.Item
              label="Sistema de Lubricación"
              value="Sistema de Lubricación"
            />
            <Picker.Item
              label="Sistema de Dirección"
              value="Sistema de Dirección"
            />
            <Picker.Item label="Sistema de Frenos" value="Sistema de Frenos" />
            <Picker.Item
              label="Sistema de Encendido"
              value="Sistema de Encendido"
            />
            <Picker.Item
              label="Inspección de Carrocería y Pintura"
              value="Inspección de Carrocería y Pintura"
            />
            <Picker.Item
              label="Sistema de Transmisión"
              value="Sistema de Transmisión"
            />
            <Picker.Item
              label="Herramientas y Equipos"
              value="Herramientas y Equipos"
            />
            <Picker.Item
              label="Sistema de Refrigeración"
              value="Sistema de Refrigeración"
            />
            <Picker.Item
              label="Accesorios y Personalización"
              value="Accesorios y Personalización"
            />
          </Picker>
        </View>
        <View style={AgregarMantencionStyles.inputContainer}>
          <Icon
            name="list"
            size={20}
            color="black"
            style={AgregarMantencionStyles.icon}
          />
          {productos && productos.length > 0 ? (
            <Picker
              selectedValue={productoSeleccionado}
              onValueChange={(itemValue) =>
                handleProductoSeleccionado(itemValue)
              }
              style={AgregarMantencionStyles.picker}
            >
              <Picker.Item label="Seleccione el producto a utilizar" value="" />
              {productos.map((item) => (
                <Picker.Item
                  label={item.nombreProducto}
                  value={item.nombreProducto}
                  key={item.nombreProducto}
                />
              ))}
            </Picker>
          ) : (
            <Text>No hay productos disponibles.</Text>
          )}
        </View>
        {precioProducto && <Text>Precio Producto: ${precioProducto}</Text>}
        <View style={AgregarMantencionStyles.inputContainer}>
          <Icon
            name="check"
            size={20}
            color="black"
            style={AgregarMantencionStyles.icon}
          />
          <Picker
            selectedValue={estado}
            onValueChange={(itemValue) => setEstado(itemValue)}
            style={AgregarMantencionStyles.picker}
          >
            <Picker.Item
              label="Seleccione el estado de la mantención"
              value=""
            />
            <Picker.Item label="Pendiente" value="pendiente" />
            <Picker.Item label="Prioridad" value="prioridad" />
            <Picker.Item label="Atención Especial" value="atencion_especial" />
          </Picker>
        </View>
        <View style={AgregarMantencionStyles.inputContainer}>
          <Icon
            name="tachometer"
            size={20}
            color="black"
            style={AgregarMantencionStyles.icon}
          />
          <TextInput
            style={AgregarMantencionStyles.input}
            keyboardType="numeric"
            mode="flat"
            label={"Kilometro"}
            value={kilometrajeMantencion}
            onChangeText={(text) => setKilometrajeMantencion(text)}
          />
        </View>
        <View style={AgregarMantencionStyles.inputContainer}>
          <Icon
            name="comment"
            size={20}
            color="black"
            style={AgregarMantencionStyles.icon}
          />
          <TextInput
            style={AgregarMantencionStyles.input}
            placeholder="Descripción de la mantención"
            value={descripcion}
            mode="flat"
            label={"Descripción"}
            onChangeText={(text) => setDescripcion(text)}
          />
        </View>
        <Button
          mode="contained"
          style={AgregarMantencionStyles.button}
          onPress={handleAddMantencion}
        >
          Agregar Mantención a Lista
        </Button>
        <FlatList
          style={{ marginBottom: 5 }}
          data={mantencionesPendientes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card style={AgregarMantencionStyles.card}>
              <Card.Content>
                <Text style={AgregarMantencionStyles.cardTitle}>
                  Tipo: {item.tipoMantencion}
                </Text>
                <Text>Descripción: {item.descripcion}</Text>
                <Text>Fecha: {formatDate(new Date(item.fecha))}</Text>
                <Text>Estado: {translateEstado(item.estado)}</Text>
                <Text>
                  Kilometraje: {formatoKilometraje(item.kilometrajeMantencion)}
                </Text>
                <Text>
                  Productos:{" "}
                  {item.productos
                    .map((producto) => producto.nombreProducto)
                    .join(", ")}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
        {mantencionesPendientes.length > 0 && (
          <Button mode="contained" onPress={showConfirmationModal}>
            Guardar Mantenciones
          </Button>
        )}
        <Modal
          isVisible={isConfirmationModalVisible}
          onBackdropPress={hideConfirmationModal}
        >
          <View style={AgregarMantencionStyles.confirmationModal}>
            <Text style={AgregarMantencionStyles.confirmationModalText}>
              ¿Estás seguro de que deseas guardar estas mantenciones?
            </Text>
            <TouchableOpacity onPress={handleConfirmationAndSave}>
              <Text style={AgregarMantencionStyles.confirmationModalButton}>
                Sí, Guardar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={hideConfirmationModal}>
              <Text style={AgregarMantencionStyles.confirmationModalButton}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

export default AgregarMantencion;
