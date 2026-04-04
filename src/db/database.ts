import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('kodukai.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS budget (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      income INTEGER,
      resetDay INTEGER
    );

    CREATE TABLE IF NOT EXISTS fixed_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      amount INTEGER
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER,
      createdAt TEXT
    );
  `);
};