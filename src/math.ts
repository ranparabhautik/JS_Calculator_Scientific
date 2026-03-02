export function toRad(value: number, degMode: boolean): number {
    if (degMode) {
        return (value * Math.PI) / 180;
    }
    return value;
}


// this will converts radians to degrees if degMode is on
export function toDeg(value: number, degMode: boolean): number {
    if (degMode) {
        return (value * 180) / Math.PI;
    }
    return value;
}


// this function calculates factorial of a number like 5! is 120
export function factorial(n: number | string): number {
    n = parseInt(n as string);

    if (isNaN(n))  return NaN;
    if (n < 0)     return NaN;
    if (n === 0)   return 1;
    if (n === 1)   return 1;

    let result: number = 1;
    for (let i = 2; i <= n; i++) {
        result = result * i;
    }
    return result;
}


// this returns the last number typed in the expression
// like "12+56" returns "56"
export function extractLastNumber(expr: string): string {
    let num: string = "";

    for (let i = expr.length - 1; i >= 0; i--) {
        let ch: string = expr[i];
        if ("0123456789.".includes(ch)) {
            num = ch + num;
        } else {
            break;
        }
    }

    return num;
}


export function safeEval(expr: string, degMode: boolean): number {

    // for sin
    expr = expr.replace(/Math\.sin\(([^)]+)\)/g, function(match: string, x: string) {
        let trigo_val: number = toRad(eval(x) as number, degMode);
        return Math.sin(trigo_val).toString();
    });

    // for cos
    expr = expr.replace(/Math\.cos\(([^)]+)\)/g, function(match: string, x: string) {
        let trigo_val: number = toRad(eval(x) as number, degMode);
        return Math.cos(trigo_val).toString();
    });

    // for tan
    expr = expr.replace(/Math\.tan\(([^)]+)\)/g, function(match: string, x: string) {
        let trigo_val: number = toRad(eval(x) as number, degMode);
        if (Math.abs(Math.cos(trigo_val)) < 1e-10) {
            return "undefined";
        }
        return Math.tan(trigo_val).toString();
    });

    // for sin inverse
    expr = expr.replace(/Math\.asin\(([^)]+)\)/g, function(match: string, x: string) {
        let val: number = eval(x) as number;
        if (val < -1 || val > 1) return NaN.toString();
        return toDeg(Math.asin(val), degMode).toString();
    });

    // for cos inverse
    expr = expr.replace(/Math\.acos\(([^)]+)\)/g, function(match: string, x: string) {
        let val: number = eval(x) as number;
        if (val < -1 || val > 1) return NaN.toString();
        return toDeg(Math.acos(val), degMode).toString();
    });

    // for tan inverse
    expr = expr.replace(/Math\.atan\(([^)]+)\)/g, function(match: string, x: string) {
        return toDeg(Math.atan(eval(x) as number), degMode).toString();
    });

    // for sec
    expr = expr.replace(/Math\.sec\(([^)]+)\)/g, function(match: string, x: string) {
        let trigo_val: number = toRad(eval(x) as number, degMode);
        return (1 / Math.cos(trigo_val)).toString();
    });

    // for cossec
    expr = expr.replace(/Math\.cosec\(([^)]+)\)/g, function(match: string, x: string) {
        let trigo_val: number = toRad(eval(x) as number, degMode);
        return (1 / Math.sin(trigo_val)).toString();
    });

    // for cot 
    expr = expr.replace(/Math\.cot\(([^)]+)\)/g, function(match: string, x: string) {
        let trigo_val: number = toRad(eval(x) as number, degMode);
        return (1 / Math.tan(trigo_val)).toString();
    });

    // for hypothesis
    expr = expr.replace(/Math\.hyp\(([^)]+)\)/g, function(match: string, x: string) {
        let values: number[] = eval("[" + x + "]") as number[];
        return Math.hypot(...values).toString();
    });

    // for factorial
    expr = expr.replace(/factorial\(([^)]+)\)/g, function(match: string, n: string) {
        return factorial(eval(n) as number).toString();
    });

    return eval(expr) as number;
}