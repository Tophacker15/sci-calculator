from http.server import BaseHTTPRequestHandler
import json
import math
import ast
import operator as op

ALLOWED_NAMES = {
    "pi": math.pi,
    "e": math.e,
}

ALLOWED_FUNCS = {
    "sin": math.sin, "cos": math.cos, "tan": math.tan,
    "asin": math.asin, "acos": math.acos, "atan": math.atan,
    "sqrt": math.sqrt, "log": math.log10, "ln": math.log,
    "exp": math.exp, "abs": abs, "factorial": math.factorial,
}

DEG_INPUT_FUNCS = {"sin", "cos", "tan"}
DEG_OUTPUT_FUNCS = {"asin", "acos", "atan"}

ALLOWED_BINOPS = {
    ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul,
    ast.Div: op.truediv, ast.Pow: op.pow, ast.Mod: op.mod,
}

ALLOWED_UNARYOPS = {
    ast.UAdd: op.pos, ast.USub: op.neg,
}

MAX_EXPR_LENGTH = 200

def _eval(node, angle_mode):
    if isinstance(node, ast.Expression):
        return _eval(node.body, angle_mode)

    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError("Invalid constant")

    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type not in ALLOWED_BINOPS:
            raise ValueError("Operator not allowed")
        left = _eval(node.left, angle_mode)
        right = _eval(node.right, angle_mode)
        return ALLOWED_BINOPS[op_type](left, right)

    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type not in ALLOWED_UNARYOPS:
            raise ValueError("Operator not allowed")
        return ALLOWED_UNARYOPS[op_type](_eval(node.operand, angle_mode))

    if isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name) or node.func.id not in ALLOWED_FUNCS:
            raise ValueError("Function not allowed")
        fname = node.func.id
        args = [_eval(a, angle_mode) for a in node.args]

        if fname in DEG_INPUT_FUNCS and angle_mode == "deg" and args:
            args[0] = math.radians(args[0])

        result = ALLOWED_FUNCS[fname](*args)

        if fname in DEG_OUTPUT_FUNCS and angle_mode == "deg":
            result = math.degrees(result)

        return result

    if isinstance(node, ast.Name):
        if node.id in ALLOWED_NAMES:
            return ALLOWED_NAMES[node.id]
        raise ValueError(f"Unknown name: {node.id}")

    raise ValueError("Expression contains something not allowed")

def safe_eval(expression, angle_mode="deg"):
    if len(expression) > MAX_EXPR_LENGTH:
        raise ValueError("Expression too long")
    tree = ast.parse(expression, mode="eval")
    return _eval(tree, angle_mode)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b"{}"
            body = json.loads(raw or b"{}")

            expression = str(body.get("expression", "")).strip()
            angle_mode = body.get("mode", "deg")

            if not expression:
                self._send(400, {"error": "No expression provided"})
                return

            cleaned = (
                expression.replace("^", "**")
                .replace("×", "*")
                .replace("÷", "/")
                .replace("−", "-")
            )

            result = safe_eval(cleaned, angle_mode)

            if isinstance(result, complex):
                self._send(400, {"error": "Result is not a real number"})
                return
            if isinstance(result, float) and (math.isnan(result) or math.isinf(result)):
                self._send(400, {"error": "Undefined result"})
                return

            self._send(200, {"result": result})

        except ZeroDivisionError:
            self._send(400, {"error": "Cannot divide by zero"})
        except (SyntaxError, ValueError, TypeError, OverflowError):
            self._send(400, {"error": "Invalid expression"})
        except Exception:
            self._send(500, {"error": "Something went wrong"})

    def _send(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
