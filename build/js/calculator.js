import { safeEval, extractLastNumber, factorial } from "./math.js";
import { validate } from "./validation.js";
import { saveTheme, loadTheme, saveHistory, loadHistory, clearHistoryStorage } from "./storage.js";
class Calculator {
    constructor() {
        this.expression = "";
        this.historyData = [];
        this.degMode = true;
        this.expressionDisplay = this.getElement("expression");
        this.resultDisplay = this.getElement("result");
        this.historyList = this.getElement("history-list");
        this.darkToggle = this.getElement("darkModeToggle");
        this.deleteBtn = this.getElement("deleteHistory");
        this.btnStandard = this.getElement("offcanvas-standard");
        this.btnScientific = this.getElement("offcanvas-scientific");
        this.loadTheme();
        this.loadHistory();
        this.showStandard();
        this.bindEvents();
    }
    // ================================
    // Utility (Null Safe DOM Getter)
    // ================================
    getElement(id) {
        const el = document.getElementById(id);
        if (!el)
            throw new Error(`Element with id '${id}' not found`);
        return el;
    }
    // ================================
    // DISPLAY
    // ================================
    updateExpression() {
        this.expressionDisplay.innerText = this.expression || "0";
    }
    updateResult(value) {
        this.resultDisplay.innerText = value.toString();
    }
    showError(msg) {
        this.updateResult(msg);
        this.expression = "";
        this.updateExpression();
    }
    // ================================
    // THEME
    // ================================
    loadTheme() {
        const saved = loadTheme();
        if (saved === "dark") {
            document.body.classList.add("dark-mode");
            this.darkToggle.checked = true;
        }
    }
    toggleDarkMode(isDark) {
        document.body.classList.toggle("dark-mode", isDark);
        saveTheme(isDark);
    }
    // ================================
    // HISTORY
    // ================================
    loadHistory() {
        loadHistory().then((data) => {
            this.historyData = data;
            this.renderHistory();
        });
    }
    addToHistory(input, output) {
        this.historyData.push({ input, output });
        saveHistory(this.historyData).then(() => {
            this.renderHistory();
        });
    }
    clearHistory() {
        clearHistoryStorage().then(() => {
            this.historyData = [];
            this.renderHistory();
        });
    }
    renderHistory() {
        this.historyList.innerHTML = "";
        for (let i = this.historyData.length - 1; i >= 0; i--) {
            const li = document.createElement("li");
            li.className = "mb-1";
            li.textContent =
                `${this.historyData[i].input} = ${this.historyData[i].output}`;
            this.historyList.appendChild(li);
        }
    }
    // ================================
    // CORE BUTTON HANDLER
    // ================================
    handleButton(val) {
        switch (val) {
            case "C":
                this.expression = "";
                this.updateExpression();
                this.updateResult(0);
                break;
            case "backspace":
                this.expression = this.expression.slice(0, -1);
                this.updateExpression();
                break;
            case "=": {
                const error = validate(this.expression);
                if (error) {
                    this.showError(error);
                    break;
                }
                try {
                    let res = safeEval(this.expression, this.degMode);
                    if (isNaN(res)) {
                        this.showError("Undefined");
                        break;
                    }
                    if (!isFinite(res)) {
                        this.showError("Cannot divide by zero");
                        break;
                    }
                    res = parseFloat(res.toFixed(10));
                    this.addToHistory(this.expression, res);
                    this.updateResult(res);
                    this.expression = res.toString();
                    this.updateExpression();
                }
                catch (_a) {
                    this.showError("Error");
                }
                break;
            }
            case ".": {
                const lastNum = extractLastNumber(this.expression);
                if (lastNum.includes("."))
                    break;
                this.expression += ".";
                this.updateExpression();
                break;
            }
            case "+":
            case "-":
            case "*":
            case "/":
            case "%":
                if (/[+\-*/]$/.test(this.expression)) {
                    this.expression = this.expression.slice(0, -1);
                }
                this.expression += val;
                this.updateExpression();
                break;
            case "(":
            case ")":
                this.expression += val;
                this.updateExpression();
                break;
            case "Math.PI":
                this.expression += Math.PI.toString();
                this.updateExpression();
                break;
            case "Math.E":
                this.expression += Math.E.toString();
                this.updateExpression();
                break;
            case "factorial": {
                const num = extractLastNumber(this.expression);
                if (!num)
                    break;
                const n = parseInt(num);
                if (n < 0 || !Number.isInteger(n)) {
                    this.showError("Invalid factorial");
                    break;
                }
                const fact = factorial(n);
                this.expression = this.expression.slice(0, -num.length);
                this.expression += fact.toString();
                this.updateExpression();
                break;
            }
            case "DEG":
                this.degMode = !this.degMode;
                const degBtn = document.querySelector(".deg-btn");
                if (degBtn) {
                    degBtn.textContent = this.degMode ? "DEG" : "RAD";
                }
                break;
            default:
                this.expression += val;
                this.updateExpression();
                break;
        }
    }
    // ================================
    // MODE SWITCHING
    // ================================
    showStandard() {
        var _a, _b, _c, _d;
        (_a = document.getElementById("scientific-calc")) === null || _a === void 0 ? void 0 : _a.classList.add("d-none");
        (_b = document.getElementById("scientific-deg")) === null || _b === void 0 ? void 0 : _b.classList.add("d-none");
        (_c = document.getElementById("scientific-trigo")) === null || _c === void 0 ? void 0 : _c.classList.add("d-none");
        (_d = document.getElementById("standard-calc")) === null || _d === void 0 ? void 0 : _d.classList.remove("d-none");
    }
    showScientific() {
        var _a, _b, _c, _d;
        (_a = document.getElementById("scientific-calc")) === null || _a === void 0 ? void 0 : _a.classList.remove("d-none");
        (_b = document.getElementById("scientific-deg")) === null || _b === void 0 ? void 0 : _b.classList.remove("d-none");
        (_c = document.getElementById("scientific-trigo")) === null || _c === void 0 ? void 0 : _c.classList.remove("d-none");
        (_d = document.getElementById("standard-calc")) === null || _d === void 0 ? void 0 : _d.classList.add("d-none");
    }
    closeOffcanvas() {
        const element = document.getElementById("offcanvasExample");
        if (!element)
            return;
        const oc = bootstrap.Offcanvas.getInstance(element);
        if (oc)
            oc.hide();
    }
    // ================================
    // KEYBOARD
    // ================================
    handleKeyboard(e) {
        const map = {
            "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
            "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
            "+": "+", "-": "-", "*": "*", "/": "/",
            ".": ".", "(": "(", ")": ")", "%": "%",
            "Enter": "=", "=": "=",
            "Backspace": "backspace", "Escape": "C"
        };
        if (map[e.key]) {
            this.handleButton(map[e.key]);
        }
    }
    // ================================
    // BIND EVENTS
    // ================================
    bindEvents() {
        document.addEventListener("click", (e) => {
            const target = e.target;
            const btn = target.closest(".calc-btn");
            if (!btn)
                return;
            const value = btn.dataset.value;
            if (!value)
                return;
            this.handleButton(value);
        });
        this.btnStandard.addEventListener("click", () => {
            this.showStandard();
            this.closeOffcanvas();
        });
        this.btnScientific.addEventListener("click", () => {
            this.showScientific();
            this.closeOffcanvas();
        });
        this.darkToggle.addEventListener("change", () => {
            this.toggleDarkMode(this.darkToggle.checked);
        });
        this.deleteBtn.addEventListener("click", () => {
            this.clearHistory();
        });
        document.addEventListener("keydown", (e) => this.handleKeyboard(e));
    }
}
new Calculator();
//# sourceMappingURL=calculator.js.map