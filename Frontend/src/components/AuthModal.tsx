import { useState } from "react";
import { Eye, EyeOff, X, Library } from "lucide-react";
import { MOCK_USERS } from "../data/mockData";

type Mode = "login" | "register";

// Khai báo kiểu dữ liệu cho Props của AuthModal
interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (name: string) => void;
}

const AuthModal = ({ open, onClose, onAuthenticated }: AuthModalProps) => {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Nếu state open = false thì không render gì cả
  if (!open) return null;

  // Hàm kiểm tra lỗi Client-side (Validation) trước khi xử lý
  const validate = () => {
    const next: Record<string, string> = {};
    if (mode === "register" && name.trim().length < 2) {
      next.name = "Please enter your name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }
    if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    if (mode === "register" && confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "login") {
      // 🟢 XỬ LÝ ĐĂNG NHẬP GIẢ LẬP THEO USER DATA
      const foundUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
      );

      if (foundUser) {
        // Nếu đúng user, lưu thông tin id và tên vào localStorage để hệ thống biết ai đang đăng nhập
        localStorage.setItem("currentUserId", foundUser.id);
        localStorage.setItem("currentUserName", foundUser.name);
        
        onAuthenticated(foundUser.name); // Trả tên ra cho header hiển thị
        setErrors({});
        onClose();
      } else {
        // Nếu sai thông tin
        setErrors({ auth: "Email hoặc mật khẩu không chính xác!" });
      }
    } else {
      // Chế độ đăng ký (để sau này kết nối BE xử lý)
      onAuthenticated(name);
      onClose();
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({}); // Xóa sạch lỗi cũ khi chuyển qua lại giữa Login/Register
    setConfirmPassword("");
    setShowPassword(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white"
      role="dialog"
      aria-modal="true"
    >
      {/* Lớp nền mờ tối (Overlay Backdrop) bao phủ toàn màn hình ứng dụng */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Khung Modal chính: Tone màu Zinc mượt mà đồng bộ với SideBar */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800/80 bg-zinc-900 p-8 shadow-2xl transition-all">
        {/* Nút đóng (X) ở góc trên bên phải */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <X className="size-5" />
        </button>

        {/* Khối Tiêu đề & Logo hệ thống */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-green-500/20">
            <Library className="size-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {mode === "login"
              ? "Log in to continue to Soundwave."
              : "Sign up to start listening."}
          </p>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "register" && (
            <Field
              id="auth-name"
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              error={errors.name}
              placeholder="Your name"
            />
          )}
          {errors.auth && (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-2.5 text-center text-xs font-semibold text-red-400">
              {errors.auth}
            </div>
          )}
          <Field
            id="auth-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            placeholder="you@example.com"
          />
          <PasswordField
            id="auth-password"
            label="Password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            placeholder="••••••••"
            visible={showPassword}
            onToggleVisibility={() => setShowPassword((current) => !current)}
          />

          {mode === "register" && (
            <PasswordField
              id="auth-confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              visible={showConfirmPassword} 
              onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          )}

          {/* Nút bấm Submit kiểu Pill-shaped bo tròn màu xanh lá */}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-full bg-green-500 py-3 text-sm font-bold text-black transition-all hover:bg-green-400 active:scale-[0.98]"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        {/* Chuyển đổi luân phiên giữa Login và Register */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-green-500 hover:text-green-400 hover:underline focus:outline-none"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

// Component Input Field tùy chỉnh để tái sử dụng trong Form
interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

const Field = ({
  id,
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
}: FieldProps) => {
  return (
    <div className="text-left">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full rounded-md border bg-zinc-800/60 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-500/80 focus:ring-red-500/50"
            : "border-zinc-700/60 focus:ring-green-500/50 focus:border-green-500"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  visible: boolean;
  onToggleVisibility: () => void;
}
// Con mắt password
const PasswordField = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  visible,
  onToggleVisibility,
}: PasswordFieldProps) => {
  return (
    <div className="text-left">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`w-full rounded-md border bg-zinc-800/60 px-3 py-2 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-500/80 focus:ring-red-500/50"
              : "border-zinc-700/60 focus:ring-green-500/50 focus:border-green-500"
          }`}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition-colors hover:text-white"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default AuthModal;
