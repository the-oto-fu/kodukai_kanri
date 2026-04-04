import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { db } from '../db/database';

export default function BudgetScreen() {
  const [income, setIncome] = useState('');
  const [resetDay, setResetDay] = useState('');
  const [fixedName, setFixedName] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');

  const load = () => {
    const budget = db.getFirstSync<any>('SELECT * FROM budget LIMIT 1');
    if (!budget) {
      return;
    }

    setIncome(String(budget.income));
  };

  useEffect(() => {
    load();
  }, []);

  const saveBudget = () => {
    db.runSync('DELETE FROM budget');
    db.runSync(
      'INSERT INTO budget (income, resetDay) VALUES (?, ?)',
      [Number(income), Number(resetDay)]
    );
  };

  const addFixed = () => {
    db.runSync(
      'INSERT INTO fixed_costs (name, amount) VALUES (?, ?)',
      [fixedName, Number(fixedAmount)]
    );
    setFixedName('');
    setFixedAmount('');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>収入</Text>
      <TextInput keyboardType='numeric' value={income} onChangeText={setIncome} />

      <Text>リセット日</Text>
      <TextInput value={resetDay} onChangeText={setResetDay} />

      <Button title="保存" onPress={saveBudget} />

      <Text>固定支出</Text>
      <TextInput placeholder="名前" value={fixedName} onChangeText={setFixedName} />
      <TextInput placeholder="金額" value={fixedAmount} onChangeText={setFixedAmount} />

      <Button title="追加" onPress={addFixed} />
    </View>
  );
}