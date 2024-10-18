import { deleteCookie, getCookie } from '@/lib/getUser';
import { cn } from '@/lib/utils';
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from "@/assets/logo.png"
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = getCookie();
  console.log(user)
  const navigate = useNavigate();
  const location = useLocation();

  console.log(location.pathname)
  return (
    <section className={cn(!user?.id ? "fixed w-full bg-white dark:bg-black z-10 border" : "flex w-full bg-white dark:bg-black z-10 border")}>
      <nav className="font-inter mx-auto h-auto w-full max-w-screen-2xl lg:relative lg:top-0">
        <div className="flex flex-col px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-4 xl:px-20">
          {user?.id ? (
            <Link to={'/home'}
              onClick={() => {
                setIsOpen(!isOpen);
              }}

            >
              <img src={Logo} className="w-10" />
            </Link>
          )
            :
            (
              location.pathname != "/" ?
                (
                  <Link to={'/'}
                    onClick={() => {
                      setIsOpen(!isOpen);
                    }}
                  >

                    <img src={Logo} className="w-10" />

                  </Link>
                ) :
                (
                  <a href='#home'>
                    <img src={Logo} className="w-10" />
                  </a>
                )
            )
          }

          {location.pathname == "/" && (
            <div
              className={`mt-14 flex flex-col space-y-8 lg:mt-0 lg:flex lg:flex-row lg:space-x-1 lg:space-y-0 ${isOpen ? "" : "hidden"}`}
            >
              <a
                href="#about"
                className="font-inter rounded-lg lg:px-6 lg:py-4 lg: lg:hover:text-gray-800"
                onClick={() => {
                  setIsOpen(!isOpen);
                }}

              >
                About
              </a>
              <a
                href="#why-us"
                className="font-inter rounded-lg lg:px-6 lg:py-4 lg: lg:hover:text-gray-800"
                onClick={() => {
                  setIsOpen(!isOpen);
                }}

              >
                Why us ?
              </a>
            </div>
          )
          }
          <div
            className={`flex flex-col items-center space-y-8 lg:flex lg:flex-row lg:space-x-3 lg:space-y-0 ${isOpen ? "" : "hidden"}`}
          >

            {
              !user?.id ? (
                <>

                  <Link
                    className="font-inter rounded-lg bg-black dark:bg-gray-100 dark:text-black px-8 py-4 text-center text-white hover:bg-gray-800"
                    onClick={() => {
                      setIsOpen(!isOpen);
                    }}

                    to="/register"
                  >
                    Sign Up
                  </Link>
                  <Link
                    className="font-inter rounded-lg bg-white border dark:bg-gray-100 dark:text-black px-8 py-4 text-center text-black hover:bg-gray-200"
                    onClick={() => {
                      setIsOpen(!isOpen);
                    }}

                    to="/login"
                  >
                    Login
                  </Link>


                </>

              ) : (
                <button
                  className="font-inter rounded-lg bg-black dark:bg-gray-100 dark:text-black px-8 py-4 text-center text-white hover:bg-gray-800"
                  onClick={async () => {
                   navigate("/logout") 
                  }}
                >
                  Logout
                </button>


              )}
          </div>
          <button
            className="absolute right-5 lg:hidden"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.75 12H20.25"
                stroke="#160042"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M3.75 6H20.25"
                stroke="#160042"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M3.75 18H20.25"
                stroke="#160042"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
        </div>
      </nav>
    </section >
  );
}

export default Navbar
