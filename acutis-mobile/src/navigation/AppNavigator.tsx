import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginHomeScreen, AdmissionFormScreen, RollCallScreen, GroupTherapyScreen, RoomMapScreen } from '../screens/tablet';

export type RootStackParamList = {
  Home: undefined;
  AdmissionForm: undefined;
  RollCall: undefined;
  GroupTherapy: undefined;
  RoomMap: undefined;
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
        <Stack.Screen name="RoomMap" component={RoomMapScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
