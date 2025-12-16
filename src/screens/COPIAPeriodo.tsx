import * as React from 'react';
import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from 'react-native';
import { Avatar, Text, Card, IconButton, Badge } from 'react-native-paper';

const COL_WIDTH_INDEX = 48;
const COL_WIDTH_NAME = 160;
const COL_WIDTH_DAY = 140;

const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const sampleData = [
  { id: '1', nombre: 'Juan Pérez', dias: [null,null,null,null,null,null,null] },
  { id: '2', nombre: 'Ana López', dias: [null,null,null,null,null,null,null] },
  { id: '3', nombre: 'Carlos Ruiz', dias: [null,null,null,null,null,null,null] },
];

export default function PeriodoScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 👇 Cambia esta URL por la de tu backend Laravel
    fetch("http://192.168.1.208/sis-horas/public/api/supervision/27/cards")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
        {/* Contenido en bucle o el array o el mapeado */}
        <Card style={styles.card}>
          <Card.Title
            title="Supervisor: Aquí el name del supervisor"
            subtitle="PP-aquí el periodos_id de grupo"
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

        {data.map((card, index) => (
          <Card style={styles.card}>
            <Card.Title
              title={`Supervisor: ${card.supervisor?.name ?? "—"}`}
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
        ))}
        <View style={{ padding: 10 }} />

        <Card style={styles.topheader}>
          <Card.Title title="Semana 35 9446-3932 Québec inc/M.A.S. Entreposage — grupo-2 — Expédition" />
        </Card>

        <View style={styles.tableRow}>
          {/* IZQUIERDA: N° y Nombre */}
          <View style={[styles.leftBlock, { width: COL_WIDTH_INDEX + COL_WIDTH_NAME }]}>
            {/* Header izquierdo */}
            <View style={[styles.rowhead, styles.headerRow]}>
              <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                <Text style={styles.headerText}>N°</Text>
              </View>
              <View style={[styles.cell, { width: COL_WIDTH_NAME }]}>
                <Text style={styles.headerText}>Nombre</Text>
              </View>
            </View>

            {/* Filas izquierda */}
            {sampleData.map((row, rowIndex) => (
              <View
                key={row.id}
                style={[  
                  styles.row,
                  rowIndex % 2 === 0 ? styles.rowEven : styles.rowOdd,
                ]}
              >
                <View style={[styles.cell, { width: COL_WIDTH_INDEX }]}>
                  <Text style={styles.cellText}>{row.id}</Text>
                </View>
                <View style={[styles.cell, { width: COL_WIDTH_NAME, paddingHorizontal: 8 }]}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cellText}>
                    {row.nombre}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* DERECHA: Scroll horizontal */}
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              {/* Header días */}
              <View style={[styles.rowday, styles.headerRow]}>
                {diasSemana.map((dia) => (
                  <View key={dia} style={[styles.cell, { width: COL_WIDTH_DAY }]}>
                    <Text style={styles.headerDay}>{dia}</Text>
                    <Text style={styles.headerMessage}>12/8/25</Text>
                      <Text style={styles.badgeBlueText}>PM: 15:30 - 23:59</Text>
                    <View style={{ padding: 2 }} />
                      <Text style={styles.badgeYellowText}>AM: 07:00 - 15:30</Text>
                    {/* <Text style={styles.headerMessage}>Sin asignar</Text> */}
                  </View>
                ))}
              </View>

              {/* Filas de días con IconButton */}
              {sampleData.map((row, rowIndex) => (
                <View
                  key={row.id}
                  style={[
                    styles.row,
                    rowIndex % 2 === 0 ? styles.rowEven : styles.rowOdd,
                    { minWidth: diasSemana.length * COL_WIDTH_DAY },
                  ]}
                >
                  {row.dias.map((_, i) => (
                    <View key={i} style={[styles.cell, { width: COL_WIDTH_DAY }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.iconWrapper}>
                          <IconButton
                            icon="plus"
                            size={16} // lo ajusté un poco al tamaño del cuadrado
                            iconColor="green"
                            onPress={() =>
                              console.log(`Agregar en fila ${row.id}, día ${diasSemana[i]}`)
                            }
                            style={{ margin: 0 }}
                          />
                        </View>

                        <Text style={styles.iconTextYellow}>Asistio</Text>
                        <Text style={styles.iconTextBlue}>Retraso</Text>
                      </View>

                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        {/* Fin del contenido en bucle */}
        <View style={{ padding: 10 }} />
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
  rowday: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowhead: { flexDirection: 'row', alignItems: 'center', paddingVertical: 23.8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 24 },
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
    borderColor: 'green',
    borderRadius: 6,   // cuadrado con bordes levemente redondeados
    width: 21.5,         // ancho del contenedor
    height: 21.5,        // alto del contenedor
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTextYellow: {
    marginLeft: 6,          // espacio entre el icono y el texto
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#FFD700', // dorado
    color: '#000',              // texto visible
    paddingHorizontal: 6,       // espacio a los lados
    paddingVertical: 2,         // espacio arriba/abajo
    borderRadius: 10,           // bordes redondeados tipo "badge"
    overflow: 'hidden',         // asegura que el fondo no se desborde
  },
  iconTextBlue: {
    marginLeft: 6,          // espacio entre el icono y el texto
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#00BFFF', // dorado
    color: '#fff',              // texto visible
    paddingHorizontal: 6,       // espacio a los lados
    paddingVertical: 2,         // espacio arriba/abajo
    borderRadius: 10,           // bordes redondeados tipo "badge"
    overflow: 'hidden',         // asegura que el fondo no se desborde
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
});
