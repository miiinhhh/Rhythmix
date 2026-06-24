import { Home, Search, Library, Inbox, Bell, User, Moon, Sun, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

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
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();

  const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-4 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-slate-300 dark:bg-zinc-800 text-slate-950 dark:text-white font-semibold"
        : "text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800/50"
    }`;

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-2 p-2 bg-slate-200 dark:bg-black h-full select-none">
      {/* Hộp 1: Logo & Menu chính */}
      <div className="rounded-lg bg-slate-100 dark:bg-zinc-900 p-4">
        <div className="mb-4 flex items-center gap-2 px-2 pt-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-green-500 text-black">
            <Library className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Rhythmix</span>
        </div>

        <nav className="flex flex-col gap-1">
          {primaryNav.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className={getLinkStyle as any}>
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Hộp 2: Menu phụ */}
      <div className="flex flex-1 flex-col justify-between rounded-lg bg-slate-100 dark:bg-zinc-900 p-3">
        <nav className="flex flex-col gap-1">
          {secondaryNav.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className={getLinkStyle as any}>
              <div className="relative flex items-center gap-4 w-full">
                <Icon className="size-5" />
                <span className="flex-1">{label}</span>

                {/* Unread notification badge */}
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 text-black text-xs font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Hộp 3: Theme toggle */}
        <div className="border-t border-slate-300 dark:border-zinc-800/40 pt-4 px-2 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-300 dark:bg-zinc-800 hover:bg-slate-400 dark:hover:bg-zinc-700 py-2 px-3 text-sm font-medium text-slate-800 dark:text-zinc-300 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            type="button"
          >
            {isDark ? (
              <>
                <Sun className="size-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="size-4" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenAuth}
            className="flex w-full cursor-pointer items-center justify-center rounded-full bg-green-500 py-2.5 text-sm font-bold text-black transition-transform hover:bg-green-400 active:scale-95"
            type="button"
          >
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;

