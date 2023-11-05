module.exports = function convertGrammaticalLineToCode(grammaticalLine) {
    if (grammaticalLine.startsWith('Print ')) {
        return `console.log('${grammaticalLine.slice(6)}');\n`;
    } else if (grammaticalLine.startsWith('Add ')) {
        const numbers = grammaticalLine.slice(4).split(' and ');
        if (numbers.length === 2) {
            const result = parseInt(numbers[0]) + parseInt(numbers[1]);
            return `const result = ${result};`;
        }
    } else if (grammaticalLine.startsWith('Greet the user with ')) {
        return `const greeting = '${grammaticalLine.slice(20)}';`;
    }
    return null;
};

