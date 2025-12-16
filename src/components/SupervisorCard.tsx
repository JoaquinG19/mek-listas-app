import React from "react";
import { Card, Avatar } from "react-native-paper";
import styles from "../styles/stylesPeriodo";

export default function SupervisorCard({ supervisor, grupo }) {
  return (
    <Card style={styles.card}>
      <Card.Title
        title={`Supervisor: ${supervisor?.name ?? "—"} ${supervisor?.apellido_paterno ?? "—"}`}
        subtitle={`PP-${grupo?.periodos_id ?? "—"}`}
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
  );
}
