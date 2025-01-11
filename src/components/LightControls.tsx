import React, { useState, useEffect } from "react"
import { Card, Form } from "react-bootstrap"
import { useWebSocket } from "../contexts/WebSocketContext"
import {
  BrightnessHighFill,
  Rainbow,
  LightningFill,
  LightbulbOff,
  Lightbulb,
  Stars,
} from "react-bootstrap-icons"

type LightMode = "police" | "breath" | "rainbow" | "stars" | "off"

interface RGB {
  r: number
  g: number
  b: number
}

export const LightControls: React.FC = () => {
  const { sendMessage, isConnected } = useWebSocket()
  const [activeMode, setActiveMode] = useState<LightMode>("stars")
  const [breathColor, setBreathColor] = useState<RGB>({ r: 255, g: 0, b: 0 })

  useEffect(() => {
    if (isConnected) {
      sendMessage({ command: "stars" }).catch(console.error)
    }
  }, [isConnected, sendMessage])

  const handleLightMode = async (mode: LightMode) => {
    if (activeMode === mode) {
      return
    }

    try {
      // Turn off current mode first
      if (activeMode) {
        await sendMessage({ command: "off" })
      }

      // Handle the new mode
      if (mode === "breath") {
        await sendMessage({ command: "breath", ...breathColor })
      } else if (mode) {
        await sendMessage({ command: mode })
      }

      setActiveMode(mode)
    } catch (error) {
      console.error("Failed to set light mode:", error)
    }
  }

  const handleColorChange = async (color: string) => {
    // Convert hex to RGB
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
    if (result) {
      const newColor = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      setBreathColor(newColor)

      // If breath mode is active, update the color
      if (activeMode === "breath") {
        try {
          await sendMessage({ command: "breath", ...newColor })
        } catch (error) {
          console.error("Failed to update breath color:", error)
        }
      }
    }
  }

  const handleTurnOff = async () => {
    try {
      await sendMessage({ command: "off" })
      setActiveMode("off")
    } catch (error) {
      console.error("Failed to turn off lights:", error)
    }
  }

  // Convert RGB to hex for the color input
  const rgbToHex = (r: number, g: number, b: number) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? "0" + hex : hex
      })
      .join("")

  return (
    <Card className="light-controls">
      <Lightbulb size={24} className="control-type-icon" />
      <div className="controls-grid">
        <button
          className={`control-btn ${activeMode === "breath" ? "active" : ""}`}
          onClick={() => handleLightMode("breath")}
          title="Breathing Effect"
        >
          <BrightnessHighFill />
        </button>
        <button
          className={`control-btn ${activeMode === "rainbow" ? "active" : ""}`}
          onClick={() => handleLightMode("rainbow")}
          title="Rainbow Mode"
        >
          <Rainbow />
        </button>
        <button
          className={`control-btn ${activeMode === "police" ? "active" : ""}`}
          onClick={() => handleLightMode("police")}
          title="Police Lights"
        >
          <LightningFill />
        </button>
        <button
          className={`control-btn ${activeMode === "stars" ? "active" : ""}`}
          onClick={() => handleLightMode("stars")}
          title="Stars Effect"
        >
          <Stars />
        </button>
        <button
          className={`control-btn ${activeMode === "off" ? "active" : ""}`}
          onClick={handleTurnOff}
          title="Turn Off"
        >
          <LightbulbOff />
        </button>
      </div>

      {activeMode === "breath" && (
        <div className="color-picker-container mt-3">
          <Form.Label>Breathing Color</Form.Label>
          <Form.Control
            type="color"
            value={rgbToHex(breathColor.r, breathColor.g, breathColor.b)}
            onChange={(e) => handleColorChange(e.target.value)}
            title="Choose breathing effect color"
          />
        </div>
      )}
    </Card>
  )
}
