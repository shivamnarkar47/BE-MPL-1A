import { getCookie } from '@/lib/getUser';
import { useState } from 'react'
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { BookX, Brain, ChevronLeft, ChevronRight, HandCoins, ShoppingCart, Videotape } from 'lucide-react';
import { Link } from 'react-router-dom';
const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = getCookie();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <section>
      <div className={cn(isSidebarOpen ? "absolute z-30 md:flex md:h-[80vh]  w-full" : "flex md:min-h-[90vh] z-10")}>
        {/* Sidebar */}
        <aside
          className={`${isSidebarOpen ? "w-full md:w-80 p-10 items-left h-[90svh]" : "w-20 px-2 py-10 items-center"} bg-white flex flex-col justify-between transition-width duration-100`
          }
        >
          <div>
            {/* Logo */}
            <Button size={'icon'} className='bg-transparent text-gray-500 hover:bg-gray-100' onClick={toggleSidebar}>
              {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </Button>
            <nav className=" mt-5 ">
              <ul className="space-y-3 border-b border-gray-200 pb-3">
                <li className='my-3'>
                  <Link to="/home" className="group flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-black hover:text-white rounded-lg">
                    <BookX />
                    <span
                      className={`${isSidebarOpen ? "block ml-3" : "hidden"}`}
                    >
                      Overview
                    </span>
                  </Link>

                </li>
                <li className='my-3'>
                  <Link to="/home/tutorials" className="group flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-black hover:text-white rounded-lg">
                    <Videotape />
                    <span
                      className={`${isSidebarOpen ? "block ml-3" : "hidden"}`}
                    >
                      Tutorials
                    </span>
                  </Link>
                </li>
                <li className='my-3'>
                  <Link to="/home/donations" className="group flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-black hover:text-white rounded-lg">
                    <HandCoins />
                    <span
                      className={`${isSidebarOpen ? "block ml-3" : "hidden"}`}
                    >
                      Donation
                    </span>
                  </Link>
                </li>
                <li className='my-3'>
                  <Link to="/cart" className="group flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-black hover:text-white rounded-lg">
                    <ShoppingCart />
                    <span
                      className={`${isSidebarOpen ? "block ml-3" : "hidden"}`}
                    >
                      Cart
                    </span>
                  </Link>
                </li>
                <li className='my-3'>
                  <Link to="/home/genius" className="group flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-black hover:text-white rounded-lg">
                    <Brain />
                    <span
                      className={`${isSidebarOpen ? "block ml-3" : "hidden"}`}
                    >
                      Genius
                    </span>
                  </Link>
                </li>

              </ul>

            </nav>
          </div>

          <div className="flex flex-col gap-10">

            {isSidebarOpen ? (
              <div>
                <div className="group flex items-center pr-3 py-2 text-sm text-gray-500 rounded-lg justify-between cursor-pointer">
                  <span className="flex items-center">
                    <img
                      className="mr-3 w-10 h-10 object-cover rounded-full"
                      src="https://avatars.githubusercontent.com/u/59228569"
                      alt=""
                    />
                    <p className="flex flex-col">
                      <span className="text-sm text-black font-bold">
                        {user?.full_name}
                      </span>
                      <span className="text-sm ">{user?.email}</span>
                    </p>
                  </span>

                </div>
              </div>
            ) : (
              <img
                className="mr-3 w-10 h-10 object-cover rounded-full"
                src="https://avatars.githubusercontent.com/u/59228569"
                alt=""
              />
            )}
          </div>
        </aside>

        {/* Main Content */}
      </div>


    </section>
  );
}

export default Sidebar
