export function toRad(value, degMode) {
    if (degMode) {
        return (value * Math.PI) / 180;
    }
    return value;
}
// this will converts radians to degrees if degMode is on
export function toDeg(value, degMode) {
    if (degMode) {
        return (value * 180) / Math.PI;
    }
    return value;
}
// this function calculates factorial of a number like 5! is 120
export function factorial(n) {
    n = parseInt(n);
    if (isNaN(n))
        return NaN;
    if (n < 0)
        return NaN;
    if (n === 0)
        return 1;
    if (n === 1)
        return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result = result * i;
    }
    return result;
}
// this returns the last number typed in the expression
// like "12+56" returns "56"
export function extractLastNumber(expr) {
    let num = "";
    for (let i = expr.length - 1; i >= 0; i--) {
        let ch = expr[i];
        if ("0123456789.".includes(ch)) {
            num = ch + num;
        }
        else {
            break;
        }
    }
    return num;
}
export function safeEval(expr, degMode) {
    // for sin
    expr = expr.replace(/Math\.sin\(([^)]+)\)/g, function (match, x) {
        let trigo_val = toRad(eval(x), degMode);
        return Math.sin(trigo_val).toString();
    });
    // for cos
    expr = expr.replace(/Math\.cos\(([^)]+)\)/g, function (match, x) {
        let trigo_val = toRad(eval(x), degMode);
        return Math.cos(trigo_val).toString();
    });
    // for tan
    expr = expr.replace(/Math\.tan\(([^)]+)\)/g, function (match, x) {
        let trigo_val = toRad(eval(x), degMode);
        if (Math.abs(Math.cos(trigo_val)) < 1e-10) {
            return "undefined";
        }
        return Math.tan(trigo_val).toString();
    });
    // for sin inverse
    expr = expr.replace(/Math\.asin\(([^)]+)\)/g, function (match, x) {
        let val = eval(x);
        if (val < -1 || val > 1)
            return NaN.toString();
        return toDeg(Math.asin(val), degMode).toString();
    });
    // for cos inverse
    expr = expr.replace(/Math\.acos\(([^)]+)\)/g, function (match, x) {
        let val = eval(x);
        if (val < -1 || val > 1)
            return NaN.toString();
        return toDeg(Math.acos(val), degMode).toString();
    });
    // for tan inverse
    expr = expr.replace(/Math\.atan\(([^)]+)\)/g, function (match, x) {
        return toDeg(Math.atan(eval(x)), degMode).toString();
    });
    // for sec
    expr = expr.replace(/Math\.sec\(([^)]+)\)/g, function (match, x) {
        let trigo_val = toRad(eval(x), degMode);
        return (1 / Math.cos(trigo_val)).toString();
    });
    // for cossec
    expr = expr.replace(/Math\.cosec\(([^)]+)\)/g, function (match, x) {
        let trigo_val = toRad(eval(x), degMode);
        return (1 / Math.sin(trigo_val)).toString();
    });
    // for cot 
    expr = expr.replace(/Math\.cot\(([^)]+)\)/g, function (match, x) {
        let trigo_val = toRad(eval(x), degMode);
        return (1 / Math.tan(trigo_val)).toString();
    });
    // for hypothesis
    expr = expr.replace(/Math\.hyp\(([^)]+)\)/g, function (match, x) {
        let values = eval("[" + x + "]");
        return Math.hypot(...values).toString();
    });
    // for factorial
    expr = expr.replace(/factorial\(([^)]+)\)/g, function (match, n) {
        return factorial(eval(n)).toString();
    });
    return eval(expr);
}
//# sourceMappingURL=math.js.map