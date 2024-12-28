export const sendCommand = (ws: WebSocket | null, command: string) => {
    console.log(`[WS Command] Attempting to send command: ${command}`)
    console.log(`[WS Command] WebSocket state:`, ws?.readyState)

    if (ws?.readyState === WebSocket.OPEN) {
        const commandObj = { command: command }
        console.log(`[WS Command] Sending command:`, commandObj)
        ws.send(JSON.stringify(commandObj))
    } else {
        console.warn(`[WS Command] Cannot send command: ${command}. WebSocket state: ${ws?.readyState}`)
        if (!ws) {
            console.warn("[WS Command] WebSocket is null")
        } else {
            console.warn("[WS Command] WebSocket states: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED. Current state:", ws.readyState)
        }
    }
} 