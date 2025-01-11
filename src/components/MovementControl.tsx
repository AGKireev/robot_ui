import React, { useEffect } from "react"
import { useWebSocket } from "../contexts/WebSocketContext"
import { Card } from "react-bootstrap"
import {
  ArrowUpCircleFill,
  ArrowLeftCircleFill,
  ArrowDownCircleFill,
  ArrowRightCircleFill,
  Joystick,
} from "react-bootstrap-icons"

export const MovementControl: React.FC = () => {
  const { sendMessage } = useWebSocket()

  const handleForward = async () => {
    try {
      await sendMessage({ command: "forward" })
    } catch (error) {
      console.error("Failed to move forward:", error)
    }
  }

  const handleLeft = async () => {
    try {
      await sendMessage({ command: "left" })
    } catch (error) {
      console.error("Failed to turn left:", error)
    }
  }

  const handleBackward = async () => {
    try {
      await sendMessage({ command: "backward" })
    } catch (error) {
      console.error("Failed to move backward:", error)
    }
  }

  const handleRight = async () => {
    try {
      await sendMessage({ command: "right" })
    } catch (error) {
      console.error("Failed to turn right:", error)
    }
  }

  const handleMoveStop = async () => {
    try {
      await sendMessage({ command: "move_stop" })
    } catch (error) {
      console.error("Failed to stop movement:", error)
    }
  }

  const handleTurnStop = async () => {
    try {
      await sendMessage({ command: "turn_stop" })
    } catch (error) {
      console.error("Failed to stop turning:", error)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return // Prevent key repeat

    switch (event.key.toLowerCase()) {
      case "w":
        handleForward()
        break
      case "s":
        handleBackward()
        break
      case "a":
        handleLeft()
        break
      case "d":
        handleRight()
        break
      default:
        break
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "w":
      case "s":
        handleMoveStop()
        break
      case "a":
      case "d":
        handleTurnStop()
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
      <Joystick size={24} className="control-type-icon" />
      <div className="controls-grid">
        <div></div>
        <button
          className="control-btn"
          onMouseDown={handleForward}
          onMouseUp={handleMoveStop}
          onTouchStart={handleForward}
          onTouchEnd={handleMoveStop}
          title="Forward"
        >
          <ArrowUpCircleFill size={24} />
        </button>
        <div></div>
        <button
          className="control-btn"
          onMouseDown={handleLeft}
          onMouseUp={handleTurnStop}
          onTouchStart={handleLeft}
          onTouchEnd={handleTurnStop}
          title="Turn Left"
        >
          <ArrowLeftCircleFill size={24} />
        </button>
        <button
          className="control-btn"
          onMouseDown={handleBackward}
          onMouseUp={handleMoveStop}
          onTouchStart={handleBackward}
          onTouchEnd={handleMoveStop}
          title="Backward"
        >
          <ArrowDownCircleFill size={24} />
        </button>
        <button
          className="control-btn"
          onMouseDown={handleRight}
          onMouseUp={handleTurnStop}
          onTouchStart={handleRight}
          onTouchEnd={handleTurnStop}
          title="Turn Right"
        >
          <ArrowRightCircleFill size={24} />
        </button>
      </div>
    </Card>
  )
}
