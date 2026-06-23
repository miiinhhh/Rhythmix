import React, { useState, useEffect } from "react";
import { Music, X } from "lucide-react";

import type { AlbumDetailDto } from "../types/api";
import { albumService } from "../api/albumService";
import { resolveAssetUrl } from "../config/apiConfig";

interface UpdateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  AlbumData: AlbumDetailDto;
  onUpdateSuccess: () => void;
}

const UpdateAlbumModal: React.FC<UpdateAlbumModalProps> = ({
  isOpen,
  onClose,
  AlbumData,
  onUpdateSuccess,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && AlbumData) {
      setName(AlbumData.title ?? "");
      setDescription(AlbumData.description ?? "");
      setCoverImage(null);
      setPreviewUrl(AlbumData.coverImageUrl ?? null);
      setError("");
    }
  }, [isOpen, AlbumData]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setError("");
    setCoverImage(null);
    setPreviewUrl(AlbumData.coverImageUrl ?? null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập tên album!");
      return;
    }

    setIsLoading(true);
    try {
      await albumService.update(AlbumData.albumId, {
        title: name.trim(),
        description: description.trim() || undefined,
        coverImage: coverImage || undefined, // Gửi file ảnh bìa mới nếu có
      });

      onUpdateSuccess();
      handleCloseModal();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Cập nhật Album thất bại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
      {/* Khung Modal */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-lg p-6 shadow-2xl relative select-none">
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          Cập nhật album
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cụm Layout chính (Bìa giả lập + Ô nhập liệu) */}
          <div className="flex gap-4">
            {/* Bên trái: Ảnh bìa (click để upload local) */}
            <label className="w-40 h-40 bg-zinc-900 border border-zinc-800 rounded flex flex-col items-center justify-center text-zinc-500 shadow-inner shrink-0 group relative cursor-pointer overflow-hidden">
              {coverImage ? (
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="Album cover preview"
                  className="size-full object-cover"
                />
              ) : previewUrl || AlbumData?.coverImageUrl ? (
                <img
                  src={resolveAssetUrl((previewUrl || AlbumData.coverImageUrl)!)}
                  alt={AlbumData.title}
                  className="size-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <>
                  <Music
                    size={44}
                    className="text-zinc-600 group-hover:scale-110 transition-transform"
                  />
                  <span className="absolute bottom-2 text-[10px] text-zinc-500 font-medium text-center px-1">
                    Ảnh bìa tự động
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            {/* Bên phải: 2 ô Input (Name & Description) */}
            <div className="flex-1 flex flex-col justify-between space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Tên <span className="text-green-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Thêm tên album"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  maxLength={255}
                  className={`w-full bg-zinc-800 text-white text-sm p-2.5 rounded focus:outline-none transition-all placeholder-zinc-500 border ${
                    error
                      ? "border-red-500 focus:border-red-500"
                      : "border-transparent focus:border-zinc-700"
                  }`}
                />

                {error && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 animate-[fadeIn_0.15s_ease-out]">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Mô tả
                </label>
                <textarea
                  placeholder="Thêm mô tả (không bắt buộc)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-800 text-white text-sm p-2.5 rounded focus:outline-none border border-transparent focus:border-zinc-700 transition-colors placeholder-zinc-500 resize-none h-[76px] custom-scrollbar"
                />
              </div>
            </div>
          </div>

          {/* Nút bấm Cập nhật */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-white text-black font-bold text-sm px-7 py-2.5 rounded-full hover:scale-105 transition-transform cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật album"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAlbumModal;
