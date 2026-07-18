<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,100:6366F1&height=180&section=header&text=Sci%20Calc&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=38" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-0EA5E9?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6366F1?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-0D9488?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

Scientific calculator. React on the frontend, Python doing the actual math on the backend.

---

### ⚙️ Stack

- React + Vite
- Python function on Vercel (`api/calculate.py`)
- No database — nothing to store

---

### 🔒 Why Python's back there

Didn't want to just `eval()` whatever the user types — that's a straight-up injection risk. Instead the expression gets parsed into a syntax tree (`ast` module) and only known-safe stuff gets evaluated: numbers, `+ - * / ^ %`, and a fixed list of functions (`sin`, `cos`, `sqrt`, `log`, etc). Anything else gets rejected before it runs.

---

### 📁 Structure

```
sci-calculator/
├── package.json
├── vite.config.js
├── index.html
├── api/
│   ├── calculate.py
│   └── requirements.txt
└── src/
    ├── main.jsx
    └── App.jsx
```

---

### ▶️ Running it

```bash
npm i -g vercel
vercel dev
```

`npm run dev` alone won't run the Python function — need `vercel dev` for that.

---

### 🚀 Deploy

Push to GitHub, import into Vercel, deploy. No env vars, no setup beyond that.

---

### ✅ Supports

`+ − × ÷ ^ %`, parentheses, `sin cos tan` + inverses with a deg/rad switch, `√ ln log n!`, `π e`, `1/x`.

No history, no memory buttons. Kept it simple on purpose.
