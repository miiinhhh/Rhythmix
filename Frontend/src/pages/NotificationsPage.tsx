import { useState } from "react"
import { UserPlus, Music, Disc, Radio } from "lucide-react"


const mockNotifications = [
  {
    id: "n1",
    type: "follow",
    payload: JSON.stringify({ senderName: "Linh99" }), // Lưu JSON dạng string
    time: "2h ago",
    isRead: false,
  },
  {
    id: "n2",
    type: "share_song",
    payload: JSON.stringify({ senderName: "Maya", itemName: "Midnight City", extraInfo: "M83" }),
    time: "5h ago",
    isRead: false,
  },
  {
    id: "n3",
    type: "share_playlist",
    payload: JSON.stringify({ senderName: "Alex", itemName: "Chill Vibes 2026" }),
    time: "1d ago",
    isRead: false,
  },
  {
    id: "n4",
    type: "share_album",
    payload: JSON.stringify({ senderName: "Lucas", itemName: "Starboy" }),
    time: "2d ago",
    isRead: true,
  },
]

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications)

  const parseNotificationContent = (type: string, payloadStr: string) => {
    try {
      // Vì payload dưới DB lên là chuỗi, ta dùng JSON.parse() để biến lại thành Object JS
      const data = JSON.parse(payloadStr) 
      
      switch (type) {
        case "follow":
          return {
            title: "New follower",
            description: `${data.senderName} started following you.`,
          }
        case "share_song":
          return {
            title: "Someone shared a song with you",
            description: `${data.senderName} sent you '${data.itemName}' by ${data.extraInfo}.`,
          }
        case "share_playlist":
          return {
            title: "Someone shared a playlist",
            description: `${data.senderName} shared the playlist '${data.itemName}'.`,
          }
        case "share_album":
          return {
            title: "New album recommendation",
            description: `${data.senderName} recommended the album '${data.itemName}'.`,
          }
        default:
          return { title: "Notification", description: "You have a new update." }
      }
    } catch (error) {
      // Phòng trường hợp chuỗi JSON bị lỗi cấu trúc, app không bị crash
      return { title: "Error", description: "Invalid notification data." }
    }
  }
  // =========================================================================

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  const toggleReadStatus = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  const getIconDetails = (type: string) => {
    if (type === "follow") return { icon: <UserPlus className="size-5 text-emerald-500" />, bgColor: "bg-emerald-500/10" }
    if (type === "share_song") return { icon: <Music className="size-5 text-blue-500" />, bgColor: "bg-blue-500/10" }
    if (type === "share_playlist") return { icon: <Radio className="size-5 text-green-500" />, bgColor: "bg-green-500/10" }
    return { icon: <Disc className="size-5 text-purple-500" />, bgColor: "bg-purple-500/10" }
  }

  return (
    <div className="space-y-6 select-none ">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Notifications</h1>
          <p className="mt-2 text-sm text-zinc-400 font-medium">Stay up to date with new releases and activity.</p>
        </div>
        <button onClick={markAllAsRead} className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:scale-105 transition-transform cursor-pointer">
          Mark all as read
        </button>
      </div>

      {/* Danh sách hiển thị */}
      <div className="space-y-2">
        {notifications.map((item) => {
          const { icon, bgColor } = getIconDetails(item.type)
          
          // 💥 GỌI HÀM BÓC TÁCH PAYLOAD TẠI ĐÂY ĐỂ LẤY TITLE VÀ DESCRIPTION MỚI:
          const { title, description } = parseNotificationContent(item.type, item.payload)
          
          return (
            <div
              key={item.id}
              onClick={() => toggleReadStatus(item.id)}
              className="flex items-center justify-between p-4 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] transition-all cursor-pointer"
            >
              <div className="flex gap-4 items-center flex-1 min-w-0">
                <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                  {icon}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  {/* Đã được đổi sang biến dynamic bóc ra từ JSON */}
                  <h3 className={`text-sm font-bold truncate ${!item.isRead ? "text-white" : "text-zinc-500"}`}>
                    {title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate font-medium">
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {!item.isRead && <span className="size-2 bg-green-500 rounded-full" />}
                <span className="text-xs text-zinc-400 font-medium">{item.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default NotificationPage;