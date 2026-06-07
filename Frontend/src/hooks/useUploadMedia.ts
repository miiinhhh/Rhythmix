import { useState } from "react"

export interface FormErrors {
  title?: string
  selectedFile?: string
  newAlbumTitle?: string
}

const useUploadMedia = (onClose: () => void) => {
  // 1. Toàn bộ State quản lý Bài hát
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAlbumId, setSelectedAlbumId] = useState("")
  const [trackCover, setTrackCover] = useState<File | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // 2. Giả lập danh sách Albums hiện có
  const [myAlbums, setMyAlbums] = useState([
    { id: "album-1", title: "After Hours" },
    { id: "album-2", title: "Lost in Saigon" },
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
    if (!title.trim()) newErrors.title = "Vui lòng nhập tên bài hát nha!"
    if (!selectedFile) newErrors.selectedFile = "Vui lòng chọn file nhạc (.mp3) để upload!"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    // SAU NÀY CONNECT DB: Khúc này bạn gom toàn bộ state tạo `FormData` để bắn lên Back-End cực kỳ gọn
    console.log("Dữ liệu sẵn sàng lên đường ra DB:", {
      title,
      description,
      selectedAlbumId,
      trackCover,
      selectedFile
    })

    alert("Upload nhạc lên hệ thống thành công!")
    onClose()
  }

  // Xuất bản (return) tất cả những gì Component UI cần xài
  return {
    title, setTitle,
    description, setDescription,
    selectedAlbumId, setSelectedAlbumId,
    trackCover, setTrackCover,
    selectedFile, setSelectedFile,
    myAlbums,
    isCreatingAlbum, setIsCreatingAlbum,
    newAlbumTitle, setNewAlbumTitle,
    newAlbumDesc, setNewAlbumDesc,
    newAlbumCover, setNewAlbumCover,
    errors, setErrors,
    clearFieldError,
    handleSaveNewAlbum,
    handleSubmit,
  }
}

export default useUploadMedia;