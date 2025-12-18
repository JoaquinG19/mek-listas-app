// 📂 screens/AsistenciaScreen.tsx
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import BootstrapButton from "../components/BootstrapButton";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { api } from "../utils/api";
import { Divider, Icon } from "react-native-paper";


type RegistroAsistencia = {
  hora_ingreso?: string;
  hora_salida?: string;
  break_start?: string;
  tiempo_descanso?: string;
  lunch_start?: string;
  tiempo_almuerzo?: string;
};

type Turnos = {
  am?: { start: string; end: string };
  pm?: { start: string; end: string };
  noc?: { start: string; end: string };
};

export default function AsistenciaScreen({ route }) {
  const [loading, setLoading] = useState(true);
  const [empleado, setEmpleado] = useState<any>(null);
  const [asistencia, setAsistencia] = useState<any>(null);

  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [showModalPass, setShowModalPass] = useState(false);

  const navigation = useNavigation();

  const [turnos, setTurnos] = useState<Turnos>({});
  const [registros, setRegistros] = useState<{
    [key: string]: RegistroAsistencia;
  }>({});

  const [timers, setTimers] = useState<{
    [key: string]: { break: string; lunch: string };
  }>({
    am: { break: "-", lunch: "-" },
    pm: { break: "-", lunch: "-" },
    noc: { break: "-", lunch: "-" },
  });

  // 👇 Ahora recibimos grupoIds (array)
  const { empId, fecha, grupoIds, supervisorIds } = route.params;

  // 👉 Verificación al inicio
  const handleVerify = async () => {
    try {
      const res = await api.post("/asistencia/verificar-password", {
        user_id: empId,
        password,
      });

      if (res.data.success) {
        setIsVerified(true);
        Alert.alert("Éxito", "Acceso concedido");
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Fallo en la verificación"
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/asistencia/data", {
          params: {
            user_id: empId,
            fecha,
            grupo_ids: grupoIds, // 👈 aquí va el array entero
          },
        });

        setEmpleado(res.data.empleado);
        setAsistencia(res.data);
        setTurnos(res.data.turnos);
        setRegistros(res.data.registros_asistencia);

        // 🔥 Lógica para mostrar modal según modal_pass
        const grupos = res.data.grupos || [];
        const algunoConModal = grupos.some((g: any) => g.modal_pass === "si");
        setShowModalPass(algunoConModal);
        setIsVerified(!algunoConModal); // si no requiere modal, auto-verifica
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "No se pudo cargar la asistencia");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [empId, fecha, grupoIds]);

  // Función para marcar timers genéricos
  const calcTimer = (
    reg: RegistroAsistencia,
    timeField: string,
    startField: string
  ) => {
    if (!reg) return "-";
    let acum = reg[timeField] ?? "00:00:00";
    if (reg[startField]) {
      const start = new Date(reg[startField]);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      const [h, m, s] = acum.split(":").map(Number);
      const totalSec = h * 3600 + m * 60 + s + diff;
      const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
      const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
      const ss = String(totalSec % 60).padStart(2, "0");
      return `${hh}:${mm}:${ss}`;
    }
    return acum;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers({
        am: {
          break: calcTimer(registros.am, "tiempo_descanso", "break_start"),
          lunch: calcTimer(registros.am, "tiempo_almuerzo", "lunch_start"),
        },
        pm: {
          break: calcTimer(registros.pm, "tiempo_descanso", "break_start"),
          lunch: calcTimer(registros.pm, "tiempo_almuerzo", "lunch_start"),
        },
        noc: {
          break: calcTimer(registros.noc, "tiempo_descanso", "break_start"),
          lunch: calcTimer(registros.noc, "tiempo_almuerzo", "lunch_start"),
        },
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [registros]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  const renderTurno = (tipo: "am" | "pm" | "noc") => {
    const turno = turnos[tipo];
    const reg = registros[tipo];
    if (!turno) return null;

    const breakLabel = reg?.break_start
      ? `Terminar descanso ${tipo.toUpperCase()}`
      : `Iniciar descanso ${tipo.toUpperCase()}`;
    const lunchLabel = reg?.lunch_start
      ? `Terminar almuerzo ${tipo.toUpperCase()}`
      : `Iniciar almuerzo ${tipo.toUpperCase()}`;

    return (
      <View style={styles.turnoContainer}>
        <Text style={styles.subtitle}>
          Turno {tipo.toUpperCase()} ({turno.start} - {turno.end})
        </Text>

        {/* Ingreso */}
        <View style={styles.row}>
          <View style={styles.btnWrap}>
            <BootstrapButton
              title={`Marcar ingreso ${tipo.toUpperCase()}`}
              variant="primary"
              disabled={!!reg?.hora_ingreso}
              onPress={async () => {
                try {
                  const res = await api.post("/asistencia/marcar-ingreso", {
                    user_id: empId,
                    fecha,
                    tipo,
                    grupo_ids: grupoIds,
                    supervisor_ids: supervisorIds,
                  });
                  Alert.alert("Éxito", res.data.message);
                  setRegistros({ ...registros, [tipo]: res.data.detalle });
                } catch (err: any) {
                  Alert.alert("Error", "Error al marcar ingreso");
                }
              }}
            />

          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon source="clock-in" size={18} color="#4799cfff" />
            <Text style={styles.textTime}>  {reg?.hora_ingreso ?? "-"}</Text>
          </View>

        </View>

        {reg?.hora_ingreso && (
          <>
            {/* Descanso */}
            <View style={styles.row}>
              <View style={styles.btnWrap}>
                <BootstrapButton
                  title={breakLabel}
                  variant="warning"
                  onPress={async () => {
                    try {
                      const res = await api.post(
                        "/asistencia/iniciar-descanso",
                        {
                          user_id: empId,
                          fecha,
                          tipo, // "am" | "pm" | "noc"
                          grupo_ids: grupoIds,
                          supervisor_ids: supervisorIds,
                        }
                      );

                      Alert.alert("Éxito", res.data.message);

                      // 🔥 Actualizamos el registro con lo que devuelve la API
                      setRegistros({ ...registros, [tipo]: res.data.detalle });
                    } catch (err: any) {
                      Alert.alert(
                        "Error",
                        err.response?.data?.message ||
                          "Error al marcar descanso"
                      );
                    }
                  }}
                  disabled={!!reg?.hora_salida}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  source="coffee"
                  size={18}
                  color={
                    parseInt(timers[tipo].break.split(":")[0], 10) * 60 +
                      parseInt(timers[tipo].break.split(":")[1], 10) >
                    30
                      ? "red"
                      : "#eb9c26ff"
                  }
                />
                <Text
                  style={[
                    styles.textTime,
                    parseInt(timers[tipo].break.split(":")[0], 10) * 60 +
                      parseInt(timers[tipo].break.split(":")[1], 10) >
                    30
                      ? { color: "red" }
                      : {},
                  ]}
                >
                  {" "}
                  {timers[tipo].break}
                </Text>
              </View>

            </View>

            {/* Almuerzo */}
            <View style={styles.row}>
              <View style={styles.btnWrap}>
                <BootstrapButton
                  title={lunchLabel}
                  variant="success"
                  onPress={async () => {
                    try {
                      const res = await api.post(
                        "/asistencia/iniciar-almuerzo",
                        {
                          user_id: empId,
                          fecha,
                          tipo,
                          grupo_ids: grupoIds,
                          supervisor_ids: supervisorIds,
                        }
                      );
                      Alert.alert("Éxito", res.data.message);

                      // 👇 Actualizar el registro con lo que devuelve la API
                      setRegistros({ ...registros, [tipo]: res.data.detalle });
                    } catch (err: any) {
                      Alert.alert(
                        "Error",
                        err.response?.data?.message ||
                          "Error al marcar almuerzo"
                      );
                    }
                  }}
                  disabled={!!reg?.hora_salida}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  source="silverware-fork-knife"
                  size={16}
                  color={
                    parseInt(timers[tipo].break.split(":")[0], 10) * 60 +
                      parseInt(timers[tipo].break.split(":")[1], 10) >
                    30
                      ? "red"
                      : "#4caf50"
                  }
                />
                <Text
                  style={[
                    styles.textTime,
                    parseInt(timers[tipo].lunch.split(":")[0], 10) * 60 +
                      parseInt(timers[tipo].lunch.split(":")[1], 10) >
                    30
                      ? { color: "red" }
                      : {},
                  ]}
                >
                  {" "}
                  {timers[tipo].lunch}
                </Text>
              </View>

            </View>

            {/* Salida */}
            <View style={styles.row}>
              <View style={styles.btnWrap}>
                <BootstrapButton
                  title={`Marcar salida ${tipo.toUpperCase()}`}
                  variant="danger"
                  disabled={!!reg?.hora_salida}
                  onPress={async () => {
                    try {
                      const res = await api.post("/asistencia/marcar-salida", {
                        user_id: empId,
                        fecha,
                        tipo,
                        grupo_ids: grupoIds,
                        supervisor_ids: supervisorIds,
                      });
                      Alert.alert("Éxito", res.data.message);

                      // 👇 Actualizar el registro local con lo que devuelve la API
                      setRegistros({ ...registros, [tipo]: res.data.detalle });
                    } catch (err: any) {
                      Alert.alert(
                        "Error",
                        err.response?.data?.message || "Error al marcar salida"
                      );
                    }
                  }}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon source="clock-out" size={18} color="#ff746aff" />
                <Text style={styles.textTime}>  {reg?.hora_salida ?? "-"}</Text>
              </View>

            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔐 Modal de verificación SOLO si algún grupo tiene modal_pass="si" */}
      {showModalPass && (
        <Modal visible={!isVerified} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ fontSize: 18, marginBottom: 8 }}>
                Ingrese su contraseña
              </Text>
              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  title="Cancelar"
                  color="gray"
                  onPress={() => navigation.goBack()}
                />
                <Button title="Confirmar" onPress={handleVerify} />
              </View>
            </View>
          </View>
        </Modal>
      )}
      <ScrollView style={styles.container}>
        <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Icon source="account-circle" size={20} color="#555" />
          <Text style={styles.title}>  Asistencia</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
          <Icon source="account" size={16} color="#777" />
          <Text style={styles.textStrong}>
            {" "}
            {empleado?.name ?? "-"} {empleado?.apellido_paterno ?? "-"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon source="calendar" size={16} color="#777" />
          <Text style={styles.textMuted}>  {fecha}</Text>
        </View>
      </View>

      <Divider />


        {renderTurno("am")}
        {renderTurno("pm")}
        {renderTurno("noc")}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            padding: 16,
            borderRadius: 8,
            marginTop: 2,
            marginBottom: 25,
          }}
        >
          <Icon source="timer-outline" size={20} color="#333" />
          <Text style={{ marginLeft: 8 }}>
            <Text style={{ fontWeight: "bold" }}>Horas regulares asignadas: </Text>
            {asistencia?.horas_regulares ?? "-"}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 16 },
  turnoContainer: { marginBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  safeArea: { flex: 1, backgroundColor: "#fff", paddingTop: -30 },
  btnWrap: {
    width: 200, // 👈 mismo ancho para todos (ajusta a tu gusto)
  },

  textStrong: {
    fontSize: 15,
    fontWeight: "600",
  },

  textMuted: {
    fontSize: 13,
    color: "#777",
  },

  textTime: {
    fontSize: 14,
    fontWeight: "500",
  },

});
