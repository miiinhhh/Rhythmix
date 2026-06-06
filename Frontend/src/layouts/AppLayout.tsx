import SideBar from "../components/SideBar"; 
import PlayerBar from "../components/PlayerBar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white select-none font-sans">
      <div className="flex min-h-0 flex-1">

        <SideBar /> 
        
        <main className="m-2 ml-0 flex-1 overflow-y-auto rounded-lg bg-zinc-900 p-6">
          <Outlet /> 
        </main>

      </div>

      <PlayerBar />

    </div>
  );
}

export default AppLayout;