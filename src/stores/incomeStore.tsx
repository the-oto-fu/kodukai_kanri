import { create } from "zustand";

type CounterState = {
  incomePrice: number;
  setIncomePrice: (value: number) => void;
};

export const useCounterStore = create<CounterState>((set) => ({
  incomePrice: 0,
  setIncomePrice: (value) => set({ incomePrice: value }),
}));
