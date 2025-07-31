// === main.ts ===
import { evaluate } from "mathjs";

const equationEl = document.querySelector("#equation")! as HTMLDivElement;
const resultEl = document.querySelector("#result")! as HTMLDivElement;
const historyEl = document.querySelector("#history")! as HTMLDivElement;

const scientificPanel = document.getElementById("scientific-buttons")!;
const programmerPanel = document.getElementById("programmer-buttons")!;
const statisticPanel = document.getElementById("statistic-buttons")!;
const viewBtn = document.querySelector(".dropdown .btn-tool")!;
const viewMenu = document.getElementById("view-menu")!;

let currentInput = "0";
let currentEquation = "";
const history: string[] = [];

viewBtn.addEventListener("click", () => {
  viewMenu.classList.toggle("hidden");
});

// Chọn chế độ
document.querySelectorAll(".mode-option").forEach((item) => {
  item.addEventListener("click", () => {
    const mode = (item as HTMLElement).dataset.mode;

    // Ẩn menu sau khi chọn
    viewMenu.classList.add("hidden");

    // Ẩn tất cả các phần mở rộng
    scientificPanel.classList.add("hidden");
    programmerPanel.classList.add("hidden");
    statisticPanel.classList.add("hidden");

    // Hiện phần tương ứng với mode
    switch (mode) {
      case "scientific":
        scientificPanel.classList.remove("hidden");
        break;
      case "programmer":
        programmerPanel.classList.remove("hidden");
        break;
      case "statistic":
        statisticPanel.classList.remove("hidden");
        break;
      case "standard":
        // Không hiện gì thêm
        break;
    }
  });
});


function roundResult(value: number, digits = 10): number {
  return Math.round((value + Number.EPSILON) * 10 ** digits) / 10 ** digits;
}

function isBracketsBalanced(expr: string): boolean {
  let count = 0;
  for (const ch of expr) {
    if (ch === "(") count++;
    else if (ch === ")") count--;
    if (count < 0) return false;
  }
  return count === 0;
}

function updateDisplay() {
  equationEl.textContent = currentEquation;
  resultEl.textContent = currentInput;
  historyEl.innerHTML = history.length
    ? `<div>${history[history.length - 1]}</div>`
    : "";
}

function handleInput(value: string) {
  const lastChar = currentInput.slice(-1);
  if (value === "(" && /[0-9)]/.test(lastChar)) {
    currentInput += "×(";
  } else if (currentInput === "0" && value !== "." && value !== ")") {
    currentInput = value;
  } else {
    currentInput += value;
  }
  updateDisplay();
}

function handleOperator(value: string) {
  if (currentInput !== "") {
    currentEquation += currentInput + ` ${value} `;
    currentInput = "";
  } else if (currentEquation !== "") {
    currentEquation = currentEquation.trim().replace(/[-+×÷]$/, value) + " ";
  }
  updateDisplay();
}

function handleAction(value: string) {
  switch (value) {
    case "C":
      currentInput = "0";
      currentEquation = "";
      break;
    case "⌫":
      if (currentInput.length > 1) currentInput = currentInput.slice(0, -1);
      else if (currentEquation.length > 0)
        currentEquation = currentEquation.trim().slice(0, -1);
      else currentInput = "0";
      break;
    case "=":
      const expression = (currentEquation + currentInput).trim();
      if (!expression) return;
      if (!isBracketsBalanced(expression)) {
        currentInput = "Lỗi ngoặc";
      } else {
        try {
          const finalExpr = expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/π/g, "pi");
          const result = evaluate(finalExpr);
          const rounded = roundResult(result);
          currentInput = rounded.toString();
          history.length = 0;
          history.push(`${expression} = ${rounded}`);
        } catch (e) {
          currentInput = "Lỗi tính toán";
        }
      }
      currentEquation = "";
      break;
    case "√": {
      const num = parseFloat(currentInput);
      if (isNaN(num) || num < 0) currentInput = "Lỗi";
      else {
        const result = Math.sqrt(num);
        const rounded = roundResult(result);
        currentInput = rounded.toString();
        history.length = 0;
        history.push(`√(${num}) = ${rounded}`);
      }
      currentEquation = "";
      break;
    }
    case "1/x": {
      const num = parseFloat(currentInput);
      if (isNaN(num) || num === 0) currentInput = "Lỗi";
      else {
        const result = 1 / num;
        const rounded = roundResult(result);
        currentInput = rounded.toString();
        history.length = 0;
        history.push(`1/(${num}) = ${rounded}`);
      }
      currentEquation = "";
      break;
    }
    case "+/-":
      if (currentInput.startsWith("-")) currentInput = currentInput.slice(1);
      else if (currentInput !== "0") currentInput = "-" + currentInput;
      break;
    case "%": {
      const num = parseFloat(currentInput);
      if (!isNaN(num)) {
        const result = roundResult(num / 100);
        currentInput = result.toString();
      }
      break;
    }
  }
  updateDisplay();
}

function handleScientific(func: string) {
  try {
    let expr = currentInput;
    if (func === "π") expr = "pi";
    else if (func === "x^y") {
      currentInput += "^";
      updateDisplay();
      return;
    } else if (func === "e^x") expr = `e^(${currentInput})`;
    else expr = `${func}(${currentInput})`;

    const result = evaluate(expr);
    const rounded = roundResult(result);
    currentInput = rounded.toString();
    history.length = 0;
    history.push(`${expr} = ${rounded}`);
    currentEquation = "";
    updateDisplay();
  } catch (e) {
    currentInput = "Lỗi hàm";
    updateDisplay();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.textContent?.trim() || "";
      if (btn.classList.contains("btn-equals")) handleAction("=");
      else if (btn.classList.contains("btn-operator")) handleOperator(value);
      else if (btn.classList.contains("btn-action")) handleAction(value);
      else handleInput(value);
    });
  });

  document.querySelectorAll(".btn-scientific").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.textContent?.trim() || "";
      handleScientific(value);
    });
  });
});
