import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { db } from '../db/database';

export default function HistoryScreen() {
  const [data, setData] = useState<any[]>([]);

  const load = () => {
    const expenses = db.getAllSync<any>('SELECT * FROM expenses');
    setData(expenses);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = (id: number) => {
    db.runSync('DELETE FROM expenses WHERE id=?', [id]);
    load();
  };

  const exportFile = async () => {
    const fileUri = FileSystem.Paths.document + 'expenses.json';
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
    await Sharing.shareAsync(fileUri);
  };

  const importFile = async () => {
    const fileUri = FileSystem.Paths.document + 'expenses.json';
    const content = await FileSystem.readAsStringAsync(fileUri);
    const json = JSON.parse(content);

    json.forEach((e: any) => {
      db.runSync(
        'INSERT INTO expenses (amount, createdAt) VALUES (?, ?)',
        [e.amount, e.createdAt]
      );
    });

    load();
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="エクスポート" onPress={exportFile} />
      <Button title="インポート" onPress={importFile} />

      <ScrollView>
        {data.map((item) => (
          <View key={item.id}>
            <Text>{item.amount}円</Text>
            <Button title="削除" onPress={() => remove(item.id)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}