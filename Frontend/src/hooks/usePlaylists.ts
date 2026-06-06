import { useState, useEffect } from 'react';
import { playlistService } from '../api';

export const usePlaylists = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await playlistService.getAll();
      setData(res.data);
    } catch (err) {
      setError('Không thể tải playlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  return { data, loading, error, refetch: fetchPlaylists };
};