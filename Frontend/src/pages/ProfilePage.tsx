import { useState, useRef } from "react";
import { Edit3, X, Save, Camera, Users, UserCheck } from "lucide-react";

const ProfilePage = () => {

  const [userProfile, setUserProfile] = useState({
    fullName: "Hello World",
    bio: "Music lover",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop",
    followersCount: 234,
    followingCount: 156,
  });

  // State quản lý Modal và form nhập liệu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editName, setEditName] = useState(userProfile.fullName);
  const [editBio, setEditBio] = useState(userProfile.bio);

  // State quản lý file ảnh cục bộ (Local File) để preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(userProfile.avatarUrl);

  // Ref để trigger ô chọn file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi chọn ảnh từ máy (Local)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo đường dẫn tạm thời để hiển thị preview ngay lập tức
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Hàm lưu thông tin
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile((prev) => ({
      ...prev,
      fullName: editName,
      bio: editBio,
      // Khi kết nối API thực tế: Chỗ này Tuấn sẽ upload file lên Cloudinary/S3 lấy link rồi gán vào avatarUrl
      avatarUrl: previewUrl,
    }));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Profile
        </h1>
        <p className="mt-2 text-sm font-medium text-zinc-400">
          Manage your public profile and social connections.
        </p>
      </div>

      <div className="flex max-w-4xl flex-col items-center gap-6 rounded-xl border border-zinc-800 bg-[#121212] p-6 shadow-sm sm:flex-row sm:items-start">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 shadow-2xl">
          {userProfile.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt="Avatar"
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-emerald-500 flex items-center justify-center text-3xl font-black text-black">
              {userProfile.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Khối chữ: Tên -> Bio -> Thống kê Follow (Nằm dưới Bio cực kỳ gọn) */}
        <div className="flex-1 space-y-3 pt-2 text-center sm:text-left">
          <h2 className="text-2xl font-black tracking-tight text-white">
            {userProfile.fullName}
          </h2>

          <p className="text-sm text-zinc-400 font-medium max-w-xl leading-relaxed">
            {userProfile.bio || "No bio added yet."}
          </p>

          {/* ĐƯA THÔNG TIN FOLLOWERS/FOLLOWING XUỐNG DƯỚI BIO (Style Chuẩn Spotify) */}
          <div className="flex items-center justify-center gap-4 pt-1 text-xs font-bold text-zinc-300 sm:justify-start">
            <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-green-500">
              <Users className="size-3.5 text-zinc-400" />
              <span>
                {userProfile.followersCount}{" "}
                <span className="font-normal text-zinc-500">followers</span>
              </span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-green-500">
              <UserCheck className="size-3.5 text-zinc-400" />
              <span>
                {userProfile.followingCount}{" "}
                <span className="font-normal text-zinc-500">following</span>
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setEditName(userProfile.fullName);
                setEditBio(userProfile.bio);
                setPreviewUrl(userProfile.avatarUrl);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-95"
            >
              <Edit3 className="size-3" /> Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-5 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Chỉnh sửa hồ sơ cá nhân
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-zinc-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative size-24 cursor-pointer overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 shadow-md"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="size-full object-cover transition-opacity group-hover:opacity-40"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-zinc-500 font-bold">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="size-4 mb-1" />
                    <span>Thay đổi ảnh</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-xs font-semibold text-green-500 hover:underline"
                >
                  Chọn ảnh từ máy tính
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-transparent bg-zinc-800 p-2.5 text-sm text-white transition-colors focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tiểu sử (Bio)
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Giới thiệu ngắn về bạn..."
                  className="w-full resize-none rounded-md border border-transparent bg-zinc-800 p-2.5 text-sm text-white transition-colors focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer px-4 py-2 text-xs font-bold text-white hover:underline"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black transition-transform hover:bg-zinc-200 active:scale-95"
                >
                  <Save className="size-3.5" /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
