function needToMove(grammaticalLine) {
    const lineNumberRegex = /line (\d+)/i;
    const match = grammaticalLine.match(lineNumberRegex);
    if (match) return match[1]
    else return null
}

function moveCursorToLine(lineNumber, vscode) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = new vscode.Position(lineNumber - 1, 0);
        const newSelection = new vscode.Selection(position, position);
        editor.selection = newSelection;
        editor.revealRange(newSelection);
    }
}

function handleCursorMove(grammaticalLine, vscode) {
    const lineNumber = needToMove(grammaticalLine)
    if (lineNumber != null) {
        moveCursorToLine(lineNumber, vscode)
        return true
    }
    else return false;

}


function needToSelect(grammaticalLine) {
    const selectLinesRegex = /^\s*(select|choose) (line|lines)(?: from)? (\d+) to (\d+)\s*$/i;
    const match = grammaticalLine.match(selectLinesRegex);
    if (match) {
        return [match[3], match[4]];
    } else {
        return null;
    }
}


function selectLines(startLine, endLine, vscode) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const startPosition = new vscode.Position(startLine - 1, 0);
        const endPosition = new vscode.Position(endLine - 1, 0);
        const range = new vscode.Range(startPosition, endPosition);
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
}

function handleSelection(grammaticalLine, vscode) {
    const lineNumbers = needToSelect(grammaticalLine)
    if (lineNumbers != null) {
        selectLines(parseInt(lineNumbers[0]), parseInt(lineNumbers[1]) + 1, vscode)
        return true
    }
    else return false;
}

function handlePrint(grammaticalLine) {

    const printRegex = /^(print|log|output|console\.log|console|)\s+(.+)$/i;
    const printMatch = grammaticalLine.match(printRegex);
    if (printMatch) {
        return `console.log('${printMatch[2]}');\n`;
    }
    else return false
}

// function handleLoop(grammaticalLine) {

//     const loopRegex = /^(loop|create|output|console\.log|console|)\s+(.+)$/i;
//     const loopMatch = grammaticalLine.match(loopRegex);
//     if (loopMatch) {
//         return `for(let i=0; i< n ; i++){}\n`;
//     }
//     else return false
// }

function handleLoop(grammaticalLine) {
    const forLoopRegex = /^(create\s+for\s+loop|loop|for|for\s+loop|create\s+loop|print\s+loop)$/i;
    const whileLoopRegex = /^(create\s+while\s+loop|while\s+loop|while)$/i;
    const doWhileLoopRegex = /(^create\s+do\s+while\s+loop|do\s+while|do\s+while\s+loop)$/i;

    const forLoopMatch = grammaticalLine.match(forLoopRegex);
    const whileLoopMatch = grammaticalLine.match(whileLoopRegex);
    const doWhileLoopMatch = grammaticalLine.match(doWhileLoopRegex);

    if (forLoopMatch) {
        return `for (let i = 0; i < n; i++) {\n  // Your loop body here\n}\n`;
    } else if (whileLoopMatch) {
        return `while (condition) {\n  // Your loop body here\n}\n`;
    } else if (doWhileLoopMatch) {
        return `do {\n  // Your loop body here\n} while (condition);\n`;
    } else {
        return false;
    }

}

function handleFunction(grammaticalLine) {
    const createFunctionRegex = /^create\s+function\s+(\w+)$/i;

    const match = grammaticalLine.match(createFunctionRegex);

    if (match) {
        const functionName = match[1];
        return `function ${functionName}() {\n  // Your function body here\n}\n`;
    } else {
        return false;
    }
}

function handleVariableDeclaration(grammaticalLine) {
    const createVariableRegex = /^create\s+(let|const|var)\s+(\w+)$/i;
    const generalVar= /^create\s+variable\s+(\w+)$/i;

    const match = grammaticalLine.match(createVariableRegex);
    const match2 = grammaticalLine.match(generalVar);
    
    if (match) {
        const declarationKeyword = match[1];
        const variableName = match[2];
        return `${declarationKeyword} ${variableName} = /* Your initial value here */;`;
    } else if (match2) {
        const variableName2 = match2[1];
        return `var ${variableName2} = /* Your initial value here */;`;
    } else {
        return false;
    } 
}




module.exports = function convertGrammaticalLineToCode(vscode, grammaticalLine) {
    let executedInternalCommand = false
    if (handleCursorMove(grammaticalLine, vscode) || handleSelection(grammaticalLine, vscode)) {
        executedInternalCommand = true
    }

    if (handlePrint(grammaticalLine)) return handlePrint(grammaticalLine)
    if(handleLoop(grammaticalLine)) return handleLoop(grammaticalLine)
    if(handleFunction(grammaticalLine)) return handleFunction(grammaticalLine)
    if(handleVariableDeclaration(grammaticalLine)) return handleVariableDeclaration(grammaticalLine)

    if (executedInternalCommand) { return executedInternalCommand }
    return null;
};




//handled commands:
// go to line 10
// print abc
// select lines 10 to 12
