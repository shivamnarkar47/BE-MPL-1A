import { deleteCookie } from "@/lib/getUser"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"

const Logout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    deleteCookie();
    location.reload()
    location.href="/"
  }
  

  return (
    <div className="mx-auto flex-col gap-y-9 min-h-[90vh] flex items-center justify-center ">
      <p className="p-4 font-bold text-3xl tracking-tighter "> Want to confirm your Logout ?</p>
      <div className="gap-9 flex">
        <Button onClick={handleLogout}>Logout</Button>
        <Button variant={'secondary'} onClick={()=>navigate("/home")}>Get Back</Button>
      </div>
    </div>
  )
}

export default Logout
