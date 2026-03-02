import { safeEval, extractLastNumber, factorial } from "./math.js";
import { validate } from "./validation.js";
import {
  saveTheme,
  loadTheme,
  saveHistory,
  loadHistory,
  clearHistoryStorage
} from "./storage.js";

declare const bootstrap: any;

interface HistoryItem {
  input: string;
  output: number;
}

class Calculator {

  private expression: string = "";
  private historyData: HistoryItem[] = [];
  private degMode: boolean = true;

  private expressionDisplay: HTMLElement;
  private resultDisplay: HTMLElement;
  private historyList: HTMLElement;
  private darkToggle: HTMLInputElement;
  private deleteBtn: HTMLElement;
  private btnStandard: HTMLElement;
  private btnScientific: HTMLElement;

  constructor() {

    this.expressionDisplay = this.getElement("expression");
    this.resultDisplay = this.getElement("result");
    this.historyList = this.getElement("history-list");
    this.darkToggle = this.getElement("darkModeToggle") as HTMLInputElement;
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
  private getElement(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element with id '${id}' not found`);
    return el;
  }

  // ================================
  // DISPLAY
  // ================================

  private updateExpression(): void {
    this.expressionDisplay.innerText = this.expression || "0";
  }

  private updateResult(value: number | string): void {
    this.resultDisplay.innerText = value.toString();
  }

  private showError(msg: string): void {
    this.updateResult(msg);
    this.expression = "";
    this.updateExpression();
  }

  // ================================
  // THEME
  // ================================

  private loadTheme(): void {
    const saved = loadTheme();
    if (saved === "dark") {
      document.body.classList.add("dark-mode");
      this.darkToggle.checked = true;
    }
  }

  private toggleDarkMode(isDark: boolean): void {
    document.body.classList.toggle("dark-mode", isDark);
    saveTheme(isDark);
  }

  // ================================
  // HISTORY
  // ================================

  private loadHistory(): void {
    loadHistory().then((data: HistoryItem[]) => {
      this.historyData = data;
      this.renderHistory();
    });
  }

  private addToHistory(input: string, output: number): void {
    this.historyData.push({ input, output });
    saveHistory(this.historyData).then(() => {
      this.renderHistory();
    });
  }

  private clearHistory(): void {
    clearHistoryStorage().then(() => {
      this.historyData = [];
      this.renderHistory();
    });
  }

  private renderHistory(): void {
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

  private handleButton(val: string): void {

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
          let res: number = safeEval(this.expression, this.degMode);

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

        } catch {
          this.showError("Error");
        }

        break;
      }

      case ".": {
        const lastNum: string = extractLastNumber(this.expression);
        if (lastNum.includes(".")) break;

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
        if (!num) break;

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
        const degBtn = document.querySelector(".deg-btn") as HTMLElement | null;
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

  private showStandard(): void {
    document.getElementById("scientific-calc")?.classList.add("d-none");
    document.getElementById("scientific-deg")?.classList.add("d-none");
    document.getElementById("scientific-trigo")?.classList.add("d-none");
    document.getElementById("standard-calc")?.classList.remove("d-none");
  }

  private showScientific(): void {
    document.getElementById("scientific-calc")?.classList.remove("d-none");
    document.getElementById("scientific-deg")?.classList.remove("d-none");
    document.getElementById("scientific-trigo")?.classList.remove("d-none");
    document.getElementById("standard-calc")?.classList.add("d-none");
  }

  private closeOffcanvas(): void {
    const element = document.getElementById("offcanvasExample");
    if (!element) return;

    const oc = bootstrap.Offcanvas.getInstance(element);
    if (oc) oc.hide();
  }

  // ================================
  // KEYBOARD
  // ================================

  private handleKeyboard(e: KeyboardEvent): void {

    const map: Record<string, string> = {
      "0":"0","1":"1","2":"2","3":"3","4":"4",
      "5":"5","6":"6","7":"7","8":"8","9":"9",
      "+":"+","-":"-","*":"*","/":"/",
      ".":".","(":"(",")":")","%":"%",
      "Enter":"=","=":"=",
      "Backspace":"backspace","Escape":"C"
    };

    if (map[e.key]) {
      this.handleButton(map[e.key]);
    }
  }

  // ================================
  // BIND EVENTS
  // ================================

  private bindEvents(): void {

    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(".calc-btn") as HTMLElement | null;

      if (!btn) return;

      const value = btn.dataset.value;
      if (!value) return;

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

    document.addEventListener("keydown", (e: KeyboardEvent) =>
      this.handleKeyboard(e)
    );
  }
}

new Calculator();