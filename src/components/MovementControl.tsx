import React, { useEffect, useState } from "react"
import { useWebSocket } from "../contexts/WebSocketContext"
import { Card, Form, Row, Col, ButtonGroup, Button } from "react-bootstrap"
import {
  ArrowUpCircleFill,
  ArrowLeftCircleFill,
  ArrowDownCircleFill,
  ArrowRightCircleFill,
  Joystick,
  Lightning,
  Wind,
} from "react-bootstrap-icons"

export const MovementControl: React.FC = () => {
  const { sendMessage } = useWebSocket()
  const [moveSpeed, setMoveSpeed] = useState(5)
  const [turnSpeed, setTurnSpeed] = useState(5)
  const [isSmooth, setIsSmooth] = useState(true)

  const sendMovementCommand = async (command: string) => {
    try {
      await sendMessage({
        command,
        params: {
          smooth: isSmooth,
          speed: moveSpeed,
          turn_speed: turnSpeed,
        },
      })
    } catch (error) {
      console.error(`Failed to send ${command} command:`, error)
    }
  }

  const handleForward = async () => {
    await sendMovementCommand("forward")
  }

  const handleLeft = async () => {
    await sendMovementCommand("left")
  }

  const handleBackward = async () => {
    await sendMovementCommand("backward")
  }

  const handleRight = async () => {
    await sendMovementCommand("right")
  }

  const handleMoveStop = async () => {
    await sendMovementCommand("move_stop")
  }

  const handleTurnStop = async () => {
    await sendMovementCommand("turn_stop")
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

      <div className="mt-3 px-3 pb-3">
        <Row className="mb-2">
          <Col>
            <Form.Label className="mb-1">Move Speed ({moveSpeed})</Form.Label>
            <Form.Range
              min={0}
              max={10}
              step={1}
              value={moveSpeed}
              onChange={(e) => setMoveSpeed(parseInt(e.target.value))}
            />
          </Col>
        </Row>

        <Row className="mb-2">
          <Col>
            <Form.Label className="mb-1">Turn Speed ({turnSpeed})</Form.Label>
            <Form.Range
              min={0}
              max={10}
              step={1}
              value={turnSpeed}
              onChange={(e) => setTurnSpeed(parseInt(e.target.value))}
            />
          </Col>
        </Row>

        <Row>
          <Col>
            <ButtonGroup className="w-100">
              <Button
                variant={isSmooth ? "secondary" : "outline-secondary"}
                onClick={() => setIsSmooth(true)}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <Wind /> Smooth
              </Button>
              <Button
                variant={!isSmooth ? "secondary" : "outline-secondary"}
                onClick={() => setIsSmooth(false)}
                className="d-flex align-items-center justify-content-center gap-2"
              >
                <Lightning /> Fast
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    </Card>
  )
}
