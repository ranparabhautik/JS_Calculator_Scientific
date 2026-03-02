export function saveTheme(isDark: boolean): void {
  localStorage.setItem("calc-theme", isDark ? "dark" : "light");
}

export function loadTheme(): string | null {
  return localStorage.getItem("calc-theme");
}

export function saveHistory(historyData: any[]): Promise<void> {
  return new Promise((resolve: () => void) => {
    localStorage.setItem("calc-history", JSON.stringify(historyData));
    resolve();
  });
}

export function loadHistory(): Promise<any[]> {
  return new Promise((resolve: (value: any[]) => void) => {
    const stored = localStorage.getItem("calc-history");
    resolve(stored ? JSON.parse(stored) : []);
  });
}

export function clearHistoryStorage(): Promise<void> {
  return new Promise((resolve: () => void) => {
    localStorage.removeItem("calc-history");
    resolve();
  });
}