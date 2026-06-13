import { useNavigate } from "react-router-dom";
import { X } from "lucide-react"; // Dùng icon X cho chuyên nghiệp

const FollowModal = ({ isOpen, onClose, title, list }: { isOpen: boolean, onClose: () => void, title: string, list: any[] }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Hàm xử lý click chuyển trang
  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose(); // Đóng modal sau khi click
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm border border-zinc-800 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Thêm max-h-80 và overflow-y-auto để nếu danh sách dài quá sẽ tự scroll */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {list.length > 0 ? (
            list.map((u) => (
              <div 
                key={u.id} 
                onClick={() => handleUserClick(u.id)} // Click để chuyển trang
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <img src={u.avatarUrl} className="size-10 rounded-full object-cover" alt={u.name} />
                <span className="text-white font-medium truncate">{u.name}</span>
              </div>
            ))
          ) : (
            <p className="text-zinc-500 text-sm text-center py-4">Chưa có ai ở đây cả...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;