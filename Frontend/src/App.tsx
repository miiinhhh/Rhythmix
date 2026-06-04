import SideBar from "./components/SideBar";
import NavBar from "./components/NavBar";
import MainContent from "./components/MainContent.tsx";
import PlayerBar from "./components/PlayerBar";
import TopBar from "./components/TopBar.tsx";

function App() {
  return (
    // Grid 3 cột (Sidebar, Main, Navbar) và 3 hàng (TopBar, MainContent, PlayerBar)
    <div className="h-screen w-screen bg-black text-white p-2 gap-2 grid grid-cols-[250px_1fr_300px] grid-rows-[64px_1fr_80px] overflow-hidden">
      {/* 1. TopBar: Chiếm trọn 3 cột ở hàng đầu */}
      <div className="col-span-3 bg-[#121212] rounded-lg flex items-center px-4">
        <TopBar />
      </div>

      {/* 2. Sidebar: Cột 1, hàng giữa */}
      <div className="row-start-2 bg-[#121212] rounded-lg">
        <SideBar />
      </div>

      {/* 3. MainContent: Cột 2, hàng giữa */}
      <main className="row-start-2 bg-[#121212] rounded-lg overflow-y-auto">
        <MainContent />
      </main>

      {/* 4. Navbar (Right Panel): Cột 3, hàng giữa */}
      <div className="row-start-2 bg-[#121212] rounded-lg overflow-y-auto">
        <NavBar />
      </div>

      {/* 5. PlayerBar: Chiếm trọn 3 cột ở hàng cuối */}
      <div className="col-span-3 bg-black z-50 h-[80px]">
        {" "}
        {/* Đã thêm h-[80px] */}
        <PlayerBar />
      </div>
    </div>
  );
}

export default App;
