﻿﻿﻿﻿﻿import { X } from "lucide-react";
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
  selectedFile?: string;
  newAlbumTitle?: string;
  selectedGenreIds?: string;
  newGenreName?: string;
  submit?: string;
}

const UploadMediaModal = ({ isOpen, onClose, onUploaded }: UploadMediaModalProps) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isUnknownArtist, setIsUnknownArtist] = useState(false);
  const [artistSearchTerm, setArtistSearchTerm] = useState("");
  const [albumSearchTerm, setAlbumSearchTerm] = useState("");
  const [genreSearchTerm, setGenreSearchTerm] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);

  const [myAlbums, setMyAlbums] = useState<AlbumDto[]>([]);
  const [artistResults, setArtistResults] = useState<ArtistDto[]>([]);
  const [myGenres, setMyGenres] = useState<GenreDto[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [isSavingGenre, setIsSavingGenre] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isChoosingArtist, setIsChoosingArtist] = useState(false);
  const [isChoosingAlbum, setIsChoosingAlbum] = useState(false);
  const [isChoosingGenre, setIsChoosingGenre] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [newAlbumCoverImage, setNewAlbumCoverImage] = useState<File | null>(null);
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
        setArtistResults(artists);
        setMyGenres(genres);
      } catch {
        if (!cancelled) {
          setMyAlbums([]);
          setArtistResults([]);
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

  const selectedAlbum = myAlbums.find((item) => item.albumId === selectedAlbumId);
  const selectedGenres = myGenres.filter((item) => selectedGenreIds.includes(item.genreId));
  const filteredAlbums = myAlbums.filter((item) => item.title.toLowerCase().includes(albumSearchTerm.trim().toLowerCase()));
  const filteredGenres = myGenres.filter((item) => item.name.toLowerCase().includes(genreSearchTerm.trim().toLowerCase()));

  const chooseAlbum = (item: AlbumDto) => {
    setSelectedAlbumId(item.albumId);
    setAlbumSearchTerm(item.title);
    setIsChoosingAlbum(false);
  };

  const toggleGenre = (item: GenreDto) => {
    setSelectedGenreIds((current) =>
      current.includes(item.genreId)
        ? current.filter((genreId) => genreId !== item.genreId)
        : [...current, item.genreId]
    );
    setGenreSearchTerm("");
    clearFieldError("selectedGenreIds");
  };

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
        coverImage: newAlbumCoverImage || undefined,
      });
      setMyAlbums((current) => [newAlbum, ...current]);
      setSelectedAlbumId(newAlbum.albumId);
      setAlbumSearchTerm(newAlbum.title);
      setNewAlbumTitle("");
      setNewAlbumDesc("");
      setNewAlbumCoverImage(null);
      setIsCreatingAlbum(false);
      setIsChoosingAlbum(false);
    } catch {
      setErrors((prev) => ({ ...prev, newAlbumTitle: "Không tạo được album." }));
    } finally {
      setIsSavingAlbum(false);
    }
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
      setMyGenres((current) => {
        const exists = current.some((g) => g.genreId === created.genreId);
        if (exists) return current;

        return [...current, created];
      });
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
        videoFile: selectedFile ? selectedVideoFile || undefined : undefined,
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
      setAlbumSearchTerm("");
      setGenreSearchTerm("");
      setSelectedArtistId("");
      setDescription("");
      setSelectedAlbumId("");
      setSelectedGenreIds([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
          <X className="size-6" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">Tải nhạc mới</h2>
          <p className="mt-1.5 text-sm text-zinc-400">Xuất bản tác phẩm âm nhạc của bạn lên hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nghệ sĩ</label>
              <button
                type="button"
                onClick={() => setIsChoosingArtist(true)}
                className={`w-full rounded-lg border bg-zinc-900 px-4 py-3 text-left text-sm outline-none transition hover:border-zinc-700 ${errors.artist ? "border-red-500" : "border-zinc-800"
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

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <p className="text-sm font-bold uppercase tracking-widest text-green-500">3. Album</p>
              </div>
              <button
                type="button"
                onClick={() => setIsChoosingAlbum(true)}
                className="w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-base text-white outline-none transition hover:border-zinc-700"
              >
                {selectedAlbum ? (
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate font-semibold">{selectedAlbum.title}</span>
                    <span className="shrink-0 text-xs font-bold text-green-400">Đổi</span>
                  </span>
                ) : (
                  <span className="text-zinc-500">-- Single --</span>
                )}
              </button>
            </div>
            <div className="pt-8">
              <button type="submit" disabled={isUploading} className="w-full rounded-full bg-green-500 py-3.5 text-lg font-bold text-black shadow-lg shadow-green-500/20 transition-all hover:scale-[1.01] disabled:opacity-60">
                {isUploading ? "Đang xuất bản..." : "Xuất bản bài hát"}
              </button>
              {errors.submit && <p className="mt-3 text-center text-xs font-medium text-red-500">{errors.submit}</p>}
            </div>
          </div>
        </form>

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

        <ChooseAlbumPopup
          open={isChoosingAlbum}
          searchTerm={albumSearchTerm}
          albums={filteredAlbums}
          selectedAlbumId={selectedAlbumId}
          isCreating={isCreatingAlbum}
          newTitle={newAlbumTitle}
          newDescription={newAlbumDesc}
          newCoverImage={newAlbumCoverImage}
          titleError={errors.newAlbumTitle}
          saving={isSavingAlbum}
          loading={isLoadingAlbums}
          onClose={() => setIsChoosingAlbum(false)}
          onSearchChange={setAlbumSearchTerm}
          onChoose={chooseAlbum}
          onClear={() => {
            setSelectedAlbumId("");
            setAlbumSearchTerm("");
            setIsChoosingAlbum(false);
          }}
          onToggleCreate={() => setIsCreatingAlbum((current) => !current)}
          onTitleChange={(value) => {
            setNewAlbumTitle(value);
            clearFieldError("newAlbumTitle");
          }}
          onDescriptionChange={setNewAlbumDesc}
          onCoverImageChange={setNewAlbumCoverImage}
          onCreate={handleSaveNewAlbum}
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
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
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
            className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
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
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-700"
          />

          <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-1.5">
            {searching ? (
              <p className="px-3 py-2 text-xs text-zinc-500">Đang tìm nghệ sĩ...</p>
            ) : artists.length > 0 ? (
              artists.map((item) => (
                <button
                  key={item.artistId}
                  type="button"
                  onClick={() => onChoose(item)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${selectedArtistId === item.artistId ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
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

type ChooseAlbumPopupProps = {
  open: boolean;
  searchTerm: string;
  albums: AlbumDto[];
  selectedAlbumId: string;
  isCreating: boolean;
  newTitle: string;
  newDescription: string;
  newCoverImage: File | null;
  titleError?: string;
  saving: boolean;
  loading: boolean;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onChoose: (album: AlbumDto) => void;
  onClear: () => void;
  onToggleCreate: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCoverImageChange: (file: File | null) => void;
  onCreate: () => void;
};

const ChooseAlbumPopup = ({
  open,
  searchTerm,
  albums,
  selectedAlbumId,
  isCreating,
  newTitle,
  newDescription,
  newCoverImage,
  titleError,
  saving,
  loading,
  onClose,
  onSearchChange,
  onChoose,
  onClear,
  onToggleCreate,
  onTitleChange,
  onDescriptionChange,
  onCoverImageChange,
  onCreate,
}: ChooseAlbumPopupProps) => {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Chọn album</h3>
            <p className="mt-1 text-xs text-zinc-400">Tìm album có sẵn, để single, hoặc tạo album mới.</p>
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
            placeholder="Tìm album..."
            autoFocus
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-700"
          />

          <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-1.5">
            <button
              type="button"
              onClick={onClear}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${!selectedAlbumId ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                }`}
            >
              <span className="truncate font-medium">-- Single --</span>
              {!selectedAlbumId && <span className="text-xs font-bold">Đã chọn</span>}
            </button>

            {loading ? (
              <p className="px-3 py-2 text-xs text-zinc-500">Đang tải album...</p>
            ) : albums.length > 0 ? (
              albums.map((item) => (
                <button
                  key={item.albumId}
                  type="button"
                  onClick={() => onChoose(item)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${selectedAlbumId === item.albumId ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    }`}
                >
                  <span className="truncate font-medium">{item.title}</span>
                  {selectedAlbumId === item.albumId && <span className="text-xs font-bold">Đã chọn</span>}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs text-zinc-500">Không tìm thấy album phù hợp.</p>
            )}
          </div>

          <button type="button" onClick={onToggleCreate} className="w-full rounded-lg border border-zinc-800 py-2 text-sm font-bold text-zinc-300 hover:bg-zinc-900 hover:text-white">
            {isCreating ? "Ẩn tạo album" : "+ Tạo album mới"}
          </button>

          {isCreating && (
            <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <input
                type="text"
                value={newTitle}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Tên album mới... *"
                className={`w-full rounded-lg border bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none ${titleError ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
              />
              {titleError && <p className="text-xs font-medium text-red-500">{titleError}</p>}
              <textarea
                rows={3}
                value={newDescription}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Mô tả ngắn..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-700"
              />
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Ảnh bìa album
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => onCoverImageChange(event.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                />

                {newCoverImage && (
                  <p className="text-xs text-zinc-500">{newCoverImage.name}</p>
                )}
              </div>
              <button type="button" onClick={onCreate} disabled={saving} className="w-full rounded-lg bg-zinc-200 py-2.5 text-sm font-bold text-black hover:bg-white disabled:opacity-60">
                {saving ? "Đang tạo..." : "Tạo album"}
              </button>
            </div>
          )}
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
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
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
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-zinc-700"
          />

          <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-1.5">
            <button
              type="button"
              onClick={onClear}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${selectedGenreIds.length === 0 ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
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
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${selectedGenreIds.includes(item.genreId) ? "bg-green-500 text-black" : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
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
                className={`w-full rounded-lg border bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none ${error ? "border-red-500" : "border-zinc-800 focus:border-zinc-700"}`}
              />
              {error && <p className="text-xs font-medium text-red-500">{error}</p>}
              <textarea
                rows={3}
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Mô tả ngắn..."
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-700"
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
export default UploadMediaModal;