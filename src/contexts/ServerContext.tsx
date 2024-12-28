import React, { createContext, useContext } from "react"

const ServerContext = createContext<string>("")

export const ServerProvider: React.FC<{
  serverIp: string
  children: React.ReactNode
}> = ({ serverIp, children }) => {
  return (
    <ServerContext.Provider value={serverIp}>{children}</ServerContext.Provider>
  )
}

export const useServerIp = () => useContext(ServerContext)
