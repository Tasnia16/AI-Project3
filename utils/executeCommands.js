const convertGrammaticalLineToCode = require('./converter');



function executeCommand(vscode, grammaticalLine) {

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        const code = convertGrammaticalLineToCode(vscode, grammaticalLine);
        if (code != true) {
            editor.edit(editBuilder => {
                editBuilder.replace(selection, code);
            });
        }
        else if (code == null) {
            vscode.window.showInformationMessage('No matching grammar found.');
        }
    }
}

module.exports = { executeCommand }

