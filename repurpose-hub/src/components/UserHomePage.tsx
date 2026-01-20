import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

const UserHomePage = () => {

  return (
    <div className="flex max-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20  overflow-auto">
        <Outlet/>
      </main>
    </div>
  )
}

export default UserHomePage
