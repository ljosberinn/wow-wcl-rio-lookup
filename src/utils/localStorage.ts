const hasLocalStorage = (() => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem("foo", "foo");
    localStorage.getItem("foo");
    localStorage.removeItem("foo");
    return true;
  } catch {
    return false;
  }
})();

const key = "history";

type HistoryEntry = {
  name: string;
  realm: string;
  region: string;
};

export const addToStorageHistory = (newEntry: HistoryEntry): void => {
  if (!hasLocalStorage) {
    return;
  }

  const existingEntriesString = localStorage.getItem(key);

  if (existingEntriesString) {
    const existingEntries: HistoryEntry[] = JSON.parse(existingEntriesString);

    if (
      existingEntries.some(
        (entry) =>
          entry.name === newEntry.name &&
          entry.realm === newEntry.realm &&
          entry.region === newEntry.region
      )
    ) {
      return;
    }

    const nextEntries = [
      newEntry,
      ...(existingEntries.length === 10
        ? existingEntries.slice(-1)
        : existingEntries),
    ];

    localStorage.setItem(key, JSON.stringify(nextEntries));
  } else {
    localStorage.setItem(key, JSON.stringify([newEntry]));
  }
};

export const removeFromStorageHistory = (indexToRemove: number): void => {
  const existingEntriesString = localStorage.getItem(key);

  if (existingEntriesString) {
    const existingEntries: HistoryEntry[] = JSON.parse(existingEntriesString);
    const nextEntries = existingEntries.filter(
      (_, index) => index !== indexToRemove
    );

    localStorage.setItem(key, JSON.stringify(nextEntries));
  }
};

export const getHistory = (): HistoryEntry[] => {
  if (!hasLocalStorage) {
    return [];
  }

  const existingEntriesString = localStorage.getItem(key);

  if (existingEntriesString) {
    return JSON.parse(existingEntriesString);
  }

  return [];
};
