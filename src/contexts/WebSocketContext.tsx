import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react"

interface SystemStatus {
  title: string
  data: [number, number, number]
}

interface WebSocketContextType {
  ws: WebSocket | null
  connectionStatus: string
  isConnected: boolean
  status: Array<{
    label: string
    value: number
    unit: string
    warning: number
    danger: number
  }>
  sendMessage: (message: any) => Promise<string>
}

const WebSocketContext = createContext<WebSocketContextType>({
  ws: null,
  connectionStatus: "🔄 Connecting...",
  isConnected: false,
  status: [],
  sendMessage: () => Promise.reject("WebSocket not initialized"),
})

export const WebSocketProvider: React.FC<{
  url: string
  authorization: string
  children: React.ReactNode
}> = ({ url, authorization, children }) => {
  const [connectionStatus, setConnectionStatus] =
    useState<string>("🔄 Connecting...")
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState([
    { label: "CPU Temp", value: 0, unit: "°C", warning: 70, danger: 85 },
    { label: "CPU Usage", value: 0, unit: "%", warning: 70, danger: 90 },
    { label: "RAM Usage", value: 0, unit: "%", warning: 80, danger: 95 },
  ])
  const ws = useRef<WebSocket | null>(null)
  const mountedRef = useRef(false)
  const statusInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Function to request system status
  const requestStatus = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log("[WS Status] Requesting system status")
      ws.current.send(JSON.stringify({ command: "get_info" }))
    }
  }, [])

  // Start periodic status updates
  const startStatusUpdates = useCallback(() => {
    console.log("[WS Status] Starting periodic status updates")
    requestStatus() // Request immediately
    statusInterval.current = setInterval(requestStatus, 2000) // Then every 2 seconds
  }, [requestStatus])

  // Stop periodic status updates
  const stopStatusUpdates = useCallback(() => {
    console.log("[WS Status] Stopping periodic status updates")
    if (statusInterval.current) {
      clearInterval(statusInterval.current)
      statusInterval.current = null
    }
  }, [])

  const connectWebSocket = useCallback(() => {
    if (!mountedRef.current) return
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log("[WS Connect] WebSocket already connected")
      return
    }
    if (ws.current) {
      console.log("[WS Connect] Closing existing connection")
      ws.current.close()
      ws.current = null
    }

    stopStatusUpdates() // Stop any existing status updates

    console.log("[WS Connect] Creating new WebSocket connection to:", url)
    const socket = new WebSocket(url)
    ws.current = socket

    socket.onopen = () => {
      console.log("[WS Event] Socket opened, sending auth")
      socket.send(authorization)
      setConnectionStatus("🔄 Authenticating...")
      setIsConnected(false)
    }

    socket.onmessage = (event: MessageEvent) => {
      console.log("[WS Event] Message received:", event.data)
      try {
        if (event.data === "congratulation") {
          console.log("[WS Event] Authentication successful")
          setIsConnected(true)
          setConnectionStatus("✅ Connected")
          startStatusUpdates() // Start periodic status updates after authentication
          return
        }
        if (event.data === "sorry") {
          console.log("[WS Event] Authentication failed")
          setConnectionStatus("❌ Authentication Failed")
          setIsConnected(false)
          stopStatusUpdates()
          socket.close()
          return
        }

        // Try to parse the message as JSON
        let message
        try {
          message = JSON.parse(event.data)
          console.log("[WS Event] Parsed message:", message)
        } catch (parseError) {
          console.error("[WS Event] Failed to parse message:", event.data)
          return
        }

        // Handle nested response format
        if (message.status === "ok" && message.data) {
          const responseData = message.data
          if (
            responseData.title === "get_info" &&
            Array.isArray(responseData.data)
          ) {
            console.log(
              "[WS Event] Received system status update:",
              responseData.data
            )
            const newStatus = [
              {
                label: "CPU Temp",
                value: Number(responseData.data[0]),
                unit: "°C",
                warning: 70,
                danger: 85,
              },
              {
                label: "CPU Usage",
                value: Number(responseData.data[1]),
                unit: "%",
                warning: 70,
                danger: 90,
              },
              {
                label: "RAM Usage",
                value: Number(responseData.data[2]),
                unit: "%",
                warning: 80,
                danger: 95,
              },
            ]
            console.log("[WS Event] Setting new status:", newStatus)
            setStatus(newStatus)
          }
        } else {
          console.log("[WS Event] Unknown message format:", message)
        }
      } catch (error) {
        console.error(
          "[WS Event] Error processing message:",
          error,
          "Raw message:",
          event.data
        )
      }
    }

    socket.onerror = (error: Event) => {
      console.error("[WS Event] WebSocket error:", error)
      setConnectionStatus("❌ Connection Error")
      setIsConnected(false)
      stopStatusUpdates()
    }

    socket.onclose = (event) => {
      console.log(
        "[WS Event] WebSocket closed, code:",
        event.code,
        "reason:",
        event.reason
      )
      setConnectionStatus("🔄 Reconnecting...")
      setIsConnected(false)
      stopStatusUpdates()
      ws.current = null

      if (mountedRef.current) {
        console.log("[WS Event] Scheduling reconnect in 5s")
        setTimeout(connectWebSocket, 5000)
      }
    }
  }, [url, authorization, startStatusUpdates, stopStatusUpdates])

  useEffect(() => {
    console.log("[WS Effect] Component mounted")
    mountedRef.current = true
    connectWebSocket()

    return () => {
      console.log("[WS Effect] Component unmounting")
      mountedRef.current = false
      stopStatusUpdates()
      if (ws.current) {
        console.log("[WS Effect] Closing connection on unmount")
        const socket = ws.current
        socket.onclose = null // Remove reconnection logic
        socket.close()
        ws.current = null
      }
    }
  }, [connectWebSocket, stopStatusUpdates])

  const sendMessage = useCallback((message: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        reject("WebSocket is not connected")
        return
      }

      // For servo commands, we need to wait for the response
      const isServoCommand =
        typeof message === "object" && message.command?.startsWith("servo_")

      if (isServoCommand) {
        const messageHandler = (event: MessageEvent) => {
          ws.current?.removeEventListener("message", messageHandler)
          resolve(event.data)
        }

        ws.current.addEventListener("message", messageHandler)
        ws.current.send(JSON.stringify(message))
      } else {
        // For other commands, just send and resolve
        try {
          ws.current.send(JSON.stringify(message))
          resolve("sent")
        } catch (error) {
          reject(error)
        }
      }
    })
  }, [])

  const contextValue = useMemo(
    () => ({
      ws: isConnected ? ws.current : null,
      connectionStatus,
      isConnected,
      status,
      sendMessage,
    }),
    [isConnected, connectionStatus, status, sendMessage]
  )

  console.log("[WS Provider] Current status:", status)
  console.log("[WS Provider] Connection status:", connectionStatus)
  console.log("[WS Provider] Is connected:", isConnected)

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}

export const useConnectionStatus = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error(
      "useConnectionStatus must be used within a WebSocketProvider"
    )
  }
  return context.connectionStatus
}

export const useStatus = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useStatus must be used within a WebSocketProvider")
  }
  return context.status
}

export const useIsConnected = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useIsConnected must be used within a WebSocketProvider")
  }
  return context.isConnected
}
