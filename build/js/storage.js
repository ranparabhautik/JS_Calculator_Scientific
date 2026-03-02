export function saveTheme(isDark) {
    localStorage.setItem("calc-theme", isDark ? "dark" : "light");
}
export function loadTheme() {
    return localStorage.getItem("calc-theme");
}
export function saveHistory(historyData) {
    return new Promise((resolve) => {
        localStorage.setItem("calc-history", JSON.stringify(historyData));
        resolve();
    });
}
export function loadHistory() {
    return new Promise((resolve) => {
        const stored = localStorage.getItem("calc-history");
        resolve(stored ? JSON.parse(stored) : []);
    });
}
export function clearHistoryStorage() {
    return new Promise((resolve) => {
        localStorage.removeItem("calc-history");
        resolve();
    });
}
//# sourceMappingURL=storage.js.map