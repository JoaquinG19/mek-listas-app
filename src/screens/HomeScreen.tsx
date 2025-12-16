import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, Card, Badge, DataTable, IconButton, MD3Colors } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Semana 35 9446-3932 Québec inc/M.A.S. Entreposage — grupo-2 — Expédition"
          subtitle="Lunes 25/08/2025"
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
          style={styles.cardTitle}
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon="folder"
              color="#582a51"                // color del ícono (primario)
              style={styles.avatarIcon}      // fondo blanco del avatar
            />
          )}
        />

        <Card.Content style={styles.cardContent}>
          <View style={styles.badgesRow}>
            <Badge style={[styles.badge, styles.badgeYellow]}>
              <Text style={styles.badgeYellowText}>AM: 07:00 - 15:30</Text>
            </Badge>
            <Badge style={[styles.badge, styles.badgeBlue]}>
              <Text style={styles.badgeBlueText}>PM: 15:30 - 23:59</Text>
            </Badge>
          </View>
        </Card.Content>
      </Card>

      <DataTable>
        <DataTable.Header>
          <DataTable.Title>N°</DataTable.Title>
          <DataTable.Title>Nombre</DataTable.Title>
          <DataTable.Title>Asistencia</DataTable.Title>
        </DataTable.Header>
        <DataTable.Row>
          <DataTable.Cell>1</DataTable.Cell>
          <DataTable.Cell >2</DataTable.Cell>
          <DataTable.Cell >
            <IconButton
              icon="plus"
              iconColor={MD3Colors.primary30}
              size={20}
              onPress={() => console.log('Pressed')}
            />
          </DataTable.Cell>
        </DataTable.Row>
      </DataTable>


      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '95%',
    borderRadius: 8,
    overflow: 'hidden', // importante para que los fondos respeten el borde redondeado
  },
  cardTitle: {
    backgroundColor: '#582a51',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
  },
  subtitle: {
    color: '#fff',
  },
  avatarIcon: {
    backgroundColor: '#fff',
  },
  cardContent: {
    backgroundColor: '#582a51',
    paddingVertical: 12,
  },
  contentText: {
    color: '#fff',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 0, // quita sombra si la hubiese
  },
  badgeYellow: {
    backgroundColor: '#FFD700', // amarillo
    marginRight: 8,
  },
  badgeYellowText: {
    color: '#000', // texto negro sobre amarillo
    fontWeight: '600',
    fontSize: 12,
  },
  badgeBlue: {
    backgroundColor: '#00BFFF', // celeste
  },
  badgeBlueText: {
    color: '#fff', // texto blanco sobre celeste
    fontWeight: '600',
    fontSize: 12,
  },
});
