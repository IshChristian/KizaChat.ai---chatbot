import Sidebar from "./sidebar"
import Navbar from "./navbar"

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-grow flex flex-col">
        <Navbar />
        <main className="flex-grow p-4 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default Layout

