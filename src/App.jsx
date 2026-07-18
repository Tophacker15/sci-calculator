import { useState } from "react";

const STYLES = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#0C0C0C;font-family:'Kanit',sans-serif;color:#D7E2EA;min-height:100vh}
.wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1rem;position:relative;overflow:hidden}
.wrap::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(700px 450px at 80% 10%,rgba(14,165,233,.14),transparent 60%),radial-gradient(600px 450px at 10% 90%,rgba(118,33,176,.12),transparent 55%)}
.brand{position:relative;z-index:1;display:flex;align-items:center;gap:.5rem;font-weight:800;letter-spacing:.04em;margin-bottom:1.6rem;font-size:.9rem}
.brand .mark{width:11px;height:11px;border:2px solid #0EA5E9;border-radius:3px;transform:rotate(45deg)}
.mg{background:linear-gradient(95deg,#0EA5E9 0%,#6366F1 60%,#0D9488 120%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

.calc{position:relative;z-index:1;width:100%;max-width:400px;background:rgba(255,255,255,.03);border:1px solid rgba(215,226,234,.13);
  border-radius:24px;padding:1.4rem;backdrop-filter:blur(6px)}

.top-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:.9rem}
.mode-toggle{display:flex;background:rgba(255,255,255,.05);border-radius:9999px;padding:3px;gap:2px}
.mode-toggle button{background:none;border:none;color:#D7E2EA;opacity:.5;font-family:inherit;font-size:.68rem;font-weight:600;
  text-transform:uppercase;letter-spacing:.05em;padding:.35rem .8rem;border-radius:9999px;cursor:pointer;transition:all .2s}
.mode-toggle button.active{opacity:1;background:linear-gradient(95deg,#0EA5E9,#6366F1);color:#fff}

.display{background:rgba(0,0,0,.3);border:1px solid rgba(215,226,234,.1);border-radius:14px;padding:1rem 1.1rem;margin-bottom:1rem;text-align:right;min-height:88px;display:flex;flex-direction:column;justify-content:flex-end;gap:.3rem}
.expr{font-family:'Courier Prime',monospace;font-size:1rem;opacity:.55;word-break:break-all;min-height:1.2em}
.result{font-family:'Courier Prime',monospace;font-size:clamp(1.6rem,7vw,2.1rem);font-weight:600;word-break:break-all;color:#fff}
.result.error{color:#e0685c;font-size:1rem;font-weight:400}

.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.45rem}
.btn{background:rgba(255,255,255,.05);border:1px solid rgba(215,226,234,.1);color:#D7E2EA;font-family:inherit;font-size:.85rem;
  font-weight:500;border-radius:10px;padding:.7rem 0;cursor:pointer;transition:background .15s,transform .1s}
.btn:active{transform:scale(.94)}
.btn:hover{background:rgba(255,255,255,.1)}
.btn.op{color:#93C5FD}
.btn.fn{font-size:.72rem;color:#5EEAD4}
.btn.clear{color:#e0685c}
.btn.equals{grid-column:span 2;background:linear-gradient(123deg,#0B1120 7%,#0EA5E9 37%,#6366F1 72%,#0D9488 100%);
  color:#fff;font-weight:700;border:none;box-shadow:0 4px 14px rgba(14,165,233,.28)}
.btn.equals:hover{transform:translateY(-1px)}
.btn.wide{grid-column:span 2}

footer{position:relative;z-index:1;margin-top:1.6rem;font-size:.72rem;opacity:.3;text-align:center}
`;

const BUTTONS = [
  { label: "AC", type: "clear" },
  { label: "DEL", type: "del" },
  { label: "(", type: "insert", value: "(" },
  { label: ")", type: "insert", value: ")" },
  { label: "%", type: "insert", value: "%", cls: "op" },

  { label: "sin", type: "func", value: "sin(", cls: "fn" },
  { label: "cos", type: "func", value: "cos(", cls: "fn" },
  { label: "tan", type: "func", value: "tan(", cls: "fn" },
  { label: "√", type: "func", value: "sqrt(", cls: "fn" },
  { label: "^", type: "insert", value: "^", cls: "op" },

  { label: "ln", type: "func", value: "ln(", cls: "fn" },
  { label: "log", type: "func", value: "log(", cls: "fn" },
  { label: "π", type: "insert", value: "pi", cls: "fn" },
  { label: "e", type: "insert", value: "e", cls: "fn" },
  { label: "÷", type: "insert", value: "/", cls: "op" },

  { label: "7", type: "insert", value: "7" },
  { label: "8", type: "insert", value: "8" },
  { label: "9", type: "insert", value: "9" },
  { label: "n!", type: "func", value: "factorial(", cls: "fn" },
  { label: "×", type: "insert", value: "*", cls: "op" },

  { label: "4", type: "insert", value: "4" },
  { label: "5", type: "insert", value: "5" },
  { label: "6", type: "insert", value: "6" },
  { label: "1/x", type: "wrap-inv", cls: "fn" },
  { label: "−", type: "insert", value: "-", cls: "op" },

  { label: "1", type: "insert", value: "1" },
  { label: "2", type: "insert", value: "2" },
  { label: "3", type: "insert", value: "3" },
  { label: "+", type: "insert", value: "+", cls: "op", wide: false },

  { label: "0", type: "insert", value: "0", wide: true },
  { label: ".", type: "insert", value: "." },
  { label: "=", type: "equals" },
];

export default function App() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("deg");
  const [loading, setLoading] = useState(false);

  function insert(value) {
    setError("");
    setExpr((e) => {
      if (!e) return value;
      const prevChar = e[e.length - 1];
      const prevEndsOperand = /[\d).!]/.test(prevChar) || e.endsWith("pi") || prevChar === "e";
      const nextStartsNewOperand = value === "(" || value === "pi" || value === "e" || /^[a-z]+\($/.test(value);
      const nextIsDigitOrDot = /^[\d.]$/.test(value);
      const isDigitContinuation = nextIsDigitOrDot && /[\d.]/.test(prevChar);
      const needsMult = prevEndsOperand && !isDigitContinuation && (nextStartsNewOperand || nextIsDigitOrDot);
      return needsMult ? e + "*" + value : e + value;
    });
  }

  function handleClear() {
    setExpr("");
    setResult("");
    setError("");
  }

  function handleDel() {
    setExpr((e) => e.slice(0, -1));
    setError("");
  }

  function handleInvert() {
    if (!expr) return;
    setExpr((e) => `1/(${e})`);
  }

  async function handleEquals() {
    if (!expr.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expr, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid expression");
        setResult("");
      } else {
        setResult(String(data.result));
      }
    } catch {
      setError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  function handleButton(btn) {
    if (btn.type === "clear") return handleClear();
    if (btn.type === "del") return handleDel();
    if (btn.type === "equals") return handleEquals();
    if (btn.type === "wrap-inv") return handleInvert();
    if (btn.type === "insert" || btn.type === "func") return insert(btn.value);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="wrap">
        <div className="brand"><span className="mark"></span>TOPBOY&nbsp;<span className="mg">CALC</span></div>

        <div className="calc">
          <div className="top-row">
            <div className="mode-toggle">
              <button className={mode === "deg" ? "active" : ""} onClick={() => setMode("deg")}>Deg</button>
              <button className={mode === "rad" ? "active" : ""} onClick={() => setMode("rad")}>Rad</button>
            </div>
          </div>

          <div className="display">
            <div className="expr">{expr || "0"}</div>
            {error ? (
              <div className="result error">{error}</div>
            ) : (
              <div className="result">{loading ? "..." : (result || "")}</div>
            )}
          </div>

          <div className="grid">
            {BUTTONS.map((btn, i) => (
              <button
                key={i}
                className={`btn ${btn.cls || ""} ${btn.type === "clear" ? "clear" : ""} ${btn.type === "equals" ? "equals" : ""} ${btn.wide ? "wide" : ""}`}
                onClick={() => handleButton(btn)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <footer>Powered by Topboy Innovation</footer>
      </div>
    </>
  );
}
