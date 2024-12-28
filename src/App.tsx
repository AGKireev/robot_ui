import React from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Container, Navbar, Row, Col, ProgressBar } from "react-bootstrap"
import "./App.css"
import { VideoFeed } from "./components/VideoFeed"
import { MovementControl } from "./components/MovementControl"
import { CameraControl } from "./components/CameraControl"
import { LightControls } from "./components/LightControls"
import { ServerProvider } from "./contexts/ServerContext"
import {
  WebSocketProvider,
  useConnectionStatus,
  useStatus,
} from "./contexts/WebSocketContext"

if (!import.meta.env.VITE_SERVER_IP || !import.meta.env.VITE_AUTHORIZATION) {
  console.error(
    "Missing environment variables: VITE_SERVER_IP or VITE_AUTHORIZATION"
  )
  throw new Error(
    "Please set VITE_SERVER_IP and VITE_AUTHORIZATION in your .env file."
  )
}

const serverIp = import.meta.env.VITE_SERVER_IP
const authorization = import.meta.env.VITE_AUTHORIZATION

const StatusDisplay: React.FC = () => {
  const connectionStatus = useConnectionStatus()
  const status = useStatus()

  console.log("[Status Display] Rendering with:", { connectionStatus, status })

  return (
    <Navbar bg="dark" variant="dark" fixed="top" className="px-3 mb-3">
      <Container fluid>
        <Navbar.Brand>{connectionStatus}</Navbar.Brand>
        <div className="d-flex align-items-center">
          {status.map((stat, index) => (
            <div key={index} className="mx-2" style={{ width: "150px" }}>
              <div className="text-light small mb-1">{stat.label}</div>
              <ProgressBar
                now={stat.value}
                max={stat.danger}
                variant={
                  stat.value > stat.danger
                    ? "danger"
                    : stat.value > stat.warning
                    ? "warning"
                    : "success"
                }
                label={`${stat.value.toFixed(1)}${stat.unit}`}
              />
            </div>
          ))}
        </div>
      </Container>
    </Navbar>
  )
}

const App: React.FC = () => {
  return (
    <ServerProvider serverIp={serverIp}>
      <WebSocketProvider
        url={`ws://${serverIp}:8000/ws`}
        authorization={authorization}
      >
        <div className="main-container">
          <StatusDisplay />
          <Container fluid className="h-100">
            <Row className="g-3">
              <Col lg={8} md={12}>
                <VideoFeed />
              </Col>
              <Col lg={4} md={12} className="controls-column">
                <MovementControl />
                <CameraControl />
                <LightControls />
              </Col>
            </Row>
          </Container>
        </div>
      </WebSocketProvider>
    </ServerProvider>
  )
}

export default App
