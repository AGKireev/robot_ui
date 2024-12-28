import React, { useEffect } from "react"
import { Card, Button } from "react-bootstrap"
import { useWebSocket } from "../contexts/WebSocketContext"
import { sendCommand } from "../utils/websocket"
import {
  CaretUpFill,
  CaretDownFill,
  CaretLeftFill,
  CaretRightFill,
  Joystick,
} from "react-bootstrap-icons"

export const MovementControl: React.FC = () => {
  const ws = useWebSocket()

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "w":
        sendCommand(ws, "forward")
        break
      case "a":
        sendCommand(ws, "left")
        break
      case "s":
        sendCommand(ws, "backward")
        break
      case "d":
        sendCommand(ws, "right")
        break
      default:
        break
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (["w", "s"].includes(event.key.toLowerCase())) {
      sendCommand(ws, "move_stop")
    }
    if (["a", "d"].includes(event.key.toLowerCase())) {
      sendCommand(ws, "turn_stop")
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  return (
    <Card className="shadow-sm">
      <Joystick size={20} className="control-type-icon" />
      <div className="movement-controls">
        <div className="d-flex justify-content-center mb-2">
          <Button
            variant="primary"
            className="control-btn"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => sendCommand(ws, "forward")}
            onMouseUp={() => sendCommand(ws, "move_stop")}
            onTouchStart={() => sendCommand(ws, "forward")}
            onTouchEnd={() => sendCommand(ws, "move_stop")}
          >
            <CaretUpFill size={24} />
          </Button>
        </div>
        <div className="d-flex justify-content-center">
          <Button
            variant="primary"
            className="control-btn mx-2"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => sendCommand(ws, "left")}
            onMouseUp={() => sendCommand(ws, "turn_stop")}
            onTouchStart={() => sendCommand(ws, "left")}
            onTouchEnd={() => sendCommand(ws, "turn_stop")}
          >
            <CaretLeftFill size={24} />
          </Button>
          <Button
            variant="primary"
            className="control-btn mx-2"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => sendCommand(ws, "backward")}
            onMouseUp={() => sendCommand(ws, "move_stop")}
            onTouchStart={() => sendCommand(ws, "backward")}
            onTouchEnd={() => sendCommand(ws, "move_stop")}
          >
            <CaretDownFill size={24} />
          </Button>
          <Button
            variant="primary"
            className="control-btn mx-2"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => sendCommand(ws, "right")}
            onMouseUp={() => sendCommand(ws, "turn_stop")}
            onTouchStart={() => sendCommand(ws, "right")}
            onTouchEnd={() => sendCommand(ws, "turn_stop")}
          >
            <CaretRightFill size={24} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
