import { getCookie } from '@/lib/getUser';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  ShoppingCart,
  Videotape,
  Leaf,
  Sparkles,
  User,
  LayoutDashboard,
  LogOut,
  Settings,
  Home
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = getCookie();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const navItems = [
    { label: "Overview", icon: Home, path: "/home" },
    { label: "Tutorials", icon: Videotape, path: "/home/tutorials" },
    { label: "Donation", icon: HandCoins, path: "/home/donations" },
    { label: "Cart", icon: ShoppingCart, path: "/cart" },
    { label: "Genius", icon: Brain, path: "/home/genius" },
    { label: "Eco Impact", icon: Leaf, path: "/home/impact" },
    { label: "Style Quiz", icon: Sparkles, path: "/home/quiz" },
    { label: "Profile", icon: User, path: "/home/profile" },
  ];

  if (user?.role === "admin") {
    navItems.push({ label: "Admin", icon: LayoutDashboard, path: "/home/admin" });
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out z-50 overflow-hidden",
        isSidebarOpen ? "w-72" : "w-20"
      )}
    >
      {/* Glassmorphic Background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-2xl shadow-slate-200/50" />

      <div className="relative flex flex-col h-full pointer-events-auto overflow-hidden">
        {/* Toggle Button Container */}
        <div className={cn(
          "p-4 flex items-center mb-2",
          isSidebarOpen ? "justify-between" : "justify-center"
        )}>
          {isSidebarOpen && (
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 italic">RePurp</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-xl hover:bg-slate-100 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-x-hidden no-scrollbar py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group relative flex items-center py-2.5 rounded-xl transition-all duration-300",
                  isSidebarOpen ? "px-4" : "justify-center px-0",
                  isActive
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isSidebarOpen ? "mr-3" : ""
                )} />
                {isSidebarOpen && (
                  <span className="text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 mt-auto">
          <div className={cn(
            "rounded-2xl transition-all duration-300 overflow-hidden",
            isSidebarOpen
              ? "bg-slate-50/50 border border-slate-200/50 p-4"
              : "p-0 flex flex-col items-center gap-4"
          )}>
            {isSidebarOpen ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      className="w-10 h-10 object-cover rounded-xl ring-2 ring-white shadow-sm"
                      src="https://avatars.githubusercontent.com/u/59228569"
                      alt="Profile"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-950 truncate">
                      {user?.full_name || "Guest User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate lowercase">
                      {user?.email || "Connect to explore"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5 border-slate-200">
                    <Settings className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-transparent">
                    <LogOut className="w-3.5 h-3.5" />
                    Exit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group relative flex flex-col items-center gap-4">
                <div className="p-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                  <img
                    className="w-10 h-10 object-cover rounded-lg ring-2 ring-white shadow-sm"
                    src="https://avatars.githubusercontent.com/u/59228569"
                    alt="Profile"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
