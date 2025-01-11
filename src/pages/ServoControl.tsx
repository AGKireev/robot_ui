import React, { useState } from "react"
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  ButtonGroup,
  Button,
  InputGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap"
import { useWebSocket } from "../contexts/WebSocketContext"

interface Servo {
  id: number
  name: string
  type: "horizontal" | "vertical"
  leg: string
}

interface CommandResponse {
  status: "ok" | "error"
  positions?: { [key: string]: number }
  message?: string
}

const SERVOS: Servo[] = [
  // Left Side
  { id: 0, name: "I Horizontal", type: "horizontal", leg: "left_I" },
  { id: 1, name: "I Vertical", type: "vertical", leg: "left_I" },
  { id: 2, name: "II Horizontal", type: "horizontal", leg: "left_II" },
  { id: 3, name: "II Vertical", type: "vertical", leg: "left_II" },
  { id: 4, name: "III Horizontal", type: "horizontal", leg: "left_III" },
  { id: 5, name: "III Vertical", type: "vertical", leg: "left_III" },
  // Right Side
  { id: 10, name: "III Horizontal", type: "horizontal", leg: "right_III" },
  { id: 11, name: "III Vertical", type: "vertical", leg: "right_III" },
  { id: 8, name: "II Horizontal", type: "horizontal", leg: "right_II" },
  { id: 9, name: "II Vertical", type: "vertical", leg: "right_II" },
  { id: 6, name: "I Horizontal", type: "horizontal", leg: "right_I" },
  { id: 7, name: "I Vertical", type: "vertical", leg: "right_I" },
  // Camera
  { id: 12, name: "Camera Left/Right", type: "horizontal", leg: "camera" },
  { id: 13, name: "Camera Up/Down", type: "vertical", leg: "camera" },
]

const ServoControl: React.FC = () => {
  const { sendMessage } = useWebSocket()
  const [selectedServos, setSelectedServos] = useState<number[]>([])
  const [operation, setOperation] = useState<
    "set" | "save" | "center" | "reset"
  >("set")
  const [direction, setDirection] = useState<1 | -1>(1)
  const [steps, setSteps] = useState<number>(1)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVariant, setToastVariant] = useState<"success" | "danger">(
    "success"
  )

  const handleSelectAll = () => {
    const legServos = SERVOS.filter((servo) => servo.leg !== "camera").map(
      (servo) => servo.id
    )
    setSelectedServos((prev) => {
      const allLegsSelected = legServos.every((id) => prev.includes(id))
      return allLegsSelected
        ? prev.filter((id) => !legServos.includes(id))
        : [...new Set([...prev, ...legServos])]
    })
  }

  const handleSelectLeg = (leg: string) => {
    const servosForLeg = SERVOS.filter((servo) => servo.leg === leg).map(
      (servo) => servo.id
    )
    setSelectedServos((prev) => {
      const allSelected = servosForLeg.every((id) => prev.includes(id))
      if (allSelected) {
        return prev.filter((id) => !servosForLeg.includes(id))
      }
      return [...new Set([...prev, ...servosForLeg])]
    })
  }

  const handleServoToggle = (servoId: number) => {
    setSelectedServos((prev) => {
      if (prev.includes(servoId)) {
        return prev.filter((id) => id !== servoId)
      }
      return [...prev, servoId]
    })
  }

  const handleExecute = async () => {
    if (selectedServos.length === 0) {
      setToastMessage("Please select at least one servo")
      setToastVariant("danger")
      setShowToast(true)
      return
    }

    const command = {
      command: operation === "set" ? "servo_set" : `servo_${operation}`,
      servos: selectedServos,
      ...(operation === "set" && {
        direction,
        steps,
      }),
    }

    try {
      const response = await sendMessage(command)
      const result: CommandResponse = JSON.parse(response)

      if (result.status === "ok") {
        setToastMessage(
          result.positions
            ? `Command executed successfully. New positions: ${Object.entries(
                result.positions
              )
                .map(
                  ([id, pos]) =>
                    `${SERVOS.find((s) => s.id === parseInt(id))?.name}: ${pos}`
                )
                .join(", ")}`
            : "Command executed successfully"
        )
        setToastVariant("success")
      } else {
        setToastMessage(`Error: ${result.message || "Unknown error"}`)
        setToastVariant("danger")
      }
    } catch (error) {
      setToastMessage(`Failed to execute command: ${error}`)
      setToastVariant("danger")
    }
    setShowToast(true)
  }

  return (
    <Container className="servo-control">
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === "success" ? "Success" : "Error"}
            </strong>
          </Toast.Header>
          <Toast.Body
            className={toastVariant === "success" ? "text-white" : ""}
          >
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Card className="mt-4">
        <Card.Body>
          {/* Leg Controls Section */}
          <div className="text-center mb-4">
            <h6 className="mb-3">Leg Controls</h6>
            {/* Quick Selection Buttons for Legs */}
            <div className="mb-4 d-flex justify-content-center">
              <ButtonGroup className="me-2">
                <Button
                  variant="secondary"
                  onClick={() => handleSelectLeg("left_I")}
                >
                  Left I
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSelectLeg("left_II")}
                >
                  Left II
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSelectLeg("left_III")}
                >
                  Left III
                </Button>
              </ButtonGroup>
              <Button
                variant="secondary"
                onClick={handleSelectAll}
                className="mx-2"
                style={{ width: "160px" }}
              >
                Select/Deselect All Legs
              </Button>
              <ButtonGroup className="ms-2">
                <Button
                  variant="secondary"
                  onClick={() => handleSelectLeg("right_I")}
                >
                  Right I
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSelectLeg("right_II")}
                >
                  Right II
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSelectLeg("right_III")}
                >
                  Right III
                </Button>
              </ButtonGroup>
            </div>

            {/* Leg Servo Selection */}
            <div className="d-flex justify-content-center mb-4">
              <div className="d-flex gap-5">
                {/* Left Side */}
                <div>
                  {SERVOS.filter((servo) => servo.leg.startsWith("left")).map(
                    (servo) => (
                      <div
                        key={servo.id}
                        className="d-flex align-items-center justify-content-end mb-2"
                        style={{ minWidth: "180px" }}
                      >
                        <span className="me-2">{servo.name}</span>
                        <Form.Check
                          type="checkbox"
                          id={`servo-${servo.id}`}
                          checked={selectedServos.includes(servo.id)}
                          onChange={() => handleServoToggle(servo.id)}
                          label=""
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Right Side */}
                <div>
                  {SERVOS.filter((servo) => servo.leg.startsWith("right")).map(
                    (servo) => (
                      <div
                        key={servo.id}
                        className="d-flex align-items-center mb-2"
                        style={{ minWidth: "180px" }}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`servo-${servo.id}`}
                          checked={selectedServos.includes(servo.id)}
                          onChange={() => handleServoToggle(servo.id)}
                          label=""
                        />
                        <span className="ms-2">{servo.name}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Camera Controls Section */}
          <div className="text-center mb-4">
            <h6 className="mb-3">Camera Controls</h6>
            <Button
              variant="secondary"
              onClick={() => handleSelectLeg("camera")}
              className="mb-3"
            >
              Select Camera Servos
            </Button>
            <div className="d-flex justify-content-center">
              <div style={{ maxWidth: "400px" }}>
                {SERVOS.filter((servo) => servo.leg === "camera").map(
                  (servo) => (
                    <Form.Check
                      key={servo.id}
                      type="checkbox"
                      id={`servo-${servo.id}`}
                      label={servo.name}
                      checked={selectedServos.includes(servo.id)}
                      onChange={() => handleServoToggle(servo.id)}
                      className="mb-2"
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Operation Controls */}
          <Row className="mb-4">
            <Col>
              <ButtonGroup className="w-100">
                <Button
                  variant={operation === "set" ? "primary" : "outline-primary"}
                  onClick={() => setOperation("set")}
                >
                  Set
                </Button>
                <Button
                  variant={operation === "save" ? "success" : "outline-success"}
                  onClick={() => setOperation("save")}
                >
                  Save
                </Button>
                <Button
                  variant={operation === "center" ? "info" : "outline-info"}
                  onClick={() => setOperation("center")}
                >
                  Center
                </Button>
                <Button
                  variant={operation === "reset" ? "danger" : "outline-danger"}
                  onClick={() => setOperation("reset")}
                >
                  Reset
                </Button>
              </ButtonGroup>
            </Col>
          </Row>

          {/* Set Operation Controls */}
          {operation === "set" && (
            <Row className="mb-4">
              <Col md={6}>
                <Form.Label>Direction</Form.Label>
                <ButtonGroup className="w-100">
                  <Button
                    variant={direction === -1 ? "primary" : "outline-primary"}
                    onClick={() => setDirection(-1)}
                  >
                    Decrease (-)
                  </Button>
                  <Button
                    variant={direction === 1 ? "primary" : "outline-primary"}
                    onClick={() => setDirection(1)}
                  >
                    Increase (+)
                  </Button>
                </ButtonGroup>
              </Col>
              <Col md={6}>
                <Form.Label>Steps (1-20)</Form.Label>
                <InputGroup>
                  <Button
                    variant="outline-primary"
                    onClick={() => setSteps((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    min={1}
                    max={20}
                    value={steps}
                    onChange={(e) =>
                      setSteps(
                        Math.min(20, Math.max(1, parseInt(e.target.value) || 1))
                      )
                    }
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => setSteps((prev) => Math.min(20, prev + 1))}
                  >
                    +
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          )}

          {/* Execute Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-100"
            onClick={handleExecute}
            disabled={selectedServos.length === 0}
          >
            Execute {operation.charAt(0).toUpperCase() + operation.slice(1)}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ServoControl
