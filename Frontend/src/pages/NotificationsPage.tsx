import { useState } from "react"
import { Bell, UserPlus, Music, Disc, Radio, Check, CheckCheck } from "lucide-react"

// 1. Đồng bộ cấu trúc dữ liệu: 4 loại thông báo theo đúng yêu cầu
const mockNotifications = [
  {
    id: "n1",
    type: "follow", // 1. Được follow
    title: "New follower",
    description: "Jordan started following you.",
    time: "2h ago",
    isRead: false,
  },
  {
    id: "n2",
    type: "share_song", // 2. Được chia sẻ bài hát
    title: "Someone shared a song with you",
    description: "Maya sent you 'Midnight City' by M83.",
    time: "5h ago",
    isRead: false,
  },
  {
    id: "n3",
    type: "share_playlist", // 3. Được chia sẻ playlist
    title: "Someone shared a playlist",
    description: "Alex shared the playlist 'Chill Vibes 2026'.",
    time: "1d ago",
    isRead: false,
  },
  {
    id: "n4",
    type: "share_album", // 4. Được chia sẻ album
    title: "New album recommendation",
    description: "Lucas recommended the album 'Starboy'.",
    time: "2d ago",
    isRead: true, // Cái này giả lập đã đọc
  },
]

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  // Hàm đánh dấu tất cả là đã đọc
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
  }

  // Hàm toggle đọc/chưa đọc khi click vào từng ô thông báo (UX rất hay)
  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    )
  }

  // Hàm helper chọn Icon và màu nền hình tròn bên trái dựa theo 'type'
  const getIconDetails = (type: string) => {
    switch (type) {
      case "follow":
        return {
          icon: <UserPlus className="size-5 text-emerald-500" />,
          bgColor: "bg-emerald-500/10",
        }
      case "share_song":
        return {
          icon: <Music className="size-5 text-blue-500" />,
          bgColor: "bg-blue-500/10",
        }
      case "share_playlist":
        return {
          icon: <Radio className="size-5 text-green-500" />,
          bgColor: "bg-green-500/10",
        }
      case "share_album":
        return {
          icon: <Disc className="size-5 text-purple-500" />,
          bgColor: "bg-purple-500/10",
        }
      default:
        return {
          icon: <Bell className="size-5 text-zinc-400" />,
          bgColor: "bg-zinc-800",
        }
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header trang chuẩn style Spotify */}
      <div className="flex justify-between items-end pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Notifications</h1>
          <p className="mt-2 text-sm text-zinc-400 font-medium">
            Stay up to date with new releases and activity.
          </p>
        </div>

        {/* Nút Mark all as read bo tròn viền trắng giống hình mẫu */}
        {notifications.some((n) => !n.isRead) ? (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:scale-105 transition-transform cursor-pointer active:bg-zinc-800"
          >
            <CheckCheck className="size-4 text-zinc-400" />
            Mark all as read
          </button>
        ) : (
          <div className="text-xs text-zinc-500 font-medium px-4 py-2 flex items-center gap-1">
            <Check className="size-4" /> All caught up
          </div>
        )}
      </div>

      {/* Danh sách 4 ô thông báo */}
      <div className="space-y-2">
        {notifications.map((item) => {
          const { icon, bgColor } = getIconDetails(item.type)
          
          return (
            <div
              key={item.id}
              onClick={() => toggleReadStatus(item.id)}
              className="flex items-center justify-between p-4 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] border border-transparent hover:border-zinc-850 transition-all cursor-pointer group"
            >
              <div className="flex gap-4 items-center flex-1 min-w-0">
                {/* Khung Icon tròn bọc bên trái */}
                <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                  {icon}
                </div>

                {/* Khung Text: Tiêu đề trên, mô tả dưới */}
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className={`text-sm font-bold truncate ${!item.isRead ? "text-white" : "text-zinc-450"}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Khung hiển thị thời gian và chấm xanh bên phải */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {!item.isRead && (
                  <span className="size-2 bg-green-500 rounded-full" />
                )}
                <span className="text-xs text-zinc-400 font-medium">{item.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}