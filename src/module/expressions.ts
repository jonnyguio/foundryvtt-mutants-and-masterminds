enum TokenType {
    OPERATOR,
    REFERENCE,
    LITERAL,
}

interface TokenInfo {
    token: string;
    type: TokenType;
}

export const evaluateExpression = (data: any, expression: Expression): string | number => {
    const tokens = getTokens(expression.formula);
    const valueStack: (number | string)[] = [];
    const operatorStack: string[] = [];
    tokens.forEach(token => {
        switch (token.type) {
            case TokenType.LITERAL:
                let value: string | number = trimSurroundingQuotes(token.token);
                if (isNumeric(value)) {
                    value = parseFloat(value);
                }
                valueStack.push(value);
                break;
            case TokenType.REFERENCE:
                valueStack.push(getProperty(data, token.token));
                break;
            case TokenType.OPERATOR:
                switch (token.token) {
                    case '(':
                        operatorStack.push(token.token);
                        break;
                    case ')':
                        while (operatorStack[operatorStack.length - 1] != '(') {
                            const op = operatorStack.pop();
                            const first = valueStack.pop();
                            const second = valueStack.pop();
                            valueStack.push(evaluateOperator(first, second, op));
                        }
                        operatorStack.pop();
                        break;
                    default:
                        while (operatorStack.length > 0 &&
                            getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token.token)) {
                            const op = operatorStack.pop();
                            const first = valueStack.pop();
                            const second = valueStack.pop();
                            valueStack.push(evaluateOperator(first, second, op));
                        }
                        operatorStack.push(token.token);
                        break;
                }
        }
    });

    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        const first = valueStack.pop();
        const second = valueStack.pop();
        valueStack.push(evaluateOperator(first, second, op));
    }

    if (valueStack.length > 1) {
        throw new Error(`valueStack has multiple values: ${valueStack}`);
    }

    return valueStack[0];
};

const getPrecedence = (op: string | undefined): number => {
    switch (op) {
        case '-':
        case '+':
            return 1;
        case '*':
        case '/':
            return 2;
    }

    return 0;
}

const evaluateOperator = (first: any, second: any, op: string | undefined): number | string => {
    switch (op) {
        case '+':
            return first + second;
        case '-':
            return first - second;
        case '*':
            return first * second;
        case '/':
            return first / second;
    }

    throw new Error(`Unknown operator '${op}'`);
}

const isNumeric = (str: string): boolean => {
    return !isNaN(str as any) && !isNaN(parseFloat(str));
}

const isSurroundedInQuotes = (str: string): boolean => {
    return (str.startsWith('"') || str.startsWith("'")) && str.endsWith(str[0]);
}

const trimSurroundingQuotes = (str: string): string => {
    return isSurroundedInQuotes(str) ? str.slice(1, -1) : str;
}

const getTokens = (formula: string): TokenInfo[] => {
    const result: TokenInfo[] = [];

    let inQuote = false;
    let token = "";
    for (let i = 0; i < formula.length; i++) {
        const c = formula[i];
        if (c == '"' || c == "'") {
            inQuote = !inQuote;
        }

        if (inQuote) {
            token += c;
            continue;
        }
        switch (c) {
            case '+':
            case '/':
            case '-':
            case '*':
            case '(':
            case ')':
                if (token.length > 0) {
                    if (isSurroundedInQuotes(token) || isNumeric(token)) {
                        result.push({token: token, type: TokenType.LITERAL})
                    } else {
                        result.push({token: token, type: TokenType.REFERENCE});
                    }
                }
                result.push({token: c, type: TokenType.OPERATOR})
                token = '';
                break;
            case '\\':
                token += `\\${formula[i + 1]}`
                i++;
                break;
            case ' ':
                break;
            default:
                token += c;
        }
    }
    if (isSurroundedInQuotes(token) || isNumeric(token)) {
        result.push({token: token, type: TokenType.LITERAL})
    } else {
        result.push({token: token, type: TokenType.REFERENCE});
    }

    return result;
}