import { X, ChevronDown, ChevronUp } from "lucide-react"
import useUploadMedia from "../hooks/useUploadMedia"

interface UploadMediaModalProps {
  isOpen: boolean
  onClose: () => void
}

const UploadMediaModal = ({ isOpen, onClose }: UploadMediaModalProps) => {
  // Gọi "bộ não" Custom Hook ra để lấy toàn bộ dữ liệu và hàm xử lý
  const {
    title, setTitle,
    description, setDescription,
    selectedAlbumId, setSelectedAlbumId,
    setTrackCover,
    setSelectedFile,
    myAlbums,
    isCreatingAlbum, setIsCreatingAlbum,
    newAlbumTitle, setNewAlbumTitle,
    newAlbumDesc, setNewAlbumDesc,
    setNewAlbumCover,
    errors, setErrors,
    clearFieldError,
    handleSaveNewAlbum,
    handleSubmit,
  } = useUploadMedia(onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6">
      <div className="relative w-full max-w-5xl rounded-2xl bg-zinc-950 p-10 border border-zinc-800 shadow-2xl transition-all duration-300">
        
        {/* Nút X đóng */}
        <button type="button" onClick={onClose} className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors">
          <X className="size-6" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight">Upload New Music</h2>
          <p className="text-base text-zinc-400 mt-1.5">Xuất bản tác phẩm âm nhạc của bạn lên hệ thống</p>
        </div>

        {/* FORM CHÍNH */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 gap-y-8">
          
          {/* ================= CỘT BÊN TRÁI: THÔNG TIN BÀI HÁT ================= */}
          <div className="space-y-6">
            <p className="text-sm font-bold text-green-500 tracking-widest uppercase border-b border-zinc-900 pb-2">
              1. Track Information
            </p>

            {/* Ô nhập tên bài hát */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">TITLE *</label>
              <input 
                type="text" 
                placeholder="Tên bài hát..." 
                value={title} 
                onChange={(e) => {
                  setTitle(e.target.value)
                  clearFieldError("title") // Xóa viền đỏ qua hàm clear riêng
                }} 
                className={`w-full rounded-lg bg-zinc-900 px-4 py-3.5 text-base text-white placeholder-zinc-500 outline-none border transition-all ${
                  errors.title ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-zinc-700 focus:bg-zinc-900/80"
                }`}
              />
              {errors.title && <p className="text-xs font-medium text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Ô nhập mô tả bài hát */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">DESCRIPTION</label>
              <textarea 
                rows={5} 
                placeholder="Thêm mô tả hoặc lời bài hát ngắn..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full rounded-lg bg-zinc-900 px-4 py-3.5 text-base text-white placeholder-zinc-500 outline-none border border-zinc-800 focus:border-zinc-700 focus:bg-zinc-900/80 resize-none transition-all" 
              />
            </div>

            {/* Ô chọn file nhạc */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AUDIO FILE (.MP3) *</label>
              <input 
                type="file" 
                accept="audio/mp3, audio/*" 
                onChange={(e) => { 
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0])
                    clearFieldError("selectedFile") // Xóa viền đỏ khi chọn xong file
                  }
                }} 
                className={`w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-400 border file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:cursor-pointer ${
                  errors.selectedFile ? "border-red-500" : "border-zinc-800"
                }`}
              />
              {errors.selectedFile && <p className="text-xs font-medium text-red-500 mt-1">{errors.selectedFile}</p>}
            </div>

            {/* Ô UPLOAD ẢNH BÌA RIÊNG */}
            {!selectedAlbumId && !isCreatingAlbum && (
              <div className="space-y-2 bg-zinc-900/20 p-5 rounded-xl border border-zinc-900 transition-all">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">TRACK COVER IMAGE (ẢNH BÌA BÀI HÁT)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => { if (e.target.files && e.target.files[0]) setTrackCover(e.target.files[0]) }} 
                  className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-400 border border-zinc-800 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:cursor-pointer" 
                />
                <p className="text-xs text-zinc-500 mt-1">Nếu trống, hệ thống sẽ sử dụng ảnh mặc định của bài hát.</p>
              </div>
            )}
          </div>

          {/* ================= CỘT BÊN PHẢI: ALBUM PHÂN LOẠI ================= */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <p className="text-sm font-bold text-green-500 tracking-widest uppercase">
                  2. Album Classification
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingAlbum(!isCreatingAlbum)
                    setErrors((prev) => ({ ...prev, newAlbumTitle: undefined }))
                  }}
                  className="text-sm font-bold text-green-500 hover:text-green-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isCreatingAlbum ? (
                    <>Hủy tạo Album <ChevronUp className="size-4" /></>
                  ) : (
                    <>+ Tạo Album mới <ChevronDown className="size-4" /></>
                  )}
                </button>
              </div>

              {isCreatingAlbum ? (
                /* FORM PHỤ TẠO ALBUM MỚI */
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
                  <p className="text-xs font-black text-zinc-500 tracking-widest uppercase">THÔNG TIN ALBUM MỚI</p>
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Tên Album mới... *" 
                      value={newAlbumTitle} 
                      onChange={(e) => {
                        setNewAlbumTitle(e.target.value)
                        clearFieldError("newAlbumTitle")
                      }} 
                      className={`w-full rounded-lg bg-zinc-950 px-4 py-3.5 text-base text-white placeholder-zinc-500 outline-none border transition-all ${
                        errors.newAlbumTitle ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-zinc-700"
                      }`}
                    />
                    {errors.newAlbumTitle && <p className="text-xs font-medium text-red-500 mt-1">{errors.newAlbumTitle}</p>}
                  </div>
                  
                  <textarea 
                    rows={4} 
                    placeholder="Mô tả ngắn về Album này..." 
                    value={newAlbumDesc} 
                    onChange={(e) => setNewAlbumDesc(e.target.value)} 
                    className="w-full rounded-lg bg-zinc-950 px-4 py-3.5 text-base text-white placeholder-zinc-500 outline-none border border-zinc-800 focus:border-zinc-700 resize-none" 
                  />
                  
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ảnh bìa Album</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => { if (e.target.files && e.target.files[0]) setNewAlbumCover(e.target.files[0]) }} 
                      className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm text-zinc-400 border border-zinc-800 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white" 
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleSaveNewAlbum} 
                    className="w-full mt-3 rounded-full bg-zinc-200 py-3.5 text-base font-bold text-black hover:bg-white cursor-pointer active:scale-95 transition-all"
                  >
                    Xác nhận tạo Album
                  </button>
                </div>
              ) : (
                /* DROPDOWN CHỌN ALBUM SẴN CÓ */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">CHỌN ALBUM SẴN CÓ</label>
                  <select 
                    value={selectedAlbumId} 
                    onChange={(e) => setSelectedAlbumId(e.target.value)} 
                    className="w-full rounded-lg bg-zinc-900 px-4 py-3.5 text-base text-white outline-none border border-zinc-800 focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="">-- Bài hát đơn lẻ (Single) --</option>
                    {myAlbums.map((album) => (
                      <option key={album.id} value={album.id}>{album.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* NÚT SUBMIT TOÀN FORM */}
            <div className="pt-6 md:pt-0">
              <button 
                type="submit" 
                className="w-full rounded-full bg-green-500 py-4 text-lg font-bold text-black transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg shadow-green-500/20"
              >
                Publish Track
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}

export default UploadMediaModal