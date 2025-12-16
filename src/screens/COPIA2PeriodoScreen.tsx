import * as React from 'react';
import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from 'react-native';
import { Avatar, Text, Card, IconButton, Badge } from 'react-native-paper';

const COL_WIDTH_INDEX = 48;
const COL_WIDTH_NAME = 160;
const COL_WIDTH_DAY = 140;

export default function PeriodoScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 👇 Cambia esta URL por la de tu backend Laravel
    fetch("http://192.168.1.207/sis-horas/public/api/supervision/27/cards")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
        {/* Contenido en bucle o el array o el mapeado */}
        {data.map((card, index) => (
          <View key={index}>
            {/* 👤 Supervisor */}
            <Card style={styles.card}>
              <Card.Title
                title={`Supervisor: ${card.supervisor?.name ?? "—"} ${card.supervisor?.apellido_paterno ?? "—"}`}
                subtitle={`PP-${card.grupo?.periodos_id ?? "—"}`}
                titleStyle={styles.title}
                subtitleStyle={styles.subtitle}
                style={styles.cardTitle}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon="folder"
                    color="#582a51"
                    style={styles.avatarIcon}
                  />
                )}
              />
            </Card>

            <View style={{ padding: 10 }} />

            {Object.entries(card.diasSemana ?? {}).map(([sem, dias]) => (
              <React.Fragment key={sem}>
                {/* 🏷️ Header de semana */}
                <Card style={styles.topheader}>
                  <Card.Title
                    title={`Semana ${sem.slice(-2)} ${card.empresa?.nombre ?? "—"} — ${card.grupo?.titulo ?? "—"} — ${card.grupo?.servicios?.nombre ?? "—"}`}
                  />
                </Card>

                {/* 📋 Tabla */}
                <View style={styles.tableRow}>
                  {/* IZQUIERDA: N° y Nombre */}
                  <View style={[styles.leftBlock, { width: COL_WIDTH_INDEX + COL_WIDTH_NAME }]}>
                    {/* Header fijo */}
                    <View style={[styles.rowhead, styles.headerRow]}>
                      <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                        <Text style={styles.headerText}>N°</Text>
                      </View>
                      <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                        <Text style={styles.headerText}>Nombre</Text>
                      </View>
                    </View>

                    {/* Supervisor siempre primero */}
                    <View style={[styles.row, styles.rowEven]}>
                      <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                        <Text style={styles.cellText}>1</Text>
                      </View>
                      <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                        <Text style={styles.cellText}>
                          {card.supervisor?.name} {card.supervisor?.apellido_paterno}
                        </Text>
                      </View>
                    </View>

                    {/* Empleados */}
                    {card.empleados?.map((emp, i) => (
                      <View key={emp.id} style={[styles.row, i % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                        <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                          <Text style={styles.cellText}>{i + 2}</Text>
                        </View>
                        <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                          <Text style={styles.cellText}>{emp.name}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* DERECHA: días */}
                  <ScrollView horizontal showsHorizontalScrollIndicator>
                    <View>
                      {/* Header días */}
                      <View style={[styles.rowday, styles.headerRow]}>
                        {dias.map((dia, idx) => (
                          <View key={idx} style={[styles.cell, { width: COL_WIDTH_DAY }]}>
                            <Text style={styles.headerDay}>{dia.dia}</Text>
                            {dia.fecha ? (
                              <>
                                <Text style={styles.headerMessage}>
                                  {dia.fecha.split("-").reverse().join("/")}
                                </Text>
                                {dia.am && <Text style={styles.badgeYellowText}>AM: {dia.am}</Text>}
                                {dia.pm && <Text style={styles.badgeBlueText}>PM: {dia.pm}</Text>}
                                {dia.noc && <Text style={styles.badgePrimaryText}>NOC: {dia.noc}</Text>}
                              </>
                            ) : (
                              <Text style={styles.headerMessage}>Sin asignación</Text>
                            )}
                          </View>
                        ))}
                      </View>

                      {/* Fila Supervisor + Empleados */}
                      {[{ ...card.supervisor, isSup: true }, ...(card.empleados ?? [])].map(
                        (emp, rowIndex) => (
                          <View
                            key={emp.id}
                            style={[
                              styles.row,
                              rowIndex % 2 === 0 ? styles.rowEven : styles.rowOdd,
                              { minWidth: dias.length * COL_WIDTH_DAY },
                            ]}
                          >
                            {dias.map((dia, i) => (
                              <View key={i} style={[styles.cell, { width: COL_WIDTH_DAY }]}>
                                {emp.isSup ? (
                                  // 👨‍💼 SUPERVISOR: usa hasSup
                                  dia.hasSup ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                      <View
                                      style={[
                                        styles.iconWrapper,
                                        { borderColor: dia.active ? "green" : "gray" },
                                      ]}
                                      >
                                        <IconButton
                                          icon="plus"
                                          size={26}
                                          iconColor={dia.active ? "green" : "gray"}
                                          onPress={() =>
                                            console.log(`Abrir modal -> supervisor ${emp.id}, fecha ${dia.fecha}`)
                                          }
                                          disabled={!dia.active}
                                        />
                                      </View>
                                      <Text style={styles.badgeEstado}>Aqui el texto</Text>
                                    </View>
                                  ) : (
                                    <Text style={{ color: "#999" }}>—</Text>
                                  )
                                ) : (
                                  // 👷 EMPLEADOS: revisa asignaciones
                                  card.asignaciones?.[emp.id]?.[dia.fecha] ? (
                                    <View
                                      style={[
                                        styles.iconWrapper,
                                        { borderColor: dia.active ? "green" : "gray" },
                                      ]}
                                    >
                                      <IconButton
                                        icon="plus"
                                        size={26}
                                        iconColor={dia.active ? "green" : "gray"}
                                        onPress={() =>
                                          console.log(`Abrir modal -> empleado ${emp.id}, fecha ${dia.fecha}`)
                                        }
                                        disabled={!dia.active}
                                      />
                                    </View>
                                  ) : (
                                    <Text style={{ color: "#999" }}>—</Text>
                                  )
                                )}
                              </View>
                            ))}
                          </View>
                        )
                      )}
                    </View>
                  </ScrollView>
                </View>
              </React.Fragment>
            ))}

          </View>
        ))}
        {/* OJO EL DATA MAP DEBE ABARCAR HASTA AQUÍ */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { borderRadius: 8, overflow: 'hidden' },
  cardTitle: { backgroundColor: '#582a51' },
  title: { color: '#fff', fontWeight: '700' },
  subtitle: { color: '#fff' },
  avatarIcon: { backgroundColor: '#fff' },
  topheader: { borderRadius: 0, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'flex-start' },
  leftBlock: { borderRightWidth: 1, borderRightColor: '#ddd' },
  rowday: { flexDirection: 'row', alignItems: 'center', minHeight: 80, },
  rowhead: { flexDirection: 'row', alignItems: 'center', minHeight: 80, },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 80, },
  headerRow: { backgroundColor: '#582a51' },
  cell: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  
  headerText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 16 },
  headerDay: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 10 },
  headerMessage: { color: 'gray', fontWeight: '700', textAlign: 'center', fontSize: 6 },
  cellText: { color: '#000', textAlign: 'center' },
  rowEven: { backgroundColor: '#fafafa' },
  rowOdd: { backgroundColor: '#fff' },
  iconWrapper: {
    borderWidth: 2,
    borderRadius: 6,   // cuadrado con bordes levemente redondeados
    width: 25,       // ancho del contenedor
    height: 25,      // alto del contenedor
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 12,
    height: 16,
  },
  badgeYellowText: {
    fontSize: 6,
    fontWeight: '600',
    backgroundColor: '#FFD700', // dorado
    color: '#000',              // texto visible
    paddingHorizontal: 6,       // espacio a los lados
    paddingVertical: 2,         // espacio arriba/abajo
    borderRadius: 10,           // bordes redondeados tipo "badge"
    overflow: 'hidden',         // asegura que el fondo no se desborde
  },
  badgeBlueText: {
    fontSize: 6,
    fontWeight: '600',
    backgroundColor: '#00BFFF', // dorado
    color: '#fff',              // texto visible
    paddingHorizontal: 6,       // espacio a los lados
    paddingVertical: 2,         // espacio arriba/abajo
    borderRadius: 10,           // bordes redondeados tipo "badge"
    overflow: 'hidden',         // asegura que el fondo no se desborde
  },
  badgePrimaryText: {
    fontSize: 6,
    fontWeight: '600',
    backgroundColor: '#007bff', // dorado
    color: '#fff',              // texto visible
    paddingHorizontal: 6,       // espacio a los lados
    paddingVertical: 2,         // espacio arriba/abajo
    borderRadius: 10,           // bordes redondeados tipo "badge"
    overflow: 'hidden',         // asegura que el fondo no se desborde
  },
  badgeEstado: {
    fontSize: 6,
    fontWeight: '600',
    backgroundColor: '#FFD700', // dorado
    color: '#000',              // texto visible
    paddingHorizontal: 6,       // espacio a los lados
    paddingVertical: 2,         // espacio arriba/abajo
    borderRadius: 10,           // bordes redondeados tipo "badge"
    overflow: 'hidden',         // asegura que el fondo no se desborde
  },
});