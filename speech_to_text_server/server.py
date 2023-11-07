from fastapi import FastAPI
from fastapi import WebSocket
from pydantic import BaseModel
import asyncio
import websockets

app = FastAPI()


class TextModel(BaseModel):
    text: str


@app.post("/send_text")
async def send_text(text_model: TextModel):
    print(text_model.text)
    async with websockets.connect('ws://localhost:8000/ws') as websocket:
        await websocket.send(text_model.text)
    return {"message": "Text saved successfully"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)

    
    
    

