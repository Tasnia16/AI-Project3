const vscode = require('vscode');
const WebSocket = require('ws');
const convertGrammaticalLineToCode = require('./converter');

function executeCommand(grammaticalLine) {
	const commands = [
		{
			commandId: 'convertPrintCommandToCode',
			prefix: 'Print ',
			title: 'Convert Print Command to Code',
		},
		{
			commandId: 'convertAddCommandToCode',
			prefix: 'Add ',
			title: 'Convert Add Command to Code',
		},
		{
			commandId: 'convertGreetCommandToCode',
			prefix: 'Greet the user with ',
			title: 'Convert Greet Command to Code',
		},
	];
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

function activate(context) {
	const ws = new WebSocket('ws://localhost:8080');
	ws.on('message', async (message) => {
		const command = (JSON.parse(message.toString('utf-8'))['command']);
		console.log(command)
		executeCommand(command);
	});
	// let dispose = () => { ws.close(); }
	// context.subscriptions.push(dispose);
}

module.exports = { activate, };
