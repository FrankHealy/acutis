import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Pressable } from 'react-native';
import { User, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

const participants = [
  { id: 'p1', name: 'Michael', status: 'Not yet' },
  { id: 'p2', name: 'James', status: 'Spoke' },
  { id: 'p3', name: 'David', status: 'Not yet' },
  { id: 'p4', name: 'John', status: 'Spoke' },
  { id: 'p5', name: 'Robert', status: 'Not yet' },
  { id: 'p6', name: 'Thomas', status: 'Not yet' },
  { id: 'p7', name: 'Patrick', status: 'Not yet' },
  { id: 'p8', name: 'Sean', status: 'Spoke' },
  { id: 'p9', name: 'Daniel', status: 'Not yet' },
  { id: 'p10', name: 'Kevin', status: 'Not yet' },
  { id: 'p11', name: 'Mark', status: 'Spoke' },
  { id: 'p12', name: 'Brian', status: 'Not yet' },
  { id: 'p13', name: 'Alan', status: 'Not yet' },
  { id: 'p14', name: 'Paul', status: 'Not yet' },
  { id: 'p15', name: 'Gary', status: 'Spoke' }
];

const questions = [
  'How did you first realize you were powerless over alcohol?',
  "What does 'unmanageable' mean to you?",
  'Can you share an example of when you tried to control your drinking?',
  'a) What specific strategies or rules did you try to implement?',
  'b) How long were you able to maintain these strategies?',
  'c) What ultimately led to these attempts failing?',
  'How has admitting powerlessness changed your perspective?',
  'What resistance did you have to accepting this step?'
];

const observationTerms = [
  { label: 'Core', detail: 'Always used, must-have baseline terms', count: 6 },
  { label: 'Frequent', detail: 'Used regularly in most sessions', count: 5 },
  { label: 'Common', detail: 'Often useful, but not every session', count: 14 },
  { label: 'Occasional', detail: 'Situational, depending on group or individual state', count: 5 },
  { label: 'Rare', detail: 'Seldom needed, only in specific circumstances', count: 1 },
  { label: 'Very Rare', detail: 'Edge cases, hardly ever used', count: 0 }
];

export default function GroupTherapySessionScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      <View style={styles.navHeader}>
        <Pressable android_ripple={{ color: theme.colors.ripple }} onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.colors.text.onPrimary} size={22} />
        </Pressable>
        <Text style={styles.navTitle}>Group Therapy</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Step 1: Powerlessness</Text>
          <Text style={styles.headerSub}>Group Therapy Morning Session - 1/20/2026</Text>
        </View>

        <View style={styles.topGrid}>
          <View style={styles.moduleCard}>
            <Text style={styles.sectionTitle}>Module Text</Text>
            <View style={styles.moduleBody}>
              <Text style={styles.moduleText}>
                consequences create additional stress and complications that make life feel even more out of control.
                The shame and secrecy that often accompany drinking problems can lead to isolation and a sense of living
                a double life.{"\n\n"}
                Perhaps most significantly, many people find that their values and their actions become increasingly
                misaligned. They may do things while drinking that go against their fundamental beliefs about how they
                want to treat others or how they want to live their lives. This internal conflict creates deep
                psychological distress and contributes to the sense that life has become unmanageable.
              </Text>
            </View>
          </View>

          <View style={styles.participantsCard}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <View style={styles.participantsGrid}>
              {participants.map((participant) => {
                const spoke = participant.status === 'Spoke';
                return (
                  <View key={participant.id} style={styles.participantChip}>
                    <View style={styles.participantIcon}>
                      <User color="#64748b" size={18} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.participantName} numberOfLines={1}>
                        {participant.name}
                      </Text>
                      <Text style={[styles.participantStatus, spoke && styles.participantStatusSpoke]}>
                        {participant.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.questionsCard}>
          <Text style={styles.sectionTitle}>Discussion Questions</Text>
          <View style={styles.questionsList}>
            {questions.map((question, index) => (
              <View key={`${question}-${index}`} style={styles.questionRow}>
                <Text style={styles.questionText}>{question}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.librarySection}>
          <Text style={styles.sectionTitle}>Observation Term Library</Text>
          <View style={styles.libraryGrid}>
            {observationTerms.map((term) => (
              <View key={term.label} style={styles.libraryCard}>
                <View style={styles.libraryHeader}>
                  <Text style={styles.libraryTitle}>{term.label}</Text>
                  <Text style={styles.libraryCount}>{term.count} terms</Text>
                </View>
                <Text style={styles.libraryDetail}>{term.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.activeQuestionCard}>
          <Text style={styles.sectionTitle}>Active Question</Text>
          <Text style={styles.activeQuestionText}>"What resistance did you have to accepting this step?"</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  navHeader: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: { color: theme.colors.text.onPrimary, fontSize: theme.font.title, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    elevation: 2,
  },
  headerTitle: { fontSize: theme.font.h1, fontWeight: '800', color: theme.colors.text.primary },
  headerSub: { marginTop: 6, color: theme.colors.text.secondary },
  topGrid: { flexDirection: 'row', gap: 16 },
  moduleCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    elevation: 2,
  },
  moduleBody: {
    marginTop: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    minHeight: 200,
  },
  moduleText: { color: theme.colors.text.primary, lineHeight: 20 },
  participantsCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    elevation: 2,
  },
  participantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  participantChip: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
  },
  participantIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: { fontWeight: '700', color: theme.colors.text.primary },
  participantStatus: { color: '#64748b', fontSize: theme.font.small },
  participantStatusSpoke: { color: '#16a34a', fontWeight: '700' },
  sectionTitle: { color: '#4f46e5', fontWeight: '800', fontSize: theme.font.h3 },
  questionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    elevation: 2,
  },
  questionsList: { marginTop: 12, gap: 10 },
  questionRow: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  questionText: { color: theme.colors.text.primary, fontWeight: '600' },
  librarySection: { gap: 12 },
  libraryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  libraryCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    elevation: 1,
  },
  libraryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  libraryTitle: { fontWeight: '800', color: theme.colors.text.primary },
  libraryCount: { color: '#4f46e5', fontWeight: '700', fontSize: theme.font.small },
  libraryDetail: { color: theme.colors.text.secondary, fontSize: theme.font.small },
  activeQuestionCard: {
    backgroundColor: '#eef2ff',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  activeQuestionText: { marginTop: 8, color: theme.colors.text.primary, fontStyle: 'italic' },
});
