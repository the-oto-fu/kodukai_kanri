export type Expense = {
  id?: number;
  amount: number;
  createdAt: string;
};

export type FixedCost = {
  id?: number;
  name: string;
  amount: number;
};

export type Budget = {
  id?: number;
  income: number;
  resetDay: number;
};