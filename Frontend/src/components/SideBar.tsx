import { Home, Search, Library, Inbox, Bell, User, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

// ĐỒNG BỘ: Sửa đường dẫn nút Home từ "/" thành "/home" cho khớp với URL của bạn
const primaryNav: NavItem[] = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/search", label: "Search", icon: Search },
  { path: "/library", label: "Your Library", icon: Library },
];

const secondaryNav: NavItem[] = [
  { path: "/inbox", label: "Shared Inbox", icon: Inbox },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/profile", label: "Profile", icon: User },
];

const SideBar = ({ onOpenAuth }: { onOpenAuth: () => void }) => {
  // Gom hàm tạo CSS ra ngoài nhìn cho đỡ rối mắt
  const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-4 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
    }`;

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-2 p-2 bg-black h-full select-none">
      {/* Hộp 1: Logo & Menu chính */}
      <div className="rounded-lg bg-zinc-900 p-4">
        <div className="mb-4 flex items-center gap-2 px-2 pt-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-500 text-black">
            <Library className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Soundwave</span>
        </div>
        
        <nav className="flex flex-col gap-1">
          {primaryNav.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className={getLinkStyle}>
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Hộp 2: Menu phụ */}
      <div className="flex flex-1 flex-col justify-between rounded-lg bg-zinc-900 p-3">
        <nav className="flex flex-col gap-1">
          {secondaryNav.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className={getLinkStyle}>
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hộp 3: Menu logout/login/signup */}
        <div className="border-t border-zinc-800/40 pt-4 px-2">
          <button
            onClick={onOpenAuth}
            className="flex w-full cursor-pointer items-center justify-center rounded-full bg-green-500 py-2.5 text-sm font-bold text-black transition-transform hover:bg-green-400 active:scale-95"
          >
            <span>Log out</span> 
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
