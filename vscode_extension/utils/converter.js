const { log } = require("console");

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

    //without initial value
    const letRegex=/^create\s+(late)\s+(\w+)$/i;  
    const constRegex=/^create\s+(constant)\s+(\w+)$/i;  
    const varRegex= /^create\s+(variable)\s+(\w+)$/i;  
    const letMatch=grammaticalLine.match(letRegex);
    const constMatch=grammaticalLine.match(constRegex);
    const varMatch = grammaticalLine.match(varRegex); 

    //with initial value
    const letRegex1=/^late\s+(\w+)\s*=\s*(\S+)$/i;
    const constRegex1=/^constant\s+(\w+)\s+equal\s+(\S+)$/i;
    const varRegex1= /^variable\s+(\w+)\s+equal\s+(\S+)$/i;
    const letMatch1=grammaticalLine.match(letRegex1);
    const constMatch1=grammaticalLine.match(constRegex1);
    const varMatch1 = grammaticalLine.match(varRegex1); 


    
    if(letMatch){
        const variableName1 = letMatch[2];
        return `let ${variableName1} = /* Your initial value here */;\n`;
    }
    else if (constMatch) {
        const variableName2 = constMatch[2];
        return `const ${variableName2} = /* Your initial value here */;\n`;
    } 
    else if (varMatch) {
        const variableName3 = varMatch[2];
        return `var ${variableName3} = /* Your initial value here */;\n`;
    }
    else if (letMatch1) {
        const variableName4 = letMatch1[1];
        console.log(variableName4);
        const initialValue1 = letMatch1[2];
        console.log(initialValue1);
        return `let ${variableName4} = ${initialValue1};`;
    }
    else if (constMatch1) {
        const variableName5 = constMatch1[1];
        const initialValue2 = constMatch1[2];
        console.log(initialValue2);
        return `const ${variableName5} = ${initialValue2};`;
    }
    else if (varMatch1) {
        const variableName6 = varMatch1[1];
        const initialValue3 = varMatch1[2];
        return `var ${variableName6} = ${initialValue3};`;
    }
     else {
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
