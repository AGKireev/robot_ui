import React from "react"
import { Card, Button } from "react-bootstrap"
import { useWebSocket } from "../contexts/WebSocketContext"
import { sendCommand } from "../utils/websocket"
import {
  LightningFill,
  LightningChargeFill,
  Lightbulb,
} from "react-bootstrap-icons"

export const LightControls: React.FC = () => {
  const ws = useWebSocket()
  const [policeMode, setPoliceMode] = React.useState(false)

  const togglePoliceMode = () => {
    const command = policeMode ? "policeOff" : "police"
    sendCommand(ws, command)
    setPoliceMode(!policeMode)
  }

  return (
    <Card className="shadow-sm">
      <Lightbulb size={20} className="control-type-icon" />
      <div className="light-controls">
        <Button
          variant={policeMode ? "danger" : "primary"}
          className="control-btn"
          style={{ transform: "scale(0.8)" }}
          onClick={togglePoliceMode}
        >
          {policeMode ? (
            <LightningFill size={24} />
          ) : (
            <LightningChargeFill size={24} />
          )}
        </Button>
      </div>
    </Card>
  )
}
