import { useState, useEffect } from "react";
import { playlistService } from "../api";

export const usePlaylists = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);


  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await playlistService.getAll();
AI    } catch {
      setError("Không thể tải playlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch: fetchPlaylists };
};

