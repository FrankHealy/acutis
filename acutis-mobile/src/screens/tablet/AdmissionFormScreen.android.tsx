import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Pressable, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';

type Section = {
  id: string;
  title: string;
  required?: boolean;
};

const SECTIONS: Section[] = [
  { id: 'personal-identity', title: 'Personal Identity', required: true },
  { id: 'contact', title: 'Contact Information' },
  { id: 'address', title: 'Address' },
  { id: 'photo', title: 'Photo & Documents' },
  { id: 'medical-insurance', title: 'Medical & Insurance' },
  { id: 'addiction', title: 'Addiction & Treatment', required: true },
  { id: 'next-of-kin', title: 'Next of Kin' },
  { id: 'religious-legal', title: 'Religious & Legal' },
  { id: 'prescriptions', title: 'Medical Prescriptions' },
  { id: 'assignment', title: 'Room & Finance' }
];

export default function AdmissionFormScreen() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'personal-identity': true });

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#0A84FF" barStyle="light-content" />

      <View style={styles.header}>
        <User color="#fff" size={20} />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.headerTitle}>New Admission</Text>
          <Text style={styles.headerSub}>Alcohol Unit • {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map((s) => (
          <View key={s.id} style={styles.card}>
            <Pressable
              android_ripple={{ color: '#e5e7eb' }}
              onPress={() => toggle(s.id)}
              style={styles.cardHeader}
            >
              <Text style={styles.cardTitle}>
                {s.title}
                {s.required ? ' *' : ''}
              </Text>
              <Text style={styles.cardChevron}>{expanded[s.id] ? '▲' : '▼'}</Text>
            </Pressable>
            {expanded[s.id] && (
              <View style={styles.cardBody}>
                <Text style={styles.placeholderText}>Section fields go here (Android)</Text>
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 16, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#0A84FF', flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'white', opacity: 0.9, marginTop: 2 },
  content: { padding: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', elevation: 1, marginBottom: 12 },
  cardHeader: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardChevron: { fontSize: 16, color: '#64748b' },
  cardBody: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  placeholderText: { color: '#475569' }
});

