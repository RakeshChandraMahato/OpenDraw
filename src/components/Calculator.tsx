import { useState, useEffect, useRef } from "react";
import "./Calculator.scss";

interface CalculatorProps {
  onClose: () => void;
}

export const Calculator = ({ onClose }: CalculatorProps) => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [isScientific, setIsScientific] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("calculator-position");
    return saved ? JSON.parse(saved) : { x: 100, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("calculator-position", JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".calculator-header")) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay("0.");
      setNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handlePlusMinus = () => {
    const current = parseFloat(display);
    setDisplay(String(current * -1));
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
      setNewNumber(true);
    }
  };

  const handleScientific = (func: string) => {
    const current = parseFloat(display);
    let result = 0;
    
    switch (func) {
      case "sin":
        result = Math.sin(current * Math.PI / 180);
        break;
      case "cos":
        result = Math.cos(current * Math.PI / 180);
        break;
      case "tan":
        result = Math.tan(current * Math.PI / 180);
        break;
      case "ln":
        result = Math.log(current);
        break;
      case "log":
        result = Math.log10(current);
        break;
      case "sqrt":
        result = Math.sqrt(current);
        break;
      case "x²":
        result = current * current;
        break;
      case "x³":
        result = current * current * current;
        break;
      case "1/x":
        result = 1 / current;
        break;
      case "e":
        result = Math.E;
        break;
      case "π":
        result = Math.PI;
        break;
      case "!":
        result = factorial(current);
        break;
      default:
        result = current;
    }
    
    setDisplay(String(result));
    setNewNumber(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  return (
    <div 
      ref={calculatorRef}
      className={`calculator-container ${isScientific ? "scientific" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="calculator-header" style={{ cursor: "grab" }}>
        <button 
          className="calc-mode-toggle" 
          onClick={() => setIsScientific(!isScientific)}
          title={isScientific ? "Basic Mode" : "Scientific Mode"}
        >
          {isScientific ? "123" : "ƒ(x)"}
        </button>
      </div>
      <div className="calculator-display">
        <div className="calculator-expression">{previousValue !== null && operation ? `${previousValue} ${operation}` : ""}</div>
        <div className="calculator-result">{display}</div>
      </div>
      <div className="calculator-buttons">
        {isScientific && (
          <>
            <button onClick={() => handleScientific("sin")} className="calc-btn calc-btn-scientific">sin</button>
            <button onClick={() => handleScientific("cos")} className="calc-btn calc-btn-scientific">cos</button>
            <button onClick={() => handleScientific("tan")} className="calc-btn calc-btn-scientific">tan</button>
            <button onClick={() => handleScientific("ln")} className="calc-btn calc-btn-scientific">ln</button>
            
            <button onClick={() => handleScientific("log")} className="calc-btn calc-btn-scientific">log</button>
            <button onClick={() => handleScientific("sqrt")} className="calc-btn calc-btn-scientific">√</button>
            <button onClick={() => handleScientific("x²")} className="calc-btn calc-btn-scientific">x²</button>
            <button onClick={() => handleScientific("x³")} className="calc-btn calc-btn-scientific">x³</button>
            
            <button onClick={() => handleScientific("1/x")} className="calc-btn calc-btn-scientific">1/x</button>
            <button onClick={() => handleScientific("e")} className="calc-btn calc-btn-scientific">e</button>
            <button onClick={() => handleScientific("π")} className="calc-btn calc-btn-scientific">π</button>
            <button onClick={() => handleScientific("!")} className="calc-btn calc-btn-scientific">n!</button>
          </>
        )}
        
        <button onClick={handleClear} className="calc-btn calc-btn-function">AC</button>
        <button onClick={handlePlusMinus} className="calc-btn calc-btn-function">⁺⁄₋</button>
        <button onClick={handlePercent} className="calc-btn calc-btn-function">%</button>
        <button onClick={() => handleOperation("÷")} className="calc-btn calc-btn-operator">÷</button>
        
        <button onClick={() => handleNumber("7")} className="calc-btn">7</button>
        <button onClick={() => handleNumber("8")} className="calc-btn">8</button>
        <button onClick={() => handleNumber("9")} className="calc-btn">9</button>
        <button onClick={() => handleOperation("×")} className="calc-btn calc-btn-operator">×</button>
        
        <button onClick={() => handleNumber("4")} className="calc-btn">4</button>
        <button onClick={() => handleNumber("5")} className="calc-btn">5</button>
        <button onClick={() => handleNumber("6")} className="calc-btn">6</button>
        <button onClick={() => handleOperation("-")} className="calc-btn calc-btn-operator">−</button>
        
        <button onClick={() => handleNumber("1")} className="calc-btn">1</button>
        <button onClick={() => handleNumber("2")} className="calc-btn">2</button>
        <button onClick={() => handleNumber("3")} className="calc-btn">3</button>
        <button onClick={() => handleOperation("+")} className="calc-btn calc-btn-operator">+</button>
        
        <button onClick={handleBackspace} className="calc-btn calc-btn-undo">↶</button>
        <button onClick={() => handleNumber("0")} className="calc-btn">0</button>
        <button onClick={handleDecimal} className="calc-btn">.</button>
        <button onClick={handleEquals} className="calc-btn calc-btn-equals">=</button>
      </div>
    </div>
  );
};
