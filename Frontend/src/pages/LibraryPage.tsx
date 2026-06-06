import { useState } from "react"
import { Library, Music2, Video, ListMusic, Play } from "lucide-react"

// 1. Dữ liệu tĩnh của Thư viện bốc từ file views.tsx sang
const libraryItems = [
  { title: "Liked Songs", subtitle: "Playlist · 248 songs", type: "songs" as const },
  { title: "Summer 2026", subtitle: "Playlist · 64 songs", type: "songs" as const },
  { title: "After Hours", subtitle: "Album · The Weeknd", type: "songs" as const },
  { title: "Live at Wembley", subtitle: "Video · 1h 42m", type: "videos" as const },
  { title: "Acoustic Sessions", subtitle: "Video · 12 clips", type: "videos" as const },
  { title: "Deep Focus", subtitle: "Playlist · 120 songs", type: "songs" as const },
  { title: "Road Trip", subtitle: "Playlist · 88 songs", type: "songs" as const },
  { title: "Music Videos Mix", subtitle: "Video · 30 clips", type: "videos" as const },
]

const libraryTabs = [
  { id: "all" as const, label: "All", icon: Library },
  { id: "songs" as const, label: "Songs", icon: Music2 },
  { id: "videos" as const, label: "Videos", icon: Video },
]

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "songs" | "videos">("all")

  // Logic lọc dữ liệu dựa trên Tab đang chọn
  const filtered =
    activeTab === "all"
      ? libraryItems
      : libraryItems.filter((item) => item.type === activeTab)

  return (
    <div className="space-y-6 select-none">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Your Library</h1>
        <p className="mt-1 text-pretty text-sm text-zinc-400">
          All your saved music and playlists in one place.
        </p>
      </div>

      {/* Thanh bấm chuyển đổi các Tab (All / Songs / Videos) */}
      <div className="flex gap-2">
        {libraryTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-green-500 text-black"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Lưới hiển thị danh sách các mục trong thư viện */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((item) => (
          <article
            key={item.title}
            className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
          >
            <div className="relative mb-3">
              {/* Nếu là mục "Liked Songs" thì bo tròn hình tròn, còn lại bo góc vuông */}
              <div
                className={`flex aspect-square w-full items-center justify-center bg-zinc-800 shadow-lg ${
                  item.title === "Liked Songs" ? "rounded-full" : "rounded-md"
                }`}
              >
                {item.type === "videos" ? (
                  <Video className="size-10 text-zinc-400" />
                ) : (
                  <Music2 className="size-10 text-zinc-400" />
                )}
              </div>
              {/* Nút Play màu xanh lá hiện lên khi hover */}
              <button
                type="button"
                className="absolute bottom-2 right-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <Play className="size-5 fill-black text-black" />
              </button>
            </div>
            <h3 className="truncate text-sm font-semibold text-white">{item.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.subtitle}</p>
          </article>
        ))}
      </div>

      {/* Hiển thị thông báo này nếu mảng sau khi lọc bị trống */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-20 text-center">
          <ListMusic className="mb-3 size-8 text-zinc-500" />
          <p className="text-sm text-zinc-400">Nothing here yet.</p>
        </div>
      )}
    </div>
  )
}

export default LibraryPage