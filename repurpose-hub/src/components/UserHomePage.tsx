import { Outlet, Route, Routes } from "react-router-dom"
import MarketPlace from "./MarketPlace"
import Sidebar from "./Sidebar"
import Donation from "./Donation"

const UserHomePage = () => {

  return (
    <div className="flex">
      <Sidebar />
      <Outlet/>
    </div>
  )
}

export default UserHomePage
