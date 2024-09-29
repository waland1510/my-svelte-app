// store.ts
import { writable } from 'svelte/store';

export const recordsStore = writable<Record[]>([]);

export type Record = {
  type: 'multiplication' | 'division';
  time: number;
  incorrectAttempts: number;
  date: string;
};

// Function to load records from localStorage and initialize the store
export const loadRecords = () => {
  const multiplicationRecords: Record[] = JSON.parse(
    localStorage.getItem('multiplicationQuizRecords') || '[]'
  );
  const divisionRecords: Record[] = JSON.parse(
    localStorage.getItem('divisionQuizRecords') || '[]'
  );
  const allRecords = [...multiplicationRecords, ...divisionRecords];
  allRecords.sort((a, b) => a.time - b.time);
  recordsStore.set(allRecords);
};

// Function to add a new record and update the store
export const addRecord = (newRecord: Record) => {
  recordsStore.update(records => {
    const updatedRecords = [...records, newRecord];
    updatedRecords.sort((a, b) => a.time - b.time);
    return updatedRecords;
  });
};
