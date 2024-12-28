import React, { useEffect } from "react"
import { Card, Button } from "react-bootstrap"
import { useWebSocket } from "../contexts/WebSocketContext"
import { sendCommand } from "../utils/websocket"
import {
  ArrowUpCircleFill,
  ArrowDownCircleFill,
  ArrowLeftCircleFill,
  ArrowRightCircleFill,
  HouseFill,
  Camera,
} from "react-bootstrap-icons"

export const CameraControl: React.FC = () => {
  const ws = useWebSocket()

  const handleMouseDown = (command: string) => {
    sendCommand(ws, command)
  }

  const handleMouseUp = (stopCommand: string) => {
    sendCommand(ws, stopCommand)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Prevent handling the event multiple times if key is held
    if (event.repeat) return

    switch (event.key.toLowerCase()) {
      case "i":
        handleMouseDown("look_up")
        break
      case "j":
        handleMouseDown("look_left")
        break
      case "k":
        handleMouseDown("look_down")
        break
      case "l":
        handleMouseDown("look_right")
        break
      case "h":
        sendCommand(ws, "camera_home")
        break
      default:
        break
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "i":
        handleMouseUp("look_ud_stop")
        break
      case "j":
        handleMouseUp("look_lr_stop")
        break
      case "k":
        handleMouseUp("look_ud_stop")
        break
      case "l":
        handleMouseUp("look_lr_stop")
        break
      default:
        break
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
      <Camera size={20} className="control-type-icon" />
      <div className="camera-controls">
        <div className="d-flex justify-content-center mb-2">
          <Button
            variant="info"
            className="control-btn"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => handleMouseDown("look_up")}
            onMouseUp={() => handleMouseUp("look_ud_stop")}
            onTouchStart={() => handleMouseDown("look_up")}
            onTouchEnd={() => handleMouseUp("look_ud_stop")}
          >
            <ArrowUpCircleFill size={24} />
          </Button>
        </div>
        <div className="d-flex justify-content-center mb-2">
          <Button
            variant="info"
            className="control-btn mx-2"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => handleMouseDown("look_left")}
            onMouseUp={() => handleMouseUp("look_lr_stop")}
            onTouchStart={() => handleMouseDown("look_left")}
            onTouchEnd={() => handleMouseUp("look_lr_stop")}
          >
            <ArrowLeftCircleFill size={24} />
          </Button>
          <Button
            variant="info"
            className="control-btn mx-2"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => handleMouseDown("look_down")}
            onMouseUp={() => handleMouseUp("look_ud_stop")}
            onTouchStart={() => handleMouseDown("look_down")}
            onTouchEnd={() => handleMouseUp("look_ud_stop")}
          >
            <ArrowDownCircleFill size={24} />
          </Button>
          <Button
            variant="info"
            className="control-btn mx-2"
            style={{ transform: "scale(0.8)" }}
            onMouseDown={() => handleMouseDown("look_right")}
            onMouseUp={() => handleMouseUp("look_lr_stop")}
            onTouchStart={() => handleMouseDown("look_right")}
            onTouchEnd={() => handleMouseUp("look_lr_stop")}
          >
            <ArrowRightCircleFill size={24} />
          </Button>
        </div>
        <div className="d-flex justify-content-center">
          <Button
            variant="warning"
            className="control-btn"
            style={{ transform: "scale(0.8)" }}
            onClick={() => sendCommand(ws, "camera_home")}
          >
            <HouseFill size={24} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
