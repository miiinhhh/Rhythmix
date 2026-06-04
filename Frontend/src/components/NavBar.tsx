const NavBar = () => {
  return (
    <div className="h-full flex flex-col p-4 text-white">
      {/* 1. Tiêu đề và nút đóng (tùy chọn) */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Nơi Đau Muôn Mang - Tuấn Ngọc</h3>
        <button className="text-[#b3b3b3] hover:text-white">✕</button>
      </div>

      {/* 2. Ảnh bìa bài hát */}
      <div className="w-full aspect-square bg-gray-800 rounded-lg mb-6 shadow-xl">
        {/* Bạn có thể chèn thẻ <img /> ở đây */}
      </div>

      {/* 3. Thông tin bài hát */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Nơi Đau Muôn Mang</h2>
        <p className="text-[#b3b3b3]">Tuấn Ngọc</p>
      </div>

      {/* 4. Phần thông tin người tham gia */}
      <div className="bg-[#181818] p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Người tham gia thực hiện</h4>
          <span className="text-xs text-[#b3b3b3] hover:underline cursor-pointer">Hiện tất cả</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium">Tuấn Ngọc</p>
            <p className="text-sm text-[#b3b3b3]">Nghệ Sĩ Chính</p>
          </div>
          <div>
            <p className="font-medium">Ngô Thụy Miên</p>
            <p className="text-sm text-[#b3b3b3]">Tác Giả</p>
          </div>
        </div>
        
        <button className="mt-4 w-full bg-white text-black py-2 rounded-full font-bold hover:scale-105 transition">
          Theo dõi
        </button>
      </div>
    </div>
  );
};

export default NavBar;