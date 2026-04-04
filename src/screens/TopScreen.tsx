import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { db } from '../db/database';

export default function TopScreen() {
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState('');

  const load = () => {
    const budget = db.getFirstSync<any>('SELECT * FROM budget LIMIT 1');
    if (!budget) {
      setBalance(0);
      return;
    }

    const expenses = db.getAllSync<any>('SELECT * FROM expenses');
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const fixed = db.getAllSync<any>('SELECT * FROM fixed_costs');
    const totalFixed = fixed.reduce((sum, f) => sum + f.amount, 0);

    setBalance(budget.income - totalExpense - totalFixed);
  };

  useEffect(() => {
    load();
  }, []);

  const addExpense = () => {
    db.runSync(
      'INSERT INTO expenses (amount, createdAt) VALUES (?, ?)',
      [Number(amount), new Date().toISOString()]
    );
    setAmount('');
    load();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>残高: {balance} 円</Text>

      <TextInput
        placeholder="使用金額"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Button title="追加" onPress={addExpense} />

      {balance === 0 && <Text>予算が設定されていません</Text>}
    </View>
  );
}