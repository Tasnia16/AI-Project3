const { exit } = require('process');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout, });
function sendMessage(ws, message) {
    ws.send(JSON.stringify({ command: message }));
    console.log(`Sent message to the extension: ${message}`);
}

wss.on('connection', (ws) => {
    const waitForUserInput = () => {
        readline.question('Enter a message to send to the extension (or type "exit" to stop): ', (message) => {
            if (message.toLowerCase() === 'exit') {
                readline.close();
            } else {
                sendMessage(ws, message)
                waitForUserInput();
            }
        });
    };
    waitForUserInput();
    ws.on('close', () => { console.log('Connection closed'); });
});
