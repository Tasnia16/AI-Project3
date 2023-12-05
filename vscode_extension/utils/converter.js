//--------------------GOTO LINE X------------------------

function needToMove(grammaticalLine) {
    const lineNumberRegex = /\bgo\s*to(?:\s*line)?\s*\d+\b/;
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


//--------------------SELECT LINES FROM X TO Y------------------------
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

//--------------------------COPY-------------------------------------
function needToCopy(grammaticalLine) {
    const copyRegex = /copy\s+from\s+line\s+(\d+) to (\d+)/i;
    const match = grammaticalLine.match(copyRegex);
    if (match) {
        const startLine = parseInt(match[1]);
        const endLine = parseInt(match[2]);
        console.log(startLine, endLine);
        return { startLine, endLine };
    }
    return null

}

function copy(startLine, endLine, vscode) {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const linesText = [];
    for (let lineNumber = startLine - 1; lineNumber < endLine; lineNumber++) {
        const lineText = document.lineAt(lineNumber).text;
        linesText.push(lineText);
    }
    const linesContent = linesText.join('\n');
    vscode.env.clipboard.writeText(linesContent);
    vscode.window.showInformationMessage(`Lines from ${startLine} to ${endLine} copied to clipboard.`);

}

function handleCopy(grammaticalLine, vscode) {
    const lines = needToCopy(grammaticalLine)

    if (lines != null) {
        copy(lines.startLine, lines.endLine, vscode)
        return true
    }
    else return false;

}


//--------------------------PASTE-------------------------------------
function needToPaste(grammaticalLine) {
    const pasteRegex = /\bpaste(?:\s+(?:at|to)\s+line)?\s+(\d+)/i;
    const match = grammaticalLine.match(pasteRegex);
    if (match) {
        const lineNumber = parseInt(match[1]);
        return lineNumber
    }
    return null
}
async function paste(lineNumber, vscode) {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    try {

        const clipboardContent = await vscode.env.clipboard.readText();
        const position = new vscode.Position(lineNumber - 1, 0);
        const edit = new vscode.TextEdit(new vscode.Range(position, position), clipboardContent);
        const editBuilder = new vscode.WorkspaceEdit();
        editBuilder.set(document.uri, [edit]);

        await vscode.workspace.applyEdit(editBuilder);
        vscode.window.showInformationMessage(`Clipboard content pasted at line ${lineNumber}.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error reading clipboard: ${error.message}`);
    }
}

function handlePaste(grammaticalLine, vscode) {

    const lineNumber = needToPaste(grammaticalLine)
    if (lineNumber != null) {
        paste(lineNumber, vscode)
        return true
    }
    else return false;
}


//--------------------------UNDO-------------------------------------
function needToUndo(grammaticalLine) {
    const undoRegex = /\bundo\b/i;
    const match = grammaticalLine.match(undoRegex);
    if (match) {
        return true
    }
    return false
}

function handleUndo(grammaticalLine, vscode) {
    if (needToUndo(grammaticalLine)) {
        vscode.commands.executeCommand('undo');
        return true
    }
    else return false;
}


//--------------------------REDO-------------------------------------
function needToRedo(grammaticalLine) {
    const undoRegex = /\bredo\b/i;
    const match = grammaticalLine.match(undoRegex);
    if (match) {
        return true
    }
    return false
}

function handleRedo(grammaticalLine, vscode) {
    if (needToRedo(grammaticalLine)) {
        vscode.commands.executeCommand('redo');
        return true
    }
    else return false;
}


//--------------------PRINT X------------------------
function handlePrint(grammaticalLine) {

    const printRegex = /^(print|log|output|console\.log|console|)\s+(.+)$/i;
    const printMatch = grammaticalLine.match(printRegex);
    if (printMatch) {
        return `console.log('${printMatch[2]}');\n`;
    }
    else return false
}

//--------------------LOOP------------------------
function handleLoop(grammaticalLine) {
    const forLoopRegex = /^(create\s+for\s+loop|loop|for|for\s+loop|create\s+loop|print\s+loop)$/i;
    const whileLoopRegex = /^(create\s+while\s+loop|while\s+loop|while)$/i;
    const doWhileLoopRegex = /(^create\s+do\s+while\s+loop|do\s+while|do\s+while\s+loop)$/i;

    const forLoopMatch = grammaticalLine.match(forLoopRegex);
    const whileLoopMatch = grammaticalLine.match(whileLoopRegex);
    const doWhileLoopMatch = grammaticalLine.match(doWhileLoopRegex);

    if (forLoopMatch) {
        return `\nfor (let i = 0; i < n; i++) {\n  // Your loop body here\n}\n`;
    } else if (whileLoopMatch) {
        return `\nwhile (condition) {\n  // Your loop body here\n}\n`;
    } else if (doWhileLoopMatch) {
        return `\ndo {\n  // Your loop body here\n} while (condition);\n`;
    } else {
        return false;
    }

}
//--------------------FUNCTION------------------------
function handleFunction(grammaticalLine) {
    const createFunctionRegex = /^create\s+function\s+(\w+)$/i;
    const match = grammaticalLine.match(createFunctionRegex);

    //create function with parameter
    const functionRegex = /^function\s+(\w+)\s+parameter\s+(\d+)$/i;
    const match1 = grammaticalLine.match(functionRegex);


    if (match) {
        const functionName = match[1];
        return `function ${functionName}() {\n  // Your function body here\n}\n`;
    } else if (match1) {
        const functionName1 = match1[1];
        const parameterCount = parseInt(match1[2]);

        const parameters = Array.from({ length: parameterCount }, (_, index) => String.fromCharCode(97 + index));
        const parametersList = parameters.join(',');

        return `function ${functionName1}(${parametersList}) {\n  // Your function body here\n}`;
    }
    else {
        return false;
    }
}


//--------------------VARIABLE DECLARATION------------------------
function handleVariableDeclaration(grammaticalLine) {

    //without initial value
    const letRegex = /^create\s+(late)\s+(\w+)$/i;
    const constRegex = /^create\s+(constant)\s+(\w+)$/i;
    const varRegex = /^create\s+(variable)\s+(\w+)$/i;
    const letMatch = grammaticalLine.match(letRegex);
    const constMatch = grammaticalLine.match(constRegex);
    const varMatch = grammaticalLine.match(varRegex);

    //with initial value
    const letRegex1 = /^late\s+(\w+)\s*=\s*(\S+)$/i;
    const constRegex1 = /^constant\s+(\w+)\s+equal\s+(\S+)$/i;
    const varRegex1 = /^variable\s+(\w+)\s+equal\s+(\S+)$/i;
    const letMatch1 = grammaticalLine.match(letRegex1);
    const constMatch1 = grammaticalLine.match(constRegex1);
    const varMatch1 = grammaticalLine.match(varRegex1);



    if (letMatch) {
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

//--------------------FIND & REPLACE----------------------------------------
function handleReplace(grammaticalLine, vscode) {
    const regex = /\breplace\s+(\S+)\s+with\s+(\S+)\b/;
    const match = grammaticalLine.match(regex);
    if (match) {
        var oldValue = match[1];
        var newValue = match[2];
    }
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;

    const currentPosition = editor.selection.active;
    const currentLine = document.lineAt(currentPosition.line);
    const startPosition = new vscode.Position(currentPosition.line, 0);
    const endPosition = new vscode.Position(currentPosition.line, currentLine.text.length);
    const wholeLine = currentLine.text;
    console.log(wholeLine);


    const oldRegex = new RegExp(`\\b${oldValue}\\b`, 'g');
    if (wholeLine.match(oldRegex)) {
        const newLine = wholeLine.replace(oldRegex, newValue);
        editor.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(startPosition, endPosition), newLine);
        });

        vscode.window.showInformationMessage(`String "${oldValue}" replaced with "${newValue}".`);
    }
}

//--------------------SPACE------------------------------------------
function space(grammaticalLine) {

    const inputRegex = /\b\s*space\s*\b/i;

    const match = grammaticalLine.match(inputRegex);
    if (match) {
        return ` `;
    }
    else return false
}

//--------------------Newline----------------------------------------
function newline(grammaticalLine) {
    const inputRegex = /\b\s*enter\s*\b/i;

    const match = grammaticalLine.match(inputRegex);
    if (match) {
        return `\n`;
    }
    else return false
}

//--------------------Conditional statements----------------------------------------
function conditional(grammaticalLine) {
    // console.log(grammaticalLine);
    // const ifStatementRegex = /\bif\b(?!else)\b/g;
    // const match = grammaticalLine.match(ifStatementRegex);
    // console.log(match);
    // if (match) {
    //     return `\nif (condition) {\n  // Your condition body here\n}\n`;
    // }
    // else return false

    if (grammaticalLine == 'if') {
        return `\nif (condition) {\n  // Your condition body here\n}\n`;
    }
    else if (grammaticalLine == 'else if') {
        return `\nelse if (condition) {\n  // Your condition body here\n}\n`;
    }
    else if (grammaticalLine == 'else') {
        return `\nelse {\n  // Your condition body here\n}\n`;
    }
    else {
        return false
    }


}


module.exports = function convertGrammaticalLineToCode(vscode, grammaticalLine) {
    let executedInternalCommand = false

    if (handleCopy(grammaticalLine, vscode) || handleReplace(grammaticalLine, vscode) || handlePaste(grammaticalLine, vscode) || handleUndo(grammaticalLine, vscode) || handleRedo(grammaticalLine, vscode) || handleCursorMove(grammaticalLine, vscode) || handleSelection(grammaticalLine, vscode)) {
        executedInternalCommand = true
    }
    if (handlePrint(grammaticalLine)) return handlePrint(grammaticalLine)
    if (space(grammaticalLine)) return space(grammaticalLine)
    if (newline(grammaticalLine)) return newline(grammaticalLine)
    if (conditional(grammaticalLine)) return conditional(grammaticalLine)
    if (handleLoop(grammaticalLine)) return handleLoop(grammaticalLine)
    if (handleFunction(grammaticalLine)) return handleFunction(grammaticalLine)
    if (handleVariableDeclaration(grammaticalLine)) return handleVariableDeclaration(grammaticalLine)
    if (executedInternalCommand) { return executedInternalCommand }
    return null;
};



// handled commands:
// go to x
// print x
// select lines x to y
// copy from line x to y
// paste at line x
// undo
// redo
// function
// loop
// variable
// replace x with y
// space
// newline
// condition if,else if,else
