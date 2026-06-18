import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { albumService } from "../api/albumService";
import { artistService } from "../api/artistService";
import { genreService } from "../api/genreService";
import { mediaService } from "../api/mediaService";
import type { AlbumDto, ArtistDto, GenreDto } from "../types/api";

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void | Promise<void>;
}

interface FormErrors {
  title?: string;
  artist?: string;
  newArtistName?: string;
  selectedFile?: string;
  newAlbumTitle?: string;
  selectedGenreId?: string;
  newGenreName?: string;
  submit?: string;
}

const UploadMediaModal = ({ isOpen, onClose, onUploaded }: UploadMediaModalProps) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);

  const [myAlbums, setMyAlbums] = useState<AlbumDto[]>([]);
  const [myArtists, setMyArtists] = useState<ArtistDto[]>([]);
  const [myGenres, setMyGenres] = useState<GenreDto[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [isSavingArtist, setIsSavingArtist] = useState(false);
  const [isSavingGenre, setIsSavingGenre] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistDesc, setNewArtistDesc] = useState("");
  const [newArtistAvatar, setNewArtistAvatar] = useState<File | null>(null);
  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreDesc, setNewGenreDesc] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const load = async () => {
      setIsLoadingAlbums(true);
      try {
        const [albums, artists, genres] = await Promise.all([
          albumService.getMyAlbums(),
          artistService.search(""),
          genreService.getAll(),
        ]);

        if (cancelled) return;
        setMyAlbums(albums);
        setMyArtists(artists);
        setMyGenres(genres);
      } catch {
        if (!cancelled) {
          setMyAlbums([]);
          setMyArtists([]);
          setMyGenres([]);
          setErrors((prev) => ({ ...prev, submit: "Không tải được danh sách album, nghệ sĩ hoặc thể loại." }));
        }
      } finally {
        if (!cancelled) setIsLoadingAlbums(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSaveNewAlbum = async () => {
    setErrors((prev) => ({ ...prev, newAlbumTitle: undefined }));

    if (!newAlbumTitle.trim()) {
      setErrors((prev) => ({ ...prev, newAlbumTitle: "Vui lòng nhập tên album." }));
      return;
    }

    setIsSavingAlbum(true);
    try {
      const newAlbum = await albumService.create({
        title: newAlbumTitle.trim(),
        description: newAlbumDesc.trim() || undefined,
      });
      setMyAlbums((current) => [newAlbum, ...current]);
      setSelectedAlbumId(newAlbum.albumId);
      setNewAlbumTitle("");
      setNewAlbumDesc("");
      setIsCreatingAlbum(false);
    } catch {
      setErrors((prev) => ({ ...prev, newAlbumTitle: "Không tạo được album." }));
    } finally {
      setIsSavingAlbum(false);
    }
  };

  const handleSaveNewArtist = async () => {
    setErrors((prev) => ({ ...prev, newArtistName: undefined, artist: undefined }));

    const name = newArtistName.trim();
    if (!name) {
      setErrors((prev) => ({ ...prev, newArtistName: "Vui lòng nhập tên nghệ sĩ." }));
      return;
    }

    if (myArtists.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setErrors((prev) => ({ ...prev, newArtistName: "Tên nghệ sĩ đã tồn tại." }));
      return;
    }

    setIsSavingArtist(true);
    try {
      const created = await artistService.create({
        name,
        description: newArtistDesc.trim() || undefined,
        avatarImage: newArtistAvatar || undefined,
      });
      setMyArtists((current) => [created, ...current]);
      setSelectedArtistId(created.artistId);
      setArtist(created.name);
      setNewArtistName("");
      setNewArtistDesc("");
      setNewArtistAvatar(null);
      setIsCreatingArtist(false);
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        newArtistName: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Không tạo được nghệ sĩ.",
      }));
    } finally {
      setIsSavingArtist(false);
    }
  };

  const handleSaveNewGenre = async () => {
    setErrors((prev) => ({ ...prev, newGenreName: undefined, selectedGenreId: undefined }));

    const name = newGenreName.trim();
    if (!name) {
      setErrors((prev) => ({ ...prev, newGenreName: "Vui lòng nhập tên thể loại." }));
      return;
    }

    if (myGenres.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setErrors((prev) => ({ ...prev, newGenreName: "Thể loại đã tồn tại." }));
      return;
    }

    setIsSavingGenre(true);
    try {
      const created = await genreService.create({
        name,
        description: newGenreDesc.trim() || undefined,
      });
      setMyGenres((current) => [created, ...current]);
      setSelectedGenreId(created.genreId);
      setNewGenreName("");
      setNewGenreDesc("");
      setIsCreatingGenre(false);
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        newGenreName: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Không tạo được thể loại.",
      }));
    } finally {
      setIsSavingGenre(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Vui lòng nhập tên bài hát.";
    if (!artist.trim()) nextErrors.artist = "Vui lòng chọn hoặc tạo nghệ sĩ.";
    if (!selectedFile && !selectedVideoFile) nextErrors.selectedFile = "Vui lòng chọn file media.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsUploading(true);
    try {
      await mediaService.uploadMedia({
        file: selectedFile || selectedVideoFile!,
        title: title.trim(),
        artistName: artist.trim(),
        description: description.trim() || undefined,
        isPublic: true,
        albumId: selectedAlbumId || undefined,
        genreId: selectedGenreId || undefined,
        coverImage: selectedCoverImage || undefined,
      });

      await onUploaded?.();
      setTitle("");
      setArtist("");
      setSelectedArtistId("");
      setDescription("");
      setSelectedAlbumId("");
      setSelectedGenreId("");
      setSelectedFile(null);
      setSelectedVideoFile(null);
      setSelectedCoverImage(null);
      onClose();
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.response?.data?.message || "Upload thất bại. Vui lòng kiểm tra API hoặc file media.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-7xl rounded-2xl border border-zinc-800 bg-zinc-950 p-10 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
          <X className="size-6" />
        </button>

        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">Tải nhạc mới</h2>
          <p className="mt-1.5 text-base text-zinc-400">Xuất bản tác phẩm âm nhạc của bạn lên hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6">
            <p className="border-b border-zinc-900 pb-2 text-sm font-bold uppercase tracking-widest text-green-500">1. Thông tin cơ bản</p>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tên bài hát *</label>
              <input
                type="text"
                placeholder="Tên bài hát..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearFieldError("title");
                }}
                className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-sm text-white outline-none ${errors.title ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
              />
              {errors.title && <p className="text-xs font-medium text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nghệ sĩ *</label>
                <button type="button" onClick={() => setIsCreatingArtist((current) => !current)} className="text-xs font-bold text-zinc-400 hover:text-white">
                  + Tạo nghệ sĩ
                </button>
              </div>
              <select
                value={selectedArtistId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedArtistId(id);
                  const selected = myArtists.find((item) => item.artistId === id);
                  setArtist(selected?.name || "");
                  clearFieldError("artist");
                }}
                className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-sm text-white outline-none ${errors.artist ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
              >
                <option value="">Chọn nghệ sĩ có sẵn</option>
                {myArtists.map((item) => (
                  <option key={item.artistId} value={item.artistId}>{item.name}</option>
                ))}
              </select>
              {errors.artist && <p className="text-xs font-medium text-red-500">{errors.artist}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mô tả</label>
              <textarea
                rows={4}
                placeholder="Thêm mô tả..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Thể loại</label>
                <button type="button" onClick={() => setIsCreatingGenre((current) => !current)} className="text-xs font-bold text-zinc-400 hover:text-white">
                  + Tạo thể loại
                </button>
              </div>
              {selectedGenreId && (
                <span className="inline-flex items-center gap-1 rounded border border-green-500/50 bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  {myGenres.find((item) => item.genreId === selectedGenreId)?.name}
                  <button type="button" onClick={() => setSelectedGenreId("")}>
                    <X className="size-3" />
                  </button>
                </span>
              )}
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedGenreId(e.target.value);
                    clearFieldError("selectedGenreId");
                  }
                }}
                className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-sm text-white outline-none ${errors.selectedGenreId ? "border-red-500" : "border-zinc-800"}`}
              >
                <option value="">Chọn thể loại</option>
                {myGenres.map((item) => (
                  <option key={item.genreId} value={item.genreId} disabled={selectedGenreId === item.genreId}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="border-b border-zinc-800 pb-2 text-sm font-bold uppercase tracking-widest text-green-500">2. Tệp media</p>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tệp âm thanh *</label>
              <input type="file" accept="audio/mp3,audio/*" onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                  clearFieldError("selectedFile");
                }
              }} className={`w-full rounded-lg border bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white ${errors.selectedFile ? "border-red-500" : "border-zinc-800"}`} />
              {errors.selectedFile && <p className="text-xs font-medium text-red-500">{errors.selectedFile}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tệp video tùy chọn</label>
              <input type="file" accept="video/mp4,video/*" onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ảnh bìa</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setSelectedCoverImage(e.target.files?.[0] || null)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white" />
              {selectedCoverImage && <p className="text-xs text-zinc-500">{selectedCoverImage.name}</p>}
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <p className="text-sm font-bold uppercase tracking-widest text-green-500">3. Album</p>
                <button type="button" onClick={() => setIsCreatingAlbum(!isCreatingAlbum)} className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white">
                  {isCreatingAlbum ? <>Hủy <ChevronUp className="size-3" /></> : <>+ Mới <ChevronDown className="size-3" /></>}
                </button>
              </div>
              {isCreatingAlbum ? (
                <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Tạo album mới</p>
                  <input
                    type="text"
                    placeholder="Tên album mới... *"
                    value={newAlbumTitle}
                    onChange={(e) => {
                      setNewAlbumTitle(e.target.value);
                      clearFieldError("newAlbumTitle");
                    }}
                    className={`w-full rounded-lg border bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all ${
                      errors.newAlbumTitle ? "border-red-500 focus:border-red-500" : "border-zinc-800 focus:border-zinc-700"
                    }`}
                  />
                  {errors.newAlbumTitle && <p className="text-xs font-medium text-red-500">{errors.newAlbumTitle}</p>}
                  <textarea
                    rows={3}
                    placeholder="Mô tả ngắn..."
                    value={newAlbumDesc}
                    onChange={(e) => setNewAlbumDesc(e.target.value)}
                    className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewAlbum}
                    disabled={isSavingAlbum}
                    className="w-full cursor-pointer rounded-lg bg-zinc-200 py-2.5 text-sm font-bold text-black transition-all hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingAlbum ? "Đang tạo..." : "Tạo album"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                    className="w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-base text-white outline-none focus:border-zinc-700"
                  >
                    <option value="">{isLoadingAlbums ? "Đang tải album..." : "-- Single --"}</option>
                    {myAlbums.map((album) => (
                      <option key={album.albumId} value={album.albumId}>{album.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="pt-8">
              <button type="submit" disabled={isUploading} className="w-full rounded-full bg-green-500 py-3.5 text-lg font-bold text-black shadow-lg shadow-green-500/20 transition-all hover:scale-[1.01] disabled:opacity-60">
                {isUploading ? "Đang xuất bản..." : "Xuất bản bài hát"}
              </button>
              {errors.submit && <p className="mt-3 text-center text-xs font-medium text-red-500">{errors.submit}</p>}
            </div>
          </div>
        </form>

        <CreateArtistPopup
          open={isCreatingArtist}
          name={newArtistName}
          description={newArtistDesc}
          avatar={newArtistAvatar}
          error={errors.newArtistName}
          saving={isSavingArtist}
          onClose={() => {
            setIsCreatingArtist(false);
            setErrors((prev) => ({ ...prev, newArtistName: undefined }));
          }}
          onNameChange={(value) => {
            setNewArtistName(value);
            clearFieldError("newArtistName");
          }}
          onDescriptionChange={setNewArtistDesc}
          onAvatarChange={setNewArtistAvatar}
          onSubmit={handleSaveNewArtist}
        />

        <CreateGenrePopup
          open={isCreatingGenre}
          name={newGenreName}
          description={newGenreDesc}
          error={errors.newGenreName}
          saving={isSavingGenre}
          onClose={() => {
            setIsCreatingGenre(false);
            setErrors((prev) => ({ ...prev, newGenreName: undefined }));
          }}
          onNameChange={(value) => {
            setNewGenreName(value);
            clearFieldError("newGenreName");
          }}
          onDescriptionChange={setNewGenreDesc}
          onSubmit={handleSaveNewGenre}
        />
      </div>
    </div>
  );
};

type CreateArtistPopupProps = {
  open: boolean;
  name: string;
  description: string;
  avatar: File | null;
  error?: string;
  saving: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAvatarChange: (file: File | null) => void;
  onSubmit: () => void;
};

const CreateArtistPopup = ({
  open,
  name,
  description,
  avatar,
  error,
  saving,
  onClose,
  onNameChange,
  onDescriptionChange,
  onAvatarChange,
  onSubmit,
}: CreateArtistPopupProps) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Tạo nghệ sĩ mới</h3>
            <p className="mt-1 text-xs text-zinc-400">Tên nghệ sĩ sẽ được kiểm tra trùng trước khi lưu.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Tên nghệ sĩ *</label>
            <input
              type="text"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Nhập tên nghệ sĩ..."
              className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-white outline-none ${error ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
            />
            {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Mô tả</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Mô tả ngắn về nghệ sĩ..."
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Avatar nghệ sĩ</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onAvatarChange(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[10px] file:font-semibold file:text-white"
            />
            {avatar && <p className="mt-1 text-xs text-zinc-500">{avatar.name}</p>}
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="w-full rounded-full bg-green-500 py-2.5 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
          >
            {saving ? "Đang tạo..." : "Tạo nghệ sĩ"}
          </button>
        </div>
      </div>
    </div>
  );
};

type CreateGenrePopupProps = {
  open: boolean;
  name: string;
  description: string;
  error?: string;
  saving: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
};

const CreateGenrePopup = ({
  open,
  name,
  description,
  error,
  saving,
  onClose,
  onNameChange,
  onDescriptionChange,
  onSubmit,
}: CreateGenrePopupProps) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Tạo thể loại mới</h3>
            <p className="mt-1 text-xs text-zinc-400">Tên thể loại sẽ được kiểm tra trùng trước khi lưu.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Tên thể loại *</label>
            <input
              type="text"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Nhập tên thể loại..."
              className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-white outline-none ${error ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
            />
            {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400">Mô tả</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Mô tả ngắn về thể loại..."
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
            />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="w-full rounded-full bg-green-500 py-2.5 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
          >
            {saving ? "Đang tạo..." : "Tạo thể loại"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadMediaModal;
