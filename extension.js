const vscode = require('vscode');
const WebSocket = require('ws');

const { executeCommand } = require('./utils/registerCommands');


function activate(context) {
	const ws = new WebSocket('ws://localhost:8080');
	ws.on('message', async (message) => {
		const command = (JSON.parse(message.toString('utf-8'))['command']);
		executeCommand(vscode, command);
	});
}

module.exports = { activate };
