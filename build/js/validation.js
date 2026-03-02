export function validate(expr) {
    if (!expr || expr.trim() === "")
        return "Nothing to evaluate";
    if (/\/0(?![.\d])/.test(expr))
        return "Cannot divide by zero";
    let noPower = expr.replace(/\*\*/g, "");
    if (/[+\-*/]{2,}/.test(noPower))
        return "Invalid operator sequence";
    if (/^[+*/]/.test(expr))
        return "Expression cannot start with an operator";
    if (/[+\-*/.]$/.test(expr))
        return "Incomplete expression";
    if ((expr.match(/\(/g) || []).length !== (expr.match(/\)/g) || []).length)
        return "Mismatched parentheses";
    const parts = expr.split(/[+\-*/]/);
    for (const part of parts) {
        if ((part.match(/\./g) || []).length > 1)
            return "Invalid decimal number";
    }
    return null;
}
//# sourceMappingURL=validation.js.map