import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("kodukai.db");

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS INCOME (
      YEAR_MONTH TEXT PRIMARY KEY,
      INCOME_PRICE INTEGER
    );

    CREATE TABLE IF NOT EXISTS PAYMENTS (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      YEAR_MONTH TEXT,
      NAME TEXT,
      PRICE INTEGER,
      CREATED_AT TEXT DEFAULT (DATETIME('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS FIXED_COSTS (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      NAME TEXT,
      PRICE INTEGER
    );

    CREATE TABLE IF NOT EXISTS RESET_DAY (
      DAY INTEGER PRIMARY KEY
    );
  `);
};
