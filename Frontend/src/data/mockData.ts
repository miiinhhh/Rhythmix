export interface SongType {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isLiked: boolean;
  url: string;
  videoUrl?: string; 
  posterUrl?: string;
}

export interface PlaylistType {
  id: string; // Dùng làm ID trên URL (slug)
  title: string;
  subtitle: string;
  description: string;
  isPublic: boolean; // 🟢 QUYẾT ĐỊNH ẨN/HIỆN Ở PROFILE
  type: "playlists" | "albums";
  songs: SongType[];
}

export const MOCK_PLAYLISTS: PlaylistType[] = [
  {
    id: "daily-mix-1",
    title: "Daily Mix 1",
    subtitle: "Playlist · 3 songs",
    description: "The Weeknd, Dua Lipa and more",
    isPublic: true, // Công khai -> Sẽ hiện ở Profile
    type: "playlists",
    songs: [
      { 
        id: 1, 
        title: "Sunset Boulevard", 
        artist: "Neon Coast", 
        album: "City Lights", 
        duration: "0:41", 
        isLiked: true, 
        url: "",
        // 🟢 Bài 1: Video thiên thạch (Dữ liệu gốc của ông)
        videoUrl: "https://media.istockphoto.com/id/1400382484/vi/video/t%C3%A1c-%C4%91%E1%BB%99ng-c%E1%BB%A7a-ti%E1%BB%83u-h%C3%A0nh-tinh-tr%C3%AAn-tr%C3%A1i-%C4%91%E1%BA%A5t-ti%E1%BB%83u-h%C3%A0nh-tinh-sao-ch%E1%BB%95i-thi%E1%BB%87t-ph%C3%A1t-s%C3%A1ng-%C4%91i.mp4?p=1&s=mp4-640x640-is&k=20&c=s7GG-mPFa0btByLlpoqGhDLm7FQO2z0cZJuxLBFhRpc=",
        posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000"
      },
      { 
        id: 2, 
        title: "Velvet Sky", 
        artist: "Aria Lane", 
        album: "Nightfall", 
        duration: "0:45", 
        isLiked: false, 
        url: "",
        // 🟢 Bài 2: Video hoạt hình chú thỏ (Link test chuẩn của W3Schools)
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000"
      },
      { 
        id: 3, 
        title: "Paper Planes", 
        artist: "The Drifters", 
        album: "Horizons", 
        duration: "0:50", 
        isLiked: false, 
        url: "",
        // 🟢 Bài 3: Video gấu trúc đi bộ (Link test chuẩn)
        videoUrl: "https://www.w3schools.com/html/movie.mp4",
        posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000"
      },
    ]
  },
  {
    id: "summer-2026",
    title: "Summer 2026",
    subtitle: "Playlist · 2 songs",
    description: "Chill summer vibes",
    isPublic: false, // Riêng tư -> Sẽ ẨN khỏi Profile!
    type: "playlists",
    songs: [
      { 
        id: 4, 
        title: "Blinding Lights", 
        artist: "The Weeknd", 
        album: "After Hours", 
        duration: "3:20", 
        isLiked: false, 
        url: "",
        // 🟢 Bài 4: Video sample sóng biển hoặc thành phố lung linh
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-neon-light-from-a-tunnel-in-a-modern-city-43254-large.mp4",
        posterUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000"
      },
      { 
        id: 5, 
        title: "Starboy", 
        artist: "The Weeknd", 
        album: "Starboy", 
        duration: "3:50", 
        isLiked: false, 
        url: "",
        // 🟢 Bài 5: Video sample quầy bar / đèn neon cực mượt cho lofi/chill
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-42300-large.mp4",
        posterUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000"
      },
    ]
  },
  {
    id: "deep-focus",
    title: "Deep Focus",
    subtitle: "Playlist · 120 songs",
    description: "Concentrate with these ambient tracks",
    isPublic: true, // Công khai -> Sẽ hiện ở Profile
    type: "playlists",
    songs: []
  },
];

export interface UserType {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Mật khẩu giả lập để check login
  avatarUrl: string;
  bio?: string;
}

export const MOCK_USERS: UserType[] = [
  {
    id: "user-alex", // Đổi ID luôn cho đồng bộ
    name: "Alex Mercer", // 🟢 Đã đổi từ Thanh Tuấn
    email: "alex.mercer@music.io",
    passwordHash: "123456", 
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    bio: "Fullstack Developer & Audio Enthusiast 🚀"
  },
  {
    id: "user-luna",
    name: "Luna Nova",
    email: "luna@gmail.com",
    passwordHash: "123456",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    bio: "Love acoustic and lofi music ☕"
  },
  {
    id: "user-julian", // Đổi ID luôn
    name: "Julian Ross", // 🟢 Đã đổi từ Hoàng Minh
    email: "julian@gmail.com",
    passwordHash: "123456",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    bio: "Rap & HipHop never die!"
  }
];

// Định nghĩa cấu trúc dữ liệu khi một item được chia sẻ
export interface SharedItemType {
  id: string; // ID của lượt chia sẻ
  senderId: string; // Ai gửi
  senderName: string;
  receiverId: string; // Gửi cho ai
  type: "song" | "playlist" | "video";
  itemId: string | number; // ID của bài hát hoặc playlist được chia sẻ
  itemTitle: string; // Tiêu đề để hiển thị nhanh
  itemSubtitle?: string; // Ca sĩ hoặc thông tin phụ
  itemUrl?: string; // Link stream/video nếu cần
  sharedAt: Date;
}

// 🟢 Mảng chứa lịch sử chia sẻ toàn cục giả lập (Đã đổi người nhận thành Alex)
export let MOCK_SHARED_ITEMS: SharedItemType[] = [
  {
    id: "share-1",
    senderId: "user-luna",
    senderName: "Luna Nova",
    receiverId: "user-alex", // 🟢 Gửi cho Alex Mercer
    type: "song",
    itemId: 1,
    itemTitle: "Sunset Boulevard",
    itemSubtitle: "Neon Coast",
    sharedAt: new Date(Date.now() - 3600000 * 2) // Cách đây 2 tiếng
  },
  {
    id: "share-2",
    senderId: "user-julian",
    senderName: "Julian Ross",
    receiverId: "user-alex", // 🟢 Gửi cho Alex Mercer
    type: "playlist",
    itemId: "daily-mix-1",
    itemTitle: "Daily Mix 1",
    itemSubtitle: "Playlist • 3 songs",
    sharedAt: new Date(Date.now() - 1800000) // Cách đây 30 phút
  }
];

// Hàm helper để giả lập gửi dữ liệu chia sẻ
export const sendShareItem = (item: Omit<SharedItemType, "id" | "sharedAt">) => {
  const newShare: SharedItemType = {
    ...item,
    id: `share-${Date.now()}`,
    sharedAt: new Date()
  };
  MOCK_SHARED_ITEMS.unshift(newShare); // Thêm lên đầu danh sách
  return newShare;
};
export interface FollowType {
  followerId: string; // Người nhấn follow
  followingId: string; // Người được follow
}

// Giả lập danh sách ban đầu (Alex đang follow Luna)
export const MOCK_FOLLOWS: FollowType[] = [];

export const MOCK_NOTIFICATIONS = [];