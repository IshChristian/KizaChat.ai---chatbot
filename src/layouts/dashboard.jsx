import Sidebar from "./sidebar"
import Navbar from "./navbar"

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-white">
      <Sidebar className="fixed z-1" />
      <div className="flex-grow flex flex-col">
        {/* <Navbar className="z-0" /> */}
        <main className="flex-grow">{children}</main>
      </div>
    </div>
  )
}

export default Layout

