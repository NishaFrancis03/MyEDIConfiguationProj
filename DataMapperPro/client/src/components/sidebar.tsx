import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Settings
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Mappings", path: "/mappings", icon: ArrowLeftRight },
    { name: "History", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-primary shadow-lg flex-shrink-0 h-full">
      <div className="p-4 bg-primary-dark">
        <h1 className="text-white text-xl font-medium">Data Mapper</h1>
      </div>
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link href={item.path}>
                <a
                  className={cn(
                    "flex items-center text-white py-2 px-4 rounded",
                    isActive(item.path)
                      ? "bg-primary-light"
                      : "hover:bg-primary-light"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
