const SideBar = () => {
  return (
    <div className="h-full flex flex-col p-4 text-[#b3b3b3]">
      {/* Phần tiêu đề */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          📚 Thư viện
        </h2>
        <div className="flex gap-3 text-xl">
          <button className="hover:text-white transition">+Tạo</button>
          <button className="hover:text-white transition">↗️</button>
        </div>
      </div>

      {/* Nút lọc (Filter buttons) - Đã thêm "Album" */}
      <div className="flex gap-2 mb-4">
        <button className="bg-[#2a2a2a] text-white px-3 py-1 rounded-full text-sm hover:bg-[#333]">Danh sách phát</button>
        <button className="bg-[#2a2a2a] text-white px-3 py-1 rounded-full text-sm hover:bg-[#333]">Nghệ sĩ</button>
        <button className="bg-[#2a2a2a] text-white px-3 py-1 rounded-full text-sm hover:bg-[#333]">Album</button>
      </div>

      {/* Thanh tìm kiếm và sắp xếp */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="hover:text-white cursor-pointer">🔍</span>
        <span className="flex items-center gap-1 cursor-pointer hover:text-white">Gần đây ≡</span>
      </div>

      {/* Danh sách Thư viện */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <LibraryItem title="Bài hát đã thích" subtitle="Danh sách phát • 140 bài hát" icon="❤️" isGradient />
        <LibraryItem title="Noi Dau Muon Mang" subtitle="Danh sách phát • Tlphieu" image="https://i.pravatar.cc/100?u=1" />
        <LibraryItem title="Phương Anh" subtitle="Nghệ sĩ" image="https://i.pravatar.cc/100?u=2" isRounded />
        <LibraryItem title="Donglan Rose" subtitle="Album • Dong Lan" image="https://i.pravatar.cc/100?u=3" />
        <LibraryItem title="V-Pop Ngày Hôm Qua" subtitle="Danh sách phát • Tlphieu" image="https://i.pravatar.cc/100?u=4" />
        <LibraryItem title="Chanson Française" subtitle="Danh sách phát • Trương Xuân Hiển" image="https://i.pravatar.cc/100?u=5" />
        <LibraryItem title="Flames of Love" subtitle="Album • Armik" image="https://i.pravatar.cc/100?u=6" />
        <LibraryItem title="Pacifica" subtitle="Album • Armik" image="https://i.pravatar.cc/100?u=7" />
      </div>
    </div>
  );
};

// Component con giữ nguyên như cũ
const LibraryItem = ({ title, subtitle, icon, image, isGradient, isRounded }: any) => (
  <div className="flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded-md cursor-pointer transition">
    {icon ? (
      <div className={`w-12 h-12 flex items-center justify-center rounded ${isGradient ? 'bg-gradient-to-br from-purple-500 to-blue-300' : 'bg-[#2a2a2a]'}`}>
        {icon}
      </div>
    ) : (
      <img src={image} className={`w-12 h-12 ${isRounded ? 'rounded-full' : 'rounded'}`} alt={title} />
    )}
    <div className="flex flex-col truncate">
      <span className="text-white font-medium text-sm">{title}</span>
      <span className="text-xs">{subtitle}</span>
    </div>
  </div>
);

export default SideBar;