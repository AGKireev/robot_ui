import React from "react"
import { Card } from "react-bootstrap"
import { useServerIp } from "../contexts/ServerContext"

export const VideoFeed: React.FC = () => {
  const serverIp = useServerIp()

  return (
    <Card className="shadow-sm h-100 p-0">
      <div className="video-feed-container">
        <img src={`http://${serverIp}:8000/video_feed`} alt="Video Feed" />
      </div>
    </Card>
  )
}
