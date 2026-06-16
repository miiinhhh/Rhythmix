import { X, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
interface UploadMediaModalProps {
  isOpen: boolean
  onClose: () => void
}
interface FormErrors {
  title?: string
  artist?: string
  selectedFile?: string
  newAlbumTitle?: string
  selectedCategory?: string
}

const UploadMediaModal = ({ isOpen, onClose }: UploadMediaModalProps) => {
  // 1. Toàn bộ State quản lý Bài hát
    const [title, setTitle] = useState("")
    const [artist, setArtist] = useState("")
    const [description, setDescription] = useState("")
    const [selectedAlbumId, setSelectedAlbumId] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [trackCover, setTrackCover] = useState<File | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  
    // 2. Giả lập danh sách Albums hiện có
    const [myAlbums, setMyAlbums] = useState([
      { id: "album-1", title: "After Hours" },
      { id: "album-2", title: "Lost in Saigon" },
    ])
    const [myCategories, setMyCategories] = useState([
      { id: "cat-1", title: "Pop" },
      { id: "cat-2", title: "Rock" },
      { id: "cat-3", title: "Hip-hop" },
    ])
  
    // 3. State quản lý Form tạo nhanh Album mới
    const [isCreatingAlbum, setIsCreatingAlbum] = useState(false)
    const [newAlbumTitle, setNewAlbumTitle] = useState("")
    const [newAlbumDesc, setNewAlbumDesc] = useState("")
    const [newAlbumCover, setNewAlbumCover] = useState<File | null>(null)
  
    // 4. State quản lý lỗi viền đỏ
    const [errors, setErrors] = useState<FormErrors>({})
  
    // Hàm xóa lỗi của một trường cụ thể khi người dùng thao tác gõ/chọn file
    const clearFieldError = (field: keyof FormErrors) => {
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  
    // 5. Hàm xử lý tạo nhanh Album (Sau này kết nối POST /api/albums ở đây)
    const handleSaveNewAlbum = () => {
      setErrors((prev) => ({ ...prev, newAlbumTitle: undefined }))
  
      if (!newAlbumTitle.trim()) {
        setErrors((prev) => ({ ...prev, newAlbumTitle: "Vui lòng nhập tên album!" }))
        return
      }
  
      // SAU NÀY CONNECT DB: Bạn sẽ gọi API gửi `newAlbumTitle`, `newAlbumDesc`, `newAlbumCover` lên BE ở khúc này
      const newAlbum = {
        id: `album-${Date.now()}`,
        title: newAlbumTitle.trim(),
      }
      setMyAlbums((current) => [...current, newAlbum])
      setSelectedAlbumId(newAlbum.id)
      setNewAlbumTitle("")
      setNewAlbumDesc("")
      setNewAlbumCover(null)
      setIsCreatingAlbum(false)
    }
  
    // 6. Hàm xử lý gửi Form chính (Sau này kết nối POST /api/tracks ở đây)
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      const newErrors: FormErrors = {}
      if (!title.trim()) newErrors.title = "Vui lòng nhập tên bài hát!"
      if (!artist.trim()) newErrors.artist = "Vui lòng nhập tên nghệ sĩ!"
      if (!selectedFile) newErrors.selectedFile = "Vui lòng chọn file nhạc (.mp3) để upload!"
      if (!selectedCategory) newErrors.selectedCategory = "Vui lòng chọn danh mục!"
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
  
      setErrors({})
  
      alert("Upload nhạc lên hệ thống thành công!")
      onClose()
    }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6">
      <div className="relative w-full max-w-7xl rounded-2xl bg-zinc-950 p-10 border border-zinc-800 shadow-2xl transition-all duration-300">
        
        {/* Nút X đóng */}
        <button type="button" onClick={onClose} className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors">
          <X className="size-6" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight">Upload New Music</h2>
          <p className="text-base text-zinc-400 mt-1.5">Xuất bản tác phẩm âm nhạc của bạn lên hệ thống</p>
        </div>

        {/* FORM CHÍNH - Chuyển sang 3 cột */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ================= CỘT 1: THÔNG TIN CƠ BẢN (NÂNG CẤP) ================= */}
          <div className="space-y-6">
            <p className="text-sm font-bold text-green-500 tracking-widest uppercase border-b border-zinc-900 pb-2">
              1. Basic Info
            </p>

            {/* Ô nhập tên bài hát */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer">TITLE *</label>
              <input 
                type="text" 
                placeholder="Tên bài hát..." 
                value={title} 
                onChange={(e) => {
                  setTitle(e.target.value)
                  clearFieldError("title") 
                }} 
                className={`w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border transition-all ${
                  errors.title ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-zinc-700 focus:bg-zinc-900/80"
                }`}
              />
              {errors.title && <p className="text-xs font-medium text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Ô nhập tên nghệ sĩ (MỚI THÊM) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer">ARTIST *</label>
              <input 
                type="text" 
                placeholder="Tên nghệ sĩ, ca sĩ..." 
                value={artist} 
                onChange={(e) => {
                  setArtist(e.target.value)
                  clearFieldError("artist") 
                }} 
                className={`w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border transition-all ${
                  errors.artist ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-zinc-700 focus:bg-zinc-900/80"
                }`}
              />
              {errors.artist && <p className="text-xs font-medium text-red-500 mt-1">{errors.artist}</p>}
            </div>

            {/* Ô nhập mô tả bài hát */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer">DESCRIPTION</label>
              <textarea 
                rows={5} 
                placeholder="Thêm mô tả hoặc lời bài hát ngắn..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border border-zinc-800 focus:border-zinc-700 focus:bg-zinc-900/80 resize-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer">CATEGORY *</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  clearFieldError("selectedCategory") // Xóa lỗi khi người dùng chọn xong
                }} 
                className={`w-full rounded-lg bg-zinc-900 px-4 py-3 text-base text-white outline-none border transition-all cursor-pointer ${
                  errors.selectedCategory ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-zinc-700"
                }`}
              >
                <option value="">-- Select a category --</option>
                {myCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
              {errors.selectedCategory && <p className="text-xs font-medium text-red-500 mt-1">{errors.selectedCategory}</p>}
            </div>
          </div>

          {/* ================= CỘT 2: FILE PHƯƠNG TIỆN (NỀN XÁM) ================= */}
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
            <p className="text-sm font-bold text-green-500 tracking-widest uppercase border-b border-zinc-800 pb-2">
              2. Media Files
            </p>

            {/* Ô chọn file nhạc */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer">AUDIO FILE (.MP3) *</label>
              <input 
                type="file" 
                accept="audio/mp3, audio/*" 
                onChange={(e) => { 
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0])
                    clearFieldError("selectedFile")
                  }
                }} 
                className={`w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 border file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:cursor-pointer ${
                  errors.selectedFile ? "border-red-500" : "border-zinc-800"
                }`}
              />
              {errors.selectedFile && <p className="text-xs font-medium text-red-500 mt-1">{errors.selectedFile}</p>}
            </div>

            {/* Ô chọn file video */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer">VIDEO FILE (.MP4) (OPTIONAL)</label>
              <input 
                type="file" 
                accept="video/mp4, video/*" 
                onChange={(e) => { 
                  if (e.target.files && e.target.files[0]) {
                    setSelectedVideoFile(e.target.files[0])
                  }
                }} 
                className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 border border-zinc-800 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:cursor-pointer" 
              />
            </div>

            {/* Ô UPLOAD ẢNH BÌA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer">COVER IMAGE</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => { if (e.target.files && e.target.files[0]) setTrackCover(e.target.files[0]) }} 
                className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 border border-zinc-800 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:cursor-pointer" 
              />
            </div>
          </div>

          {/* ================= CỘT 3: ALBUM (CỘT 2 CŨ) & NÚT ĐĂNG ================= */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <p className="text-sm font-bold text-green-500 tracking-widest uppercase">
                  3. Album
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingAlbum(!isCreatingAlbum)
                    setErrors((prev) => ({ ...prev, newAlbumTitle: undefined }))
                  }}
                  className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isCreatingAlbum ? (
                    <>Hủy <ChevronUp className="size-3" /></>
                  ) : (
                    <>+ Mới <ChevronDown className="size-3" /></>
                  )}
                </button>
              </div>

              {isCreatingAlbum ? (
                /* FORM PHỤ TẠO ALBUM MỚI */
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
                  <p className="text-xs font-black text-zinc-500 tracking-widest uppercase">TẠO ALBUM MỚI</p>
                  
                  <div className="space-y-1.5">
                    <input 
                      type="text" 
                      placeholder="Tên Album mới... *" 
                      value={newAlbumTitle} 
                      onChange={(e) => {
                        setNewAlbumTitle(e.target.value)
                        clearFieldError("newAlbumTitle")
                      }} 
                      className={`w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none border transition-all ${
                        errors.newAlbumTitle ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-zinc-700"
                      }`}
                    />
                    {errors.newAlbumTitle && <p className="text-xs font-medium text-red-500 mt-1">{errors.newAlbumTitle}</p>}
                  </div>
                  
                  <textarea 
                    rows={3} 
                    placeholder="Mô tả ngắn..." 
                    value={newAlbumDesc} 
                    onChange={(e) => setNewAlbumDesc(e.target.value)} 
                    className="w-full rounded-lg bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none border border-zinc-800 focus:border-zinc-700 resize-none" 
                  />
                  {/* --- ĐÂY LÀ Ô THÊM ẢNH BÌA ALBUM MỚI --- */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ảnh bìa Album</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => { if (e.target.files && e.target.files[0]) setNewAlbumCover(e.target.files[0]) }} 
                      className="w-full rounded-lg bg-zinc-950 px-3 py-2 text-xs text-zinc-400 border border-zinc-800 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[10px] file:font-semibold file:text-white file:cursor-pointer cursor-pointer" 
                    />
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={handleSaveNewAlbum} 
                    className="w-full rounded-lg bg-zinc-200 py-2.5 text-sm font-bold text-black hover:bg-white cursor-pointer active:scale-95 transition-all"
                  >
                    Tạo Album
                  </button>
                </div>
              ) : (
                /* DROPDOWN CHỌN ALBUM SẴN CÓ */
                <div className="space-y-2">
                  <select 
                    value={selectedAlbumId} 
                    onChange={(e) => setSelectedAlbumId(e.target.value)} 
                    className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-base text-white outline-none border border-zinc-800 focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="">-- Single --</option>
                    {myAlbums.map((album) => (
                      <option key={album.id} value={album.id}>{album.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* NÚT SUBMIT */}
            <div className="pt-8">
              <button 
                type="submit" 
                className="w-full rounded-full bg-green-500 py-3.5 text-lg font-bold text-black transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg shadow-green-500/20"
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