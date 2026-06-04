const TopBar = () => {
  return (
    <div className="w-full h-full flex items-center justify-between px-4 bg-black">
      
      {/* 1. Phần Trái: Logo Spotify */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <img src="logocs.png" alt="Logo" className="w-full h-full object-cover" />
      </div>

      {/* 2. Phần Giữa: Home & Search Bar */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {/* Nút Home */}
        <div className="bg-[#121212] p-3 rounded-full hover:scale-105 transition cursor-pointer">
          🏠
        </div>
        
        {/* Search Bar */}
        <div className="bg-[#121212] flex items-center px-4 py-3 rounded-full w-[450px] border border-transparent hover:border-[#333] transition-all">
          <span className="text-[#b3b3b3] mr-2">🔍</span>
          <input 
            type="text" 
            placeholder="Bạn muốn phát nội dung gì?" 
            className="bg-transparent outline-none text-white w-full text-sm"
          />
        </div>
      </div>

      {/* 3. Phần Phải: Premium, Cài đặt, Thông báo, Profile */}
      <div className="flex items-center gap-3">
        <button className="bg-white text-black font-bold text-sm px-4 py-2 rounded-full hover:scale-105 transition">
          Khám phá Premium
        </button>
        <button className="text-[#b3b3b3] hover:text-white text-sm flex items-center gap-1">
          ⬇️ Cài đặt
        </button>
        <div className="text-[#b3b3b3] hover:text-white cursor-pointer p-2">🔔</div>
        
        {/* Khung ảnh người dùng bo tròn */}
        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#333] cursor-pointer">
          <img src="https://i.pravatar.cc/150?u=user" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
      
    </div>
  );
};

export default TopBar;