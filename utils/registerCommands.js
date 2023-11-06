const convertGrammaticalLineToCode = require('./converter');
const commands = []

function registerCommand(prefix) {
    const command = { prefix: prefix }
    commands.push(command);
}

function executeCommand(vscode, grammaticalLine) {
    for (const command of commands) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            if (grammaticalLine.startsWith(command.prefix)) {
                const code = convertGrammaticalLineToCode(grammaticalLine);
                if (code) {
                    editor.edit(editBuilder => {
                        editBuilder.replace(selection, code);
                    });
                } else {
                    vscode.window.showInformationMessage('No matching grammar found.');
                }
            }
        }
    }
}

registerCommand('Print ')
registerCommand('Add ')
registerCommand('Greet the user with ')


module.exports = { executeCommand }