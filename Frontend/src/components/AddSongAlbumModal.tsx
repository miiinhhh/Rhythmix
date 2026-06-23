import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { artistService } from "../api/artistService";
import { genreService } from "../api/genreService";
import { mediaService } from "../api/mediaService";
import type { ArtistDto, GenreDto } from "../types/api";

interface AddSongAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void | Promise<void>;
  albumId?: string;
  artistName?: string;
}

interface FormErrors {
  title?: string;
  artist?: string;
  selectedFile?: string;
  selectedGenreIds?: string;
  newGenreName?: string;
  submit?: string;
}

const AddSongAlbumModal = ({ isOpen, onClose, onUploaded, albumId, artistName }: AddSongAlbumModalProps) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isUnknownArtist, setIsUnknownArtist] = useState(false);
  const [artistSearchTerm, setArtistSearchTerm] = useState("");
  const [genreSearchTerm, setGenreSearchTerm] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);

  const [artistResults, setArtistResults] = useState<ArtistDto[]>([]);
  const [myGenres, setMyGenres] = useState<GenreDto[]>([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [isSavingGenre, setIsSavingGenre] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isChoosingArtist, setIsChoosingArtist] = useState(false);
  const [isChoosingGenre, setIsChoosingGenre] = useState(false);
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreDesc, setNewGenreDesc] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    if (!isOpen) return;

    // Set artist and albumId from props
    if (artistName) {
      setArtist(artistName);
    }
    if (albumId) {
      setSelectedAlbumId(albumId);
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [artists, genres] = await Promise.all([
          artistService.search(""),
          genreService.getAll(),
        ]);

        if (cancelled) return;
        setArtistResults(artists);
        setMyGenres(genres);
      } catch {
        if (!cancelled) {
          setArtistResults([]);
          setMyGenres([]);
          setErrors((prev) => ({ ...prev, submit: "Không tải được danh sách nghệ sĩ hoặc thể loại." }));
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, artistName, albumId]);

  useEffect(() => {
    if (!isOpen || !isChoosingArtist) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSearchingArtists(true);
      try {
        const artists = await artistService.search(artistSearchTerm.trim());
        if (!cancelled) setArtistResults(artists);
      } catch {
        if (!cancelled) setArtistResults([]);
      } finally {
        if (!cancelled) setIsSearchingArtists(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [artistSearchTerm, isChoosingArtist, isOpen]);

  const chooseArtist = (item: ArtistDto) => {
    setSelectedArtistId(item.artistId);
    setArtist(item.name);
    setIsUnknownArtist(false);
    setArtistSearchTerm(item.name);
    setIsChoosingArtist(false);
    clearFieldError("artist");
  };

  const chooseUnknownArtist = () => {
    setSelectedArtistId("");
    setArtist("");
    setIsUnknownArtist(true);
    setArtistSearchTerm("");
    setIsChoosingArtist(false);
    clearFieldError("artist");
  };

  const selectedGenres = myGenres.filter((item) => selectedGenreIds.includes(item.genreId));
  const filteredGenres = myGenres.filter((item) => item.name.toLowerCase().includes(genreSearchTerm.trim().toLowerCase()));

  const toggleGenre = (item: GenreDto) => {
    setSelectedGenreIds((current) =>
      current.includes(item.genreId)
        ? current.filter((genreId) => genreId !== item.genreId)
        : [...current, item.genreId]
    );
    setGenreSearchTerm("");
    clearFieldError("selectedGenreIds");
  };

  const handleSaveNewGenre = async () => {
    setErrors((prev) => ({ ...prev, newGenreName: undefined, selectedGenreIds: undefined }));

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
      setSelectedGenreIds((current) => [...new Set([...current, created.genreId])]);
      setGenreSearchTerm(created.name);
      setNewGenreName("");
      setNewGenreDesc("");
      setIsCreatingGenre(false);
      setIsChoosingGenre(false);
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        newGenreName: error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Không tạo được thể loại.",
      }));
    } finally {
      setIsSavingGenre(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Vui lòng nhập tên bài hát.";
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
        genreId: selectedGenreIds[0] || undefined,
        genreIds: selectedGenreIds,
        coverImage: selectedCoverImage || undefined,
      });

      await onUploaded?.();
      setTitle("");
      setArtist("");
      setIsUnknownArtist(false);
      setArtistSearchTerm("");
      setGenreSearchTerm("");
      setDescription("");
      setSelectedAlbumId("");
      setSelectedArtistId("");
      setSelectedGenreIds([]);
      setSelectedFile(null);
      setSelectedVideoFile(null);
      setSelectedCoverImage(null);
      onClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error?.response?.data?.message || error?.message || "Upload thất bại. Vui lòng kiểm tra API hoặc file media.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-950 p-10 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
          <X className="size-6" />
        </button>

        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">Tải nhạc mới</h2>
          <p className="mt-1.5 text-base text-zinc-400">Xuất bản tác phẩm âm nhạc lên hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="border-b border-zinc-900 pb-2 text-sm font-bold uppercase tracking-widest text-green-500">1. Thông tin cơ bản</p>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tên bài hát *</label>
                <input
                  type="text"
                  placeholder="Tên bài hát..."
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    clearFieldError("title");
                  }}
                  className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-sm text-white outline-none ${errors.title ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
                />
                {errors.title && <p className="text-xs font-medium text-red-500">{errors.title}</p>}
              </div>

              {!artistName ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nghệ sĩ</label>
                  <button
                    type="button"
                    onClick={() => setIsChoosingArtist(true)}
                    className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-left text-sm outline-none transition hover:border-zinc-700 ${
                      errors.artist ? "border-red-500" : "border-zinc-800"
                    }`}
                  >
                    {artist || isUnknownArtist ? (
                      <span className="flex items-center justify-between gap-3 text-white">
                        <span className="truncate font-semibold">{isUnknownArtist ? "Không rõ nghệ sĩ" : artist}</span>
                        <span className="shrink-0 text-xs font-bold text-green-400">Đổi</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">Chọn nghệ sĩ từ danh sách</span>
                    )}
                  </button>
                  {errors.artist && <p className="text-xs font-medium text-red-500">{errors.artist}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nghệ sĩ</label>
                  <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm text-white">
                    <span className="truncate font-semibold">{artistName}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mô tả</label>
                <textarea
                  rows={4}
                  placeholder="Thêm mô tả..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Thể loại</label>
                <button
                  type="button"
                  onClick={() => setIsChoosingGenre(true)}
                  className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-left text-sm outline-none transition hover:border-zinc-700 ${errors.selectedGenreIds ? "border-red-500" : "border-zinc-800"}`}
                >
                  {selectedGenres.length > 0 ? (
                    <span className="flex items-center justify-between gap-3 text-white">
                      <span className="truncate font-semibold">{selectedGenres.map((item) => item.name).join(", ")}</span>
                      <span className="shrink-0 text-xs font-bold text-green-400">Đổi</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">Chọn hoặc tạo thể loại</span>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="border-b border-zinc-800 pb-2 text-sm font-bold uppercase tracking-widest text-green-500">2. Tệp media</p>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tệp âm thanh *</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/*"
                  onChange={(event) => {
                    if (event.target.files?.[0]) {
                      setSelectedFile(event.target.files[0]);
                      clearFieldError("selectedFile");
                    }
                  }}
                  className={`w-full rounded-lg border bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white ${errors.selectedFile ? "border-red-500" : "border-zinc-800"}`}
                />
                {errors.selectedFile && <p className="text-xs font-medium text-red-500">{errors.selectedFile}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tệp video tùy chọn</label>
                <input type="file" accept="video/mp4,video/*" onChange={(event) => setSelectedVideoFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ảnh bìa</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setSelectedCoverImage(event.target.files?.[0] || null)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white" />
                {selectedCoverImage && <p className="text-xs text-zinc-500">{selectedCoverImage.name}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {errors.submit && <p className="self-center text-xs font-medium text-red-500">{errors.submit}</p>}
            <button
              type="submit"
              disabled={isUploading}
              className="rounded-full bg-green-500 px-8 py-2.5 text-lg font-bold text-black hover:bg-green-400 disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
            >
              {isUploading ? "Đang tải lên..." : "Xuất bản bài hát"}
            </button>
          </div>
        </form>

        {/* Artist Popup */}
        <ChooseArtistPopup
          open={isChoosingArtist}
          searchTerm={artistSearchTerm}
          artists={artistResults}
          selectedArtistId={selectedArtistId}
          searching={isSearchingArtists}
          onClose={() => setIsChoosingArtist(false)}
          onSearchChange={setArtistSearchTerm}
          onChoose={chooseArtist}
          onChooseUnknown={chooseUnknownArtist}
        />

        <ChooseGenrePopup
          open={isChoosingGenre}
          searchTerm={genreSearchTerm}
          genres={filteredGenres}
          selectedGenreIds={selectedGenreIds}
          isCreating={isCreatingGenre}
          name={newGenreName}
          description={newGenreDesc}
          error={errors.newGenreName}
          saving={isSavingGenre}
          onClose={() => setIsChoosingGenre(false)}
          onSearchChange={setGenreSearchTerm}
          onToggle={toggleGenre}
          onClear={() => {
            setSelectedGenreIds([]);
            setGenreSearchTerm("");
            setIsChoosingGenre(false);
          }}
          onToggleCreate={() => setIsCreatingGenre((current) => !current)}
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

type ChooseArtistPopupProps = {
  open: boolean;
  searchTerm: string;
  artists: ArtistDto[];
  selectedArtistId: string;
  searching: boolean;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onChoose: (artist: ArtistDto) => void;
  onChooseUnknown: () => void;
};

const ChooseArtistPopup = ({
  open,
  searchTerm,
  artists,
  selectedArtistId,
  searching,
  onClose,
  onSearchChange,
  onChoose,
  onChooseUnknown,
}: ChooseArtistPopupProps) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Chọn nghệ sĩ</h3>
            <p className="mt-1 text-xs text-zinc-400">Tìm nghệ sĩ đã có trong hệ thống để gắn với bài hát.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onChooseUnknown}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-left text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            <span>Không rõ nghệ sĩ</span>
            <span className="text-xs text-zinc-400">Không gắn nghệ sĩ</span>
          </button>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Nhập tên nghệ sĩ..."
            autoFocus
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-700"
          />

          <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-1.5">
            {searching ? (
              <p className="px-3 py-2 text-xs text-zinc-500">Đang tìm nghệ sĩ...</p>
            ) : artists.length > 0 ? (
              artists.map((item) => (
                <button
                  key={item.artistId}
                  type="button"
                  onClick={() => onChoose(item)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                    selectedArtistId === item.artistId ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span className="truncate font-medium">{item.name}</span>
                  {selectedArtistId === item.artistId && <span className="text-xs font-bold">Đã chọn</span>}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs text-zinc-500">Không tìm thấy nghệ sĩ phù hợp.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type ChooseGenrePopupProps = {
  open: boolean;
  searchTerm: string;
  genres: GenreDto[];
  selectedGenreIds: string[];
  isCreating: boolean;
  name: string;
  description: string;
  error?: string;
  saving: boolean;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onToggle: (genre: GenreDto) => void;
  onClear: () => void;
  onToggleCreate: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
};

const ChooseGenrePopup = ({
  open,
  searchTerm,
  genres,
  selectedGenreIds,
  isCreating,
  name,
  description,
  error,
  saving,
  onClose,
  onSearchChange,
  onToggle,
  onClear,
  onToggleCreate,
  onNameChange,
  onDescriptionChange,
  onSubmit,
}: ChooseGenrePopupProps) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Chọn thể loại</h3>
            <p className="mt-1 text-xs text-zinc-400">Tìm thể loại có sẵn hoặc tạo thể loại mới.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm thể loại..."
            autoFocus
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-700"
          />

          <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-1.5">
            <button
              type="button"
              onClick={onClear}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                selectedGenreIds.length === 0 ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="truncate font-medium">Không chọn thể loại</span>
              {selectedGenreIds.length === 0 && <span className="text-xs font-bold">Đã chọn</span>}
            </button>

            {genres.length > 0 ? (
              genres.map((item) => (
                <button
                key={item.genreId}
                type="button"
                onClick={() => onToggle(item)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                  selectedGenreIds.includes(item.genreId) ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                }`}
                >
                  <span className="truncate font-medium">{item.name}</span>
                  {selectedGenreIds.includes(item.genreId) && <span className="text-xs font-bold">Đã chọn</span>}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs text-zinc-500">Không tìm thấy thể loại phù hợp.</p>
            )}
          </div>

          <button type="button" onClick={onToggleCreate} className="w-full rounded-lg border border-zinc-800 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-900 hover:text-white">
            {isCreating ? "Ẩn tạo thể loại" : "+ Tạo thể loại mới"}
          </button>

          {isCreating && (
            <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <input
                type="text"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Tên thể loại mới... *"
                className={`w-full rounded-lg border bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none ${error ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
              />
              {error && <p className="text-xs font-medium text-red-500">{error}</p>}
              <textarea
                rows={3}
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Mô tả ngắn..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-zinc-700"
              />
              <button type="button" onClick={onSubmit} disabled={saving} className="w-full rounded-lg bg-green-500 py-2.5 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60">
                {saving ? "Đang tạo..." : "Tạo thể loại"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AddSongAlbumModal;
