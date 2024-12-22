import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Row, Col, Button, ProgressBar } from 'react-bootstrap';

if (!import.meta.env.VITE_SERVER_IP || !import.meta.env.VITE_AUTHORIZATION) {
  console.error('Missing environment variables: VITE_SERVER_IP or VITE_AUTHORIZATION');
  throw new Error('Please set VITE_SERVER_IP and VITE_AUTHORIZATION in your .env file.');
}

const serverIp = import.meta.env.VITE_SERVER_IP;
const authorization = import.meta.env.VITE_AUTHORIZATION;

// WebSocket Context
const WebSocketContext = createContext<WebSocket | null>(null);

const WebSocketProvider: React.FC<{ url: string; children: React.ReactNode }> = ({ url, children }) => {
  const [connectionStatus, setConnectionStatus] = useState<string>('🔄 Connecting...');
  const [status, setStatus] = useState([
    { label: 'CPU Temp', value: 50, unit: '°C', warning: 70, danger: 85 },
    { label: 'CPU Usage', value: 75, unit: '%', warning: 70, danger: 90 },
    { label: 'RAM Usage', value: 65, unit: '%', warning: 80, danger: 95 },
  ]);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connection established. Sending authentication message.');
      ws.current?.send(authorization); // Authenticate
      setConnectionStatus('✅ Connected');
    };

    ws.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
      try {
        const message = JSON.parse(event.data);
        if (message.title === 'get_info') {
          console.log('Status update received:', message.data);
          setStatus([
            { label: 'CPU Temp', value: parseFloat(message.data[0]), unit: '°C', warning: 70, danger: 85 },
            { label: 'CPU Usage', value: parseFloat(message.data[1]), unit: '%', warning: 70, danger: 90 },
            { label: 'RAM Usage', value: parseFloat(message.data[2]), unit: '%', warning: 80, danger: 95 },
          ]);
        }
      } catch (error) {
        if (event.data.includes('congratulation')) {
          console.log('Authentication successful.');
        } else if (event.data.includes('sorry')) {
          console.error('Authentication failed.');
          setConnectionStatus('❌ Authentication Error');
        }
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('❌ Connection Error');
    };

    ws.current.onclose = () => {
      console.warn('WebSocket connection closed. Retrying...');
      setConnectionStatus('❌ Disconnected');
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return (
    <WebSocketContext.Provider value={ws.current}>
      {children}
      <Navbar bg="dark" variant="dark" fixed="top" className="px-3">
        <Container fluid>
          <Navbar.Brand href="#home">
            {connectionStatus}
          </Navbar.Brand>
          <div className="d-flex align-items-center">
            {status.map((stat, index) => (
              <div key={index} className="mx-2" style={{ width: '120px' }}>
                <ProgressBar
                  now={stat.value}
                  max={stat.danger}
                  variant={
                    stat.value > stat.danger
                      ? 'danger'
                      : stat.value > stat.warning
                      ? 'warning'
                      : 'success'
                  }
                  label={`${stat.label}: ${stat.value}${stat.unit}`}
                />
              </div>
            ))}
          </div>
        </Container>
      </Navbar>
    </WebSocketContext.Provider>
  );
};

const useWebSocket = () => useContext(WebSocketContext);

const sendCommand = (ws: WebSocket | null, command: string) => {
  if (ws?.readyState === WebSocket.OPEN) {
    console.log(`Sending command: ${command}`);
    ws.send(command);
  } else {
    console.error('WebSocket is not open. Cannot send command.');
  }
};

const VideoFeed: React.FC = () => {
  return (
    <div className="video-feed" style={{ width: '100%', height: 'auto' }}>
      <img
        src={`http://${serverIp}:5000/video_feed`}
        alt="Video Feed"
        style={{ width: '100%', maxHeight: '400px', background: '#000' }}
      />
    </div>
  );
};

const MovementControl: React.FC = () => {
  const ws = useWebSocket();

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'w':
        sendCommand(ws, 'forward');
        break;
      case 'a':
        sendCommand(ws, 'left');
        break;
      case 's':
        sendCommand(ws, 'backward');
        break;
      case 'd':
        sendCommand(ws, 'right');
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (['w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
      sendCommand(ws, 'TS');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="movement-controls">
      <div className="d-flex justify-content-center mb-3">
        <Button
          variant="secondary"
          className="mx-2"
          onMouseDown={() => sendCommand(ws, 'forward')} onMouseUp={() => sendCommand(ws, 'DS')}
        >
          ⬆
        </Button>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <Button
          variant="secondary"
          className="mx-2"
          onMouseDown={() => sendCommand(ws, 'left')} onMouseUp={() => sendCommand(ws, 'TS')}
        >
          ⬅
        </Button>
        <Button
          variant="secondary"
          className="mx-2"
          onMouseDown={() => sendCommand(ws, 'backward')} onMouseUp={() => sendCommand(ws, 'DS')}
        >
          ⬇
        </Button>
        <Button
          variant="secondary"
          className="mx-2"
          onMouseDown={() => sendCommand(ws, 'right')} onMouseUp={() => sendCommand(ws, 'TS')}
        >
          ➡
        </Button>
      </div>
    </div>
  );
};

const CameraControl: React.FC = () => {
  const ws = useWebSocket();

  const handleCameraCommand = (command: string, stopCommand: string) => {
    sendCommand(ws, command);
    setTimeout(() => sendCommand(ws, stopCommand), 50); // Send stop command after 50ms
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'i':
        handleCameraCommand('up', 'UDstop');
        break;
      case 'j':
        handleCameraCommand('lookleft', 'LRstop');
        break;
      case 'k':
        handleCameraCommand('down', 'UDstop');
        break;
      case 'l':
        handleCameraCommand('lookright', 'LRstop');
        break;
      case 'h':
        sendCommand(ws, 'camera_home');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="camera-controls">
      <div className="d-flex justify-content-center mb-3">
        <Button
          variant="secondary"
          className="mx-2"
          onClick={() => handleCameraCommand('up', 'UDstop')}
        >
          UP
        </Button>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <Button
          variant="secondary"
          className="mx-2"
          onClick={() => handleCameraCommand('lookleft', 'LRstop')}
        >
          LEFT
        </Button>
        <Button
          variant="secondary"
          className="mx-2"
          onClick={() => handleCameraCommand('down', 'UDstop')}
        >
          DOWN
        </Button>
        <Button
          variant="secondary"
          className="mx-2"
          onClick={() => handleCameraCommand('lookright', 'LRstop')}
        >
          RIGHT
        </Button>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="warning"
          onClick={() => sendCommand(ws, 'camera_home')}
        >
          HOME
        </Button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WebSocketProvider url={`ws://${serverIp}:8000`}>
      <Container fluid className="py-3" style={{ paddingTop: '56px' }}> {/* Adjust padding for fixed header */}
        <Row className="flex-wrap">
          <Col lg={8} sm={12} className="mb-3">
            <VideoFeed />
          </Col>
          <Col lg={4} sm={12} className="d-flex flex-column">
            <MovementControl />
            <CameraControl />
          </Col>
        </Row>
      </Container>
    </WebSocketProvider>
  );
};

export default App;
