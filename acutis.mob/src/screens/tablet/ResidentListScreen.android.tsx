import React from 'react';
import { View, Text, StatusBar, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { residents } from '../../mock/data';

export default function ResidentListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0A84FF" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Residents</Text>
        <Text style={styles.headerSub}>Current census overview</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.table}>
          <View style={[styles.row, styles.rowHeader]}>
            <Text style={[styles.cell, styles.cellId]}>ID</Text>
            <Text style={[styles.cell, styles.cellName]}>Name</Text>
            <Text style={[styles.cell, styles.cellRoom]}>Room</Text>
            <Text style={[styles.cell, styles.cellStatus]}>Status</Text>
            <Text style={[styles.cell, styles.cellDays]}>Days</Text>
          </View>
          {residents.map((resident) => (
            <Pressable
              key={resident.id}
              android_ripple={{ color: '#e5e7eb' }}
              style={styles.row}
              onPress={() => navigation.navigate('ResidentDetail', { residentId: resident.id })}
            >
              <Text style={[styles.cell, styles.cellId]}>{resident.id}</Text>
              <Text style={[styles.cell, styles.cellName]}>{resident.name}</Text>
              <Text style={[styles.cell, styles.cellRoom]}>{resident.room}</Text>
              <Text style={[styles.cell, styles.cellStatus]}>{resident.status}</Text>
              <Text style={[styles.cell, styles.cellDays]}>{resident.days}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0A84FF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'white', opacity: 0.9, marginTop: 4 },
  content: { padding: 16 },
  table: { backgroundColor: 'white', borderRadius: 12, paddingVertical: 8, elevation: 1 },
  row: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  rowHeader: { backgroundColor: '#f1f5f9', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  cell: { color: '#0f172a' },
  cellId: { width: 64, fontWeight: '700' },
  cellName: { flex: 1, fontWeight: '600' },
  cellRoom: { width: 86 },
  cellStatus: { width: 84 },
  cellDays: { width: 48, textAlign: 'right' }
});
