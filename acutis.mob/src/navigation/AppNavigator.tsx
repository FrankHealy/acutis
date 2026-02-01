import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginHomeScreen,
  AdmissionFormScreen,
  RollCallScreen,
  GroupTherapyScreen,
  GroupTherapySessionScreen,
  RoomMapScreen,
  ResidentListScreen,
  ResidentDetailScreen
} from '../screens/tablet';

export type RootStackParamList = {
  Home: undefined;
  AdmissionForm: undefined;
  RollCall: undefined;
  GroupTherapy: undefined;
  GroupTherapySession: undefined;
  RoomMap: undefined;
  ResidentList: undefined;
  ResidentDetail: { residentId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={LoginHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdmissionForm" component={AdmissionFormScreen} options={{ title: 'Admission Form' }} />
        <Stack.Screen name="RollCall" component={RollCallScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GroupTherapy" component={GroupTherapyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GroupTherapySession" component={GroupTherapySessionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ResidentList" component={ResidentListScreen} options={{ title: 'Residents' }} />
        <Stack.Screen name="ResidentDetail" component={ResidentDetailScreen} options={{ title: 'Resident Details' }} />
       </Stack.Navigator>
    </NavigationContainer>
  );
}
