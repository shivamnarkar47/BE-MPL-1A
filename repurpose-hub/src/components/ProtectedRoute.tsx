import { getCookie } from '@/lib/getUser'
import { Navigate, Outlet } from 'react-router-dom'
const ProtectedRoute = () => {
  const user = getCookie();
  console.log(user)
  if (user != null) {
    return (
      <Outlet />
    )
  }
  else {
    <Navigate to="/" replace={true}  />
  }

}

export default ProtectedRoute
