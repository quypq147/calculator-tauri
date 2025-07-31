import { invoke } from "@tauri-apps/api/core";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

const equationEl = document.querySelector("#equation")! as HTMLDivElement;
const resultEl = document.querySelector("#result")! as HTMLDivElement;
const historyEl = document.querySelector("#history")! as HTMLDivElement;
const history: string[] = [];

let currentInput = "0";
let currentEquation = "";

// Làm tròn kết quả với số chữ số thập phân tùy chỉnh
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

  // Tự thêm × nếu có số trước dấu (
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
    currentEquation = currentEquation.trim().replace(/[\+\-\×÷]$/, value) + " ";
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
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else if (currentInput.length === 1) {
        currentInput = "0";
      } else if (currentEquation.length > 0) {
        currentEquation = currentEquation.trim().slice(0, -1).trim();
      }
      break;

    case "=":
      const expression = (currentEquation + currentInput).trim();
      if (!expression) return;

      if (!isBracketsBalanced(expression)) {
        currentInput = "Lỗi ngoặc";
      } else {
        try {
          const finalExpr = expression.replace(/×/g, "*").replace(/÷/g, "/");
          const result = eval(finalExpr);
          const rounded = roundResult(result);
          currentInput = rounded.toString();
          history.length = 0;
          history.push(`${expression} = ${rounded}`);
        } catch (e) {
          console.error("Eval error", e);
          currentInput = "Lỗi tính toán";
        }
      }
      currentEquation = "";
      break;

    case "√":
      const numSqrt = parseFloat(currentInput);
      if (isNaN(numSqrt) || numSqrt < 0) {
        currentInput = "Lỗi";
      } else {
        const result = Math.sqrt(numSqrt);
        const rounded = roundResult(result);
        currentInput = rounded.toString();
        history.length = 0;
        history.push(`√(${numSqrt}) = ${rounded}`);
      }
      currentEquation = "";
      break;

    case "1/x":
      const numInv = parseFloat(currentInput);
      if (isNaN(numInv) || numInv === 0) {
        currentInput = "Lỗi";
      } else {
        const result = 1 / numInv;
        const rounded = roundResult(result);
        currentInput = rounded.toString();
        history.length = 0;
        history.push(`1/(${numInv}) = ${rounded}`);
      }
      currentEquation = "";
      break;

    case "+/-":
      if (currentInput.startsWith("-")) {
        currentInput = currentInput.slice(1);
      } else if (currentInput !== "0") {
        currentInput = "-" + currentInput;
      }
      break;

    case "%":
      const percent = parseFloat(currentInput);
      if (!isNaN(percent)) {
        const rounded = roundResult(percent / 100);
        currentInput = rounded.toString();
      }
      break;
  }

  updateDisplay();
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});

// Xử lý các nút
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.textContent?.trim() || "";

    if (button.classList.contains("btn-equals")) {
      handleAction("="); // ✅ xử lý dấu =
    } else if (button.classList.contains("btn-operator")) {
      handleOperator(value);
    } else if (button.classList.contains("btn-action")) {
      handleAction(value);
    } else {
      handleInput(value);
    }
  });
});





function greet() {
  throw new Error("Function not implemented.");
}

