import { Play } from "lucide-react";
// import { useNavigate } from "react-router-dom";

const HomePage = () => {
  // const navigate = useNavigate(); // 🔽 2. KHỞI TẠO HÀM ĐIỀU HƯỚNG
  // Dữ liệu danh sách nhạc giữ nguyên
  const featured = [
    { title: "Daily Mix 1", subtitle: "Made for you" },
    { title: "Chill Vibes", subtitle: "Relax and unwind" },
    { title: "Top Hits 2026", subtitle: "The biggest tracks" },
    { title: "Focus Flow", subtitle: "Deep concentration" },
    { title: "Throwback", subtitle: "Classics from the 2000s" },
    { title: "Late Night", subtitle: "Smooth evening sounds" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Home</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Jump back into your favorite mixes and playlists.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((item) => (
          <article
            key={item.title}
            className="group flex items-center gap-4 overflow-hidden rounded-md bg-zinc-900 pr-4 transition-colors hover:bg-zinc-800 cursor-pointer relative"
          >
            <div className="size-20 shrink-0 bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
              Mix
            </div>
            <div className="min-w-0 flex-1 py-2">
              <h3 className="truncate text-sm font-semibold text-white">{item.title}</h3>
              <p className="truncate text-xs text-zinc-400">{item.subtitle}</p>
            </div>
            <button className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105">
              <Play className="size-5 fill-black text-black ml-0.5" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default HomePage;