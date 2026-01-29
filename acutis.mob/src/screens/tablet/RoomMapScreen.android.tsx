import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Pressable } from 'react-native';
import { MapPin, ChevronLeft } from 'lucide-react-native';
import { theme } from '../../theme';

export default function RoomMapScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Pressable android_ripple={{ color: theme.colors.ripple }} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.colors.text.onPrimary} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Room Map</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MapPin color={theme.colors.text.primary} size={18} />
            <Text style={styles.cardTitle}>Layout</Text>
          </View>
          <Text style={styles.cardText}>Placeholder map/legend of rooms and assignments.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: theme.colors.text.onPrimary, fontSize: theme.font.title, fontWeight: '800' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 16, elevation: 1, marginBottom: 12 },
  cardTitle: { fontWeight: '800', color: theme.colors.text.primary },
  cardText: { color: theme.colors.text.secondary, marginTop: 6 },
});

