#!/bin/bash
cd ./vscode_extension/
npm install
cd -
pip install -r requirements.txt
python3 ./speech_to_text_server/server.py &
python3 ./speech_to_text_server/voice-to-speech.py &

