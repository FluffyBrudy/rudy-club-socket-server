# socket server

## if you are user of pigeon-messanger(you can find repo and ive app) this socket is free, use your user credentials
 - use native WebSocket so all message are passed on `message` event
 - data must be valid json and must have following structure:
    ```javascript
        {
            receiverId: uuid, // must be vaild auth token(user of pigeon messanger)
            data: any,
            ...other
        }
    ```