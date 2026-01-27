import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

const UserHomePage = () => {

  return (
    <div className="flex bg-slate-50 min-h-screen overflow-x-hidden w-full">
      <Sidebar />
      <main className="flex-1 ml-20 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export default UserHomePage
