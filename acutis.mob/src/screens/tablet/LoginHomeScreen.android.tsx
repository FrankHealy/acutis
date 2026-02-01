import React, { useState } from 'react';
import { View, Text, StatusBar, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Users, UserPlus, ClipboardList, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { occupancy, formatPercent } from '../../mock/data';

export default function LoginHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [screen, setScreen] = useState<'login' | 'home'>('login');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');

  if (screen === 'login') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <StatusBar backgroundColor="#0A84FF" barStyle="light-content" />
        <View style={styles.loginHeader}>
          <Users color="#fff" size={28} />
          <View>
            <Text style={styles.brand}>Acutis</Text>
            <Text style={styles.brandSub}>Treatment Center Management</Text>
          </View>
        </View>
        <View style={styles.loginCard}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter username"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Authenticator Code</Text>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            style={[styles.input, { letterSpacing: 2 }]}
          />

          <Pressable
            android_ripple={{ color: '#93c5fd' }}
            style={[styles.cta, !(username && code) && styles.ctaDisabled]}
            onPress={() => username && code && setScreen('home')}
          >
            <Text style={styles.ctaText}>Sign In</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar backgroundColor="#0A84FF" barStyle="light-content" />
      <View style={styles.homeHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Users color="#fff" size={20} />
          <Text style={styles.homeTitle}>Dashboard</Text>
        </View>
        <Pressable android_ripple={{ color: '#e5e7eb' }} style={styles.logoutBtn} onPress={() => setScreen('login')}>
          <LogOut color="#0A84FF" size={16} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>DETOX UNIT</Text>
          <Text style={styles.statValue}>{occupancy.detox.used}/{occupancy.detox.capacity}</Text>
          <Text style={styles.statSub}>{formatPercent(occupancy.detox.used, occupancy.detox.capacity)}% Occupancy</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ALCOHOL UNIT</Text>
          <Text style={styles.statValue}>{occupancy.alcohol.used}/{occupancy.alcohol.capacity}</Text>
          <Text style={styles.statSub}>{formatPercent(occupancy.alcohol.used, occupancy.alcohol.capacity)}% Occupancy</Text>
        </View>

        <View style={{ height: 24 }} />

        <View style={styles.actionsGrid}>
          <Pressable android_ripple={{ color: '#e5e7eb' }} style={styles.actionCard} onPress={() => navigation.navigate('AdmissionForm')}>
            <UserPlus color="#0f172a" size={18} />
            <Text style={styles.actionTitle}>New Admission</Text>
            <Text style={styles.actionSub}>Register a new resident</Text>
          </Pressable>
          <Pressable android_ripple={{ color: '#e5e7eb' }} style={styles.actionCard} onPress={() => navigation.navigate('RollCall')}>
            <ClipboardList color="#0f172a" size={18} />
            <Text style={styles.actionTitle}>Roll Call</Text>
            <Text style={styles.actionSub}>Take attendance</Text>
          </Pressable>
          <Pressable android_ripple={{ color: '#e5e7eb' }} style={styles.actionCard} onPress={() => navigation.navigate('GroupTherapy')}>
            <Users color="#0f172a" size={18} />
            <Text style={styles.actionTitle}>Group Therapy</Text>
            <Text style={styles.actionSub}>Start a session now</Text>
          </Pressable>
          <Pressable android_ripple={{ color: '#e5e7eb' }} style={styles.actionCard} onPress={() => navigation.navigate('ResidentList')}>
            <Users color="#0f172a" size={18} />
            <Text style={styles.actionTitle}>Residents</Text>
            <Text style={styles.actionSub}>View resident list</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loginHeader: { paddingTop: 32, paddingBottom: 16, backgroundColor: '#0A84FF', alignItems: 'center', gap: 8 },
  brand: { color: 'white', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  brandSub: { color: 'white', opacity: 0.9, marginTop: 4, textAlign: 'center' },
  loginCard: { margin: 16, backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 2 },
  label: { fontSize: 14, color: '#0f172a', fontWeight: '600' },
  input: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginTop: 6 },
  cta: { marginTop: 16, backgroundColor: '#0A84FF', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  ctaDisabled: { backgroundColor: '#93c5fd' },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },

  homeHeader: { backgroundColor: '#0A84FF', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  logoutBtn: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 1, marginBottom: 12 },
  statLabel: { color: '#64748b', fontWeight: '700', marginBottom: 4 },
  statValue: { color: '#0f172a', fontWeight: '800', fontSize: 28 },
  statSub: { color: '#475569', marginTop: 6 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 1, width: '48%', gap: 6 },
  actionTitle: { fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  actionSub: { color: '#64748b' }
});
