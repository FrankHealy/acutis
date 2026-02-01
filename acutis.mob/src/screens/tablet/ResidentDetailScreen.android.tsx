import React from 'react';
import { View, Text, StatusBar, StyleSheet, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { residents } from '../../mock/data';

type ResidentDetailRoute = RouteProp<RootStackParamList, 'ResidentDetail'>;

export default function ResidentDetailScreen() {
  const route = useRoute<ResidentDetailRoute>();
  const resident = residents.find((item) => item.id === route.params.residentId);

  if (!resident) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#0A84FF" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Resident Details</Text>
          <Text style={styles.headerSub}>Resident not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0A84FF" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{resident.name}</Text>
        <Text style={styles.headerSub}>{resident.id}</Text>
      </View>

      <View style={styles.card}>
        <Image source={resident.photo} style={styles.photo} />
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Room</Text>
            <Text style={styles.detailValue}>{resident.room}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>{resident.status}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Days</Text>
            <Text style={styles.detailValue}>{resident.days}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Age</Text>
            <Text style={styles.detailValue}>{resident.age}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Primary Counselor</Text>
            <Text style={styles.detailValue}>{resident.primaryCounselor}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0A84FF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'white', opacity: 0.9, marginTop: 4 },
  card: { margin: 16, backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 2, flexDirection: 'row', gap: 16 },
  photo: { width: 200, height: 200, borderRadius: 12 },
  details: { flex: 1, gap: 10, justifyContent: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { color: '#64748b', fontWeight: '700', width: 130 },
  detailValue: { color: '#0f172a', fontWeight: '600' }
});
