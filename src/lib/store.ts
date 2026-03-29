// Simple localStorage wrapper — drop-in replaceable with Supabase/API calls

function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`campusync_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(`campusync_${key}`, JSON.stringify(value));
}

export const store = {
  get: getItem,
  set: setItem,
};
