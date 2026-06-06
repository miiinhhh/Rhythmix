import { useState } from "react"
import { Search, Music2, Play } from "lucide-react"

// 1. Mang mảng dữ liệu phục vụ trang Search sang đây
const browseCategories = [
  { label: "Podcasts", color: "oklch(0.6 0.18 25)" },
  { label: "Charts", color: "oklch(0.55 0.16 280)" },
  { label: "New Releases", color: "oklch(0.6 0.15 200)" },
  { label: "Discover", color: "oklch(0.62 0.17 145)" },
  { label: "Live Events", color: "oklch(0.58 0.18 60)" },
  { label: "Workout", color: "oklch(0.55 0.2 15)" },
]

const trending = [
  { title: "Pop Rising", subtitle: "Hot new pop" },
  { title: "RapCaviar", subtitle: "Fresh hip-hop" },
  { title: "Mega Hits", subtitle: "Today's top tracks" },
  { title: "Indie Mix", subtitle: "Underground gems" },
  { title: "Dance Party", subtitle: "Electronic energy" },
  { title: "Mood Booster", subtitle: "Feel-good favorites" },
  { title: "Soft Pop Hits", subtitle: "Easy listening" },
  { title: "Lo-Fi Beats", subtitle: "Study and chill" },
]

const SearchPage = () => {
  const [query, setQuery] = useState("")

  return (
    <div className="space-y-8 select-none">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Search</h1>
        <p className="mt-1 text-pretty text-sm text-zinc-400">
          Find your favorite songs, artists, and podcasts.
        </p>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full rounded-full border border-zinc-800 bg-zinc-800/50 py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Danh mục Browse all */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Browse all</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {browseCategories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className="relative flex aspect-[16/9] items-end overflow-hidden rounded-lg p-4 text-left transition-transform hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: cat.color }}
            >
              <span className="text-base font-bold text-black">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Trending now</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {trending.map((item) => (
            <article
              key={item.title}
              className="group cursor-pointer rounded-md bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800"
            >
              <div className="relative mb-3">
                <div className="flex aspect-square w-full items-center justify-center bg-zinc-800 shadow-lg rounded-md">
                  <Music2 className="size-10 text-zinc-400" />
                </div>
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
      </section>
    </div>
  )
}

export default SearchPage