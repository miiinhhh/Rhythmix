import SideBar from "../components/SideBar";
import PlayerBar from "../components/PlayerBar";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import AuthModal from "../components/AuthModal";

const AppLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // Hàm xử lý khi user đăng nhập/đăng ký thành công từ Modal
  const handleAuthSuccess = (name: string) => {
    setIsAuthenticated(true); // Đánh dấu đã đăng nhập thành công 
  };
  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white select-none font-sans">
      <AuthModal
        open={!isAuthenticated}
        onClose={() => undefined}
        onAuthenticated={handleAuthSuccess}
      />

      {isAuthenticated && (
        <>
          <div className="flex min-h-0 flex-1">
            <SideBar onOpenAuth={() => setIsAuthenticated(false)} />

            <main className="m-2 ml-0 flex-1 overflow-y-auto rounded-lg bg-zinc-900 p-6">
              <Outlet />
            </main>
          </div>

          <PlayerBar />
        </>
      )}
    </div>
  );
};

export default AppLayout;
