
import { safeEval, extractLastNumber, factorial } from "./math.js";
import { validate }                               from "./validation.js";
import { saveTheme, loadTheme, saveHistory, loadHistory, clearHistoryStorage } from "./storage.js";

class Calculator {

  constructor() {
    // ── State ──
    this.expression  = "";
    this.historyData = [];
    this.degMode     = true;   // true = DEG, false = RAD

    // ── DOM refs ──
    this.expressionDisplay = document.getElementById("expression");
    this.resultDisplay     = document.getElementById("result");
    this.historyList       = document.getElementById("history-list");
    this.darkToggle        = document.getElementById("darkModeToggle");
    this.deleteBtn         = document.getElementById("deleteHistory");
    this.btnStandard       = document.getElementById("offcanvas-standard");
    this.btnScientific     = document.getElementById("offcanvas-scienctific");

    // ── Boot ──
    this.loadTheme();
    this.loadHistory();
    this.showStandard();
    this.bindEvents();
  }

  // =============================================
  //  DISPLAY
  // =============================================

  updateExpression() {
    this.expressionDisplay.innerText = this.expression || "0";
  }

  updateResult(value) {
    this.resultDisplay.innerText = value;
  }

  showError(msg) {
    this.updateResult(msg);
    this.expression = "";
    this.updateExpression();
  }

  // =============================================
  //  THEME
  // =============================================

  loadTheme() {
    const saved = loadTheme();   // from storage.js
    if (saved === "dark") {
      document.body.classList.add("dark-mode");
      this.darkToggle.checked = true;
    }
  }

  toggleDarkMode(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    saveTheme(isDark);           // from storage.js
  }

  // =============================================
  //  HISTORY
  // =============================================

  loadHistory() {
    loadHistory().then((data) => {      // from storage.js
      this.historyData = data;
      this.renderHistory();
    });
  }

  addToHistory(input, output) {
    this.historyData.push({ input, output });
    saveHistory(this.historyData).then(() => {   // from storage.js
      this.renderHistory();
    });
  }

  clearHistory() {
    clearHistoryStorage().then(() => {           // from storage.js
      this.historyData = [];
      this.renderHistory();
    });
  }

  renderHistory() {
    this.historyList.innerHTML = "";
    for (let i = this.historyData.length - 1; i >= 0; i--) {
      const li = document.createElement("li");
      li.className = "mb-1";
      li.textContent = `${this.historyData[i].input} = ${this.historyData[i].output}`;
      this.historyList.appendChild(li);
    }
  }

  // =============================================
  //  CORE BUTTON HANDLER
  // =============================================

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
        const error = validate(this.expression);   // from validator.js
        if (error) { this.showError(error); break; }
        try {
          let res = safeEval(this.expression, this.degMode);  // from math.js
          if (res === "undefined" || isNaN(res)) { this.showError("Undefined"); break; }
          if (!isFinite(res))                    { this.showError("Cannot divide by zero"); break; }
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
        const lastNum = extractLastNumber(this.expression);  // from math.js
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
        this.expression += Math.PI;
        this.updateExpression();
        break;

      case "Math.E":
        this.expression += Math.E;
        this.updateExpression();
        break;

      case "Math.sqrt(": {
        const num = extractLastNumber(this.expression);   // from math.js
        if (num) {
          this.expression = this.expression.slice(0, -num.length);
          this.expression += `Math.sqrt(${num})`;
        } else {
          this.expression += "Math.sqrt(";
        }
        this.updateExpression();
        break;
      }

      case "1/x": {
        const num = extractLastNumber(this.expression);   // from math.js
        if (!num) break;
        if (parseFloat(num) === 0) { this.showError("Cannot divide by zero"); break; }
        this.expression = this.expression.slice(0, -num.length);
        this.expression += `(1/${num})`;
        this.updateExpression();
        break;
      }

      case "**2": {
        const num = extractLastNumber(this.expression);   // from math.js
        if (!num) break;
        this.expression = this.expression.slice(0, -num.length);
        this.expression += `(${num}**2)`;
        this.updateExpression();
        break;
      }

      case "**":
      case "2**":
      case "10**":
        this.expression += val;
        this.updateExpression();
        break;

      case "Math.log10(":
      case "Math.log(":
      case "Math.abs(":
      case "Math.exp(":
      case "Math.sin(":
      case "Math.cos(":
      case "Math.tan(":
      case "Math.asin(":
      case "Math.acos(":
      case "Math.atan(":
      case "Math.sec(":
      case "Math.cosec(":
      case "Math.cot(":
      case "Math.hyp(":
        this.expression += val;
        this.updateExpression();
        break;

      case "factorial": {
        const num = extractLastNumber(this.expression);   // from math.js
        if (!num) break;
        const n = parseInt(num);
        if (n < 0 || !Number.isInteger(n)) { this.showError("Invalid factorial"); break; }
        const fact = factorial(n);                        // from math.js
        this.expression = this.expression.slice(0, -num.length);
        this.expression += fact;
        this.updateExpression();
        break;
      }

      case "DEG":
        this.degMode = !this.degMode;
        document.querySelector(".deg-btn").textContent = this.degMode ? "DEG" : "RAD";
        break;

      default:
        this.expression += val;
        this.updateExpression();
        break;
    }
  }

  // =============================================
  //  MODE SWITCHING
  // =============================================

  showStandard() {
    document.getElementById("scientific-calc").classList.add("d-none");
    document.getElementById("scientific-deg").classList.add("d-none");
    document.getElementById("scientific-trigo").classList.add("d-none");
    document.getElementById("standard-calc").classList.remove("d-none");
  }

  showScientific() {
    document.getElementById("scientific-calc").classList.remove("d-none");
    document.getElementById("scientific-deg").classList.remove("d-none");
    document.getElementById("scientific-trigo").classList.remove("d-none");
    document.getElementById("standard-calc").classList.add("d-none");
  }

  closeOffcanvas() {
    const oc = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasExample"));
    if (oc) oc.hide();
  }

  // =============================================
  //  KEYBOARD
  // =============================================

  handleKeyboard(e) {
    const map = {
      "0":"0","1":"1","2":"2","3":"3","4":"4",
      "5":"5","6":"6","7":"7","8":"8","9":"9",
      "+":"+","-":"-","*":"*","/":"/",
      ".":".","(":"(",")":")","%" :"%",
      "Enter":"=","=":"=",
      "Backspace":"backspace","Escape":"C"
    };
    if (map[e.key]) this.handleButton(map[e.key]);
  }

  // =============================================
  //  BIND EVENTS
  // =============================================

  bindEvents() {
    // Event delegation — all calc buttons
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".calc-btn");
      if (!btn) return;
      this.handleButton(btn.dataset.value);
    });

    // Mode toggle
    this.btnStandard.addEventListener("click", () => {
      this.showStandard();
      this.closeOffcanvas();
    });

    this.btnScientific.addEventListener("click", () => {
      this.showScientific();
      this.closeOffcanvas();
    });

    // Dark mode
    this.darkToggle.addEventListener("change", () => {
      this.toggleDarkMode(this.darkToggle.checked);
    });

    // Delete history
    this.deleteBtn.addEventListener("click", () => {
      this.clearHistory();
    });

    // for Keyboard pressing
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));
  }
}

const calc = new Calculator();