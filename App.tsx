import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { initDB } from './src/db/database';
import BudgetScreen from './src/screens/BudgetScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import TopScreen from './src/screens/TopScreen';

import { Appbar, Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<'top' | 'budget' | 'history'>('top');

  useEffect(() => {
    initDB();
    setReady(true);
  }, []);

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        
        {/* ヘッダー */}
        <Appbar.Header>
          <Appbar.Content title="お小遣い管理" />

          <Appbar.Action icon="home" onPress={() => setScreen('top')} />
          <Appbar.Action icon="cash" onPress={() => setScreen('budget')} />
          <Appbar.Action icon="history" onPress={() => setScreen('history')} />
        </Appbar.Header>

        {/* 画面 */}
        <View style={{ flex: 1 }}>
          {screen === 'top' && <TopScreen />}
          {screen === 'budget' && <BudgetScreen />}
          {screen === 'history' && <HistoryScreen />}
        </View>

      </View>
    </PaperProvider>
  );
}