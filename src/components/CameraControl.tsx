import React, { useEffect } from "react"
import { useWebSocket } from "../contexts/WebSocketContext"
import { Card } from "react-bootstrap"
import {
  ArrowUpCircleFill,
  ArrowLeftCircleFill,
  ArrowDownCircleFill,
  ArrowRightCircleFill,
  HouseDoorFill,
  Camera,
} from "react-bootstrap-icons"

export const CameraControl: React.FC = () => {
  const { sendMessage } = useWebSocket()

  const handleCameraMove = async (command: string) => {
    try {
      await sendMessage({ command })
    } catch (error) {
      console.error(`Failed to move camera (${command}):`, error)
    }
  }

  const handleCameraStop = async (stopCommand: string) => {
    try {
      await sendMessage({ command: stopCommand })
    } catch (error) {
      console.error(`Failed to stop camera (${stopCommand}):`, error)
    }
  }

  const handleCameraHome = async () => {
    try {
      await sendMessage({ command: "camera_home" })
    } catch (error) {
      console.error("Failed to home camera:", error)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return // Prevent key repeat

    switch (event.key.toLowerCase()) {
      case "i":
        handleCameraMove("look_up")
        break
      case "k":
        handleCameraMove("look_down")
        break
      case "j":
        handleCameraMove("look_left")
        break
      case "l":
        handleCameraMove("look_right")
        break
      case "h":
        handleCameraHome()
        break
      default:
        break
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "i":
      case "k":
        handleCameraStop("look_ud_stop")
        break
      case "j":
      case "l":
        handleCameraStop("look_lr_stop")
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
  }, []) // Empty dependency array since handlers use function references

  return (
    <Card>
      <Camera size={24} className="control-type-icon" />
      <div className="controls-grid">
        <div></div>
        <button
          className="control-btn"
          onMouseDown={() => handleCameraMove("look_up")}
          onMouseUp={() => handleCameraStop("look_ud_stop")}
          onTouchStart={() => handleCameraMove("look_up")}
          onTouchEnd={() => handleCameraStop("look_ud_stop")}
          title="Camera Up"
        >
          <ArrowUpCircleFill size={24} />
        </button>
        <div></div>
        <button
          className="control-btn"
          onMouseDown={() => handleCameraMove("look_left")}
          onMouseUp={() => handleCameraStop("look_lr_stop")}
          onTouchStart={() => handleCameraMove("look_left")}
          onTouchEnd={() => handleCameraStop("look_lr_stop")}
          title="Camera Left"
        >
          <ArrowLeftCircleFill size={24} />
        </button>
        <button
          className="control-btn"
          onMouseDown={() => handleCameraMove("look_down")}
          onMouseUp={() => handleCameraStop("look_ud_stop")}
          onTouchStart={() => handleCameraMove("look_down")}
          onTouchEnd={() => handleCameraStop("look_ud_stop")}
          title="Camera Down"
        >
          <ArrowDownCircleFill size={24} />
        </button>
        <button
          className="control-btn"
          onMouseDown={() => handleCameraMove("look_right")}
          onMouseUp={() => handleCameraStop("look_lr_stop")}
          onTouchStart={() => handleCameraMove("look_right")}
          onTouchEnd={() => handleCameraStop("look_lr_stop")}
          title="Camera Right"
        >
          <ArrowRightCircleFill size={24} />
        </button>
        <div></div>
        <button
          className="control-btn"
          onClick={handleCameraHome}
          title="Camera Home Position"
        >
          <HouseDoorFill size={24} />
        </button>
        <div></div>
      </div>
    </Card>
  )
}
