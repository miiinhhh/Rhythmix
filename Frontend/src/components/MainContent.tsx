const MainContent = () => {
  return (
    // 'h-full' quan trọng để giới hạn chiều cao trong khối cha
    // 'overflow-y-auto' sẽ hiện thanh cuộn khi nội dung quá dài
    <div className="h-full overflow-y-auto p-6 text-white scrollbar-thin">
      
      {/* 1. Phần Danh mục (Categories) - Giữ cố định trên đầu */}
      <div className="flex gap-2 mb-6 sticky top-0 bg-[#121212] z-10 py-2">
        <button className="bg-white text-black px-4 py-1 rounded-full text-sm font-semibold">Tất cả</button>
        <button className="bg-[#2a2a2a] hover:bg-[#333] px-4 py-1 rounded-full text-sm transition">Nhạc</button>
        <button className="bg-[#2a2a2a] hover:bg-[#333] px-4 py-1 rounded-full text-sm transition">Podcast</button>
      </div>

      {/* 2. Hàng trên: Dành cho bạn */}
      <h2 className="text-2xl font-bold mb-4">Dành cho bạn</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={`danh-cho-${item}`} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer">
            <div className="w-full aspect-square bg-gradient-to-tr from-purple-500 to-blue-500 rounded-md mb-3"></div>
            <h3 className="font-semibold truncate">Daily Mix {item}</h3>
          </div>
        ))}
      </div>

      {/* 3. Hàng dưới: Radio phổ biến */}
      <h2 className="text-2xl font-bold mb-4">Radio phổ biến</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={`radio-${item}`} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition cursor-pointer">
            <div className="w-full aspect-square bg-gradient-to-tr from-orange-400 to-red-500 rounded-full mb-3"></div>
            <h3 className="font-semibold truncate">Radio {item}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainContent;