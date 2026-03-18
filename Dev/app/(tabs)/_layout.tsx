import { Tabs } from 'expo-router';
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

const c = Colors.dark;

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    'Whale Feed': '&#x1F30A;',
    'Wallets': '&#x1F4B3;',
    'Markets': '&#x1F4CA;',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {label === 'Whale Feed' ? '\u{1F30A}' : label === 'Wallets' ? '\u{1F4B3}' : '\u{1F4CA}'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.tabIconDefault,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Whale Feed',
          tabBarIcon: ({ focused }) => <TabIcon label="Whale Feed" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: 'Wallets',
          tabBarIcon: ({ focused }) => <TabIcon label="Wallets" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ focused }) => <TabIcon label="Markets" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
