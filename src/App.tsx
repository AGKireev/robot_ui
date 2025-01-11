import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import {
  Container,
  Navbar,
  Row,
  Col,
  ProgressBar,
  Offcanvas,
  Nav,
  Button,
} from "react-bootstrap"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import "./App.css"
import { VideoFeed } from "./components/VideoFeed"
import { MovementControl } from "./components/MovementControl"
import { CameraControl } from "./components/CameraControl"
import { LightControls } from "./components/LightControls"
import { ServerProvider } from "./contexts/ServerContext"
import ServoControl from "./pages/ServoControl"
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
  const [showNav, setShowNav] = useState(false)

  console.log("[Status Display] Rendering with:", { connectionStatus, status })

  return (
    <>
      <Navbar bg="dark" variant="dark" fixed="top" className="px-3 mb-3">
        <Container fluid>
          <Button
            variant="outline-light"
            className="me-2 d-flex align-items-center"
            onClick={() => setShowNav(true)}
            style={{ padding: "4px 8px" }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </Button>
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

      <Offcanvas
        show={showNav}
        onHide={() => setShowNav(false)}
        placement="start"
        className="bg-dark text-light"
      >
        <Offcanvas.Header
          closeButton
          className="border-bottom border-secondary"
        >
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link
              as={Link}
              to="/"
              onClick={() => setShowNav(false)}
              className="text-light"
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/servo-control"
              onClick={() => setShowNav(false)}
              className="text-light"
            >
              Servo Control
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

const MainContent: React.FC = () => {
  return (
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
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <ServerProvider serverIp={serverIp}>
        <WebSocketProvider
          url={`ws://${serverIp}:8000/ws`}
          authorization={authorization}
        >
          <div className="main-container">
            <StatusDisplay />
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/servo-control" element={<ServoControl />} />
            </Routes>
          </div>
        </WebSocketProvider>
      </ServerProvider>
    </Router>
  )
}

export default App
