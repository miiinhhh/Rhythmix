import { useEffect, useState } from "react";
import { Eye, EyeOff, X, Library } from "lucide-react";
import { authService } from "../api/authService";

type Mode = "login" | "register";
type RegisterStep = "form" | "otp";

// Khai báo kiểu dữ liệu cho Props của AuthModal
interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (name: string) => void;
  initialMode?: Mode;
}


const AuthModal = ({ open, onClose, onAuthenticated, initialMode = "login", }: AuthModalProps) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setRegisterStep("form");
      setErrors({});
      setSuccessMessage(null);
      setOtp("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, initialMode]);


  // Nếu state open = false thì không render gì cả
  if (!open) return null;

  // Hàm kiểm tra lỗi Client-side (Validation) trước khi xử lý
  const validate = () => {
    const next: Record<string, string> = {};

    // ── NAME ──────────────────────────────────────────────
    if (mode === "register" && registerStep === "form" && name.trim().length < 2) {
      next.name = "Please enter your name.";
    }

    // ── EMAIL ─────────────────────────────────────────────
    if (registerStep === "form") {
      const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        next.email = "Enter a valid email address.";
      } else {
        const domain     = email.toLowerCase().split("@")[1] ?? "";
        const tld        = domain.split(".").pop() ?? "";
        const domainName = domain.split(".").slice(0, -1).join(".");

        const knownProviders   = ["gmail", "yahoo", "hotmail", "outlook", "icloud"];
        const validCountryTLDs = ["vn", "uk", "jp", "kr", "au", "de", "fr", "us", "ca", "sg", "id", "th", "my"];

        const editDistance = (a: string, b: string): number => {
          const dp = Array.from({ length: a.length + 1 }, (_, i) =>
            Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
          );
          for (let i = 1; i <= a.length; i++)
            for (let j = 1; j <= b.length; j++)
              dp[i][j] = a[i-1] === b[j-1]
                ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
          return dp[a.length][b.length];
        };

        const isExactProvider = knownProviders.includes(domainName);

        // gmail.co → TLD sai
        if (isExactProvider && tld.length === 2 && !validCountryTLDs.includes(tld)) {
          next.email = "Enter a valid email address.";
        }
        // gmai.com / yahooo.com → tên provider gõ sai 1 ký tự
        else if (!isExactProvider && knownProviders.some(p => editDistance(domainName, p) === 1)) {
          next.email = "Enter a valid email address.";
        }
      }
    }

    // ── PASSWORD ──────────────────────────────────────────
    if (registerStep === "form") {
      if (mode === "register") {
        if (password.length < 6) {
          next.password = "Password must be at least 6 characters.";
        } else if (!/[A-Z]/.test(password)) {
          next.password = "Password must contain at least one uppercase letter.";
        } else if (!/[0-9]/.test(password)) {
          next.password = "Password must contain at least one number.";
        } else if (!/[!@#$%^&*(),.?\":{}|<>_\-\[\]\\\/`~;'+]/.test(password)) {
          next.password = "Password must contain at least one special character.";
        }

        // ── CONFIRM PASSWORD ──────────────────────────────────
        if (next.password) {
          next.confirmPassword = "Please fix your password above first.";
        } else if (confirmPassword !== password) {
          next.confirmPassword = "Passwords do not match.";
        }
      } else {
        // login: only basic length check
        if (password.length < 6) {
          next.password = "Password must be at least 6 characters.";
        }
      }
    }

    // ── OTP ───────────────────────────────────────────────
    if (mode === "register" && registerStep === "otp" && otp.trim().length === 0) {
      next.otp = "Please enter OTP.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      if (mode === "login") {
        const result = await authService.login({ email, password });
        const userName = result?.userName ?? result?.user?.userName ?? name;

        onAuthenticated(userName);
        setErrors({});
        return;
      }

      // Bước 1: Register form -> gửi OTP
      if (mode === "register" && registerStep === "form") {
        await authService.sendRegisterOtp({
          email,
          userName: name,
        });

        setErrors({});
        setSuccessMessage("OTP đã được gửi về email.");
        setRegisterStep("otp");
        return;
      }

      // Bước 2: Nhập OTP -> xác thực OTP -> tạo tài khoản
      if (mode === "register" && registerStep === "otp") {
        await authService.verifyRegisterOtp({
          email,
          otp,
        });

        await authService.register({
          email,
          userName: name,
          password,
        });

        setErrors({});
        setSuccessMessage("Đăng ký thành công. Vui lòng đăng nhập.");
        setMode("login");
        setRegisterStep("form");
        setConfirmPassword("");
        setPassword("");
        setOtp("");
      }
    } catch (error: any) {
      const rawMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra trong quá trình xác thực.";

      // Chuẩn UX cho trường hợp đăng nhập sai thông tin.
      // Backend có thể trả message khác nhau, nên làm tolerant bằng cách match key.
      const normalized = String(rawMessage).toLowerCase();

      const isInvalidLogin =
        normalized.includes("invalid") ||
        normalized.includes("incorrect") ||
        normalized.includes("wrong") ||
        normalized.includes("unauthorized") ||
        normalized.includes("login");

      const message =
        mode === "login" && isInvalidLogin
          ? "Thông tin đăng nhập không đúng. Vui lòng nhập lại."
          : rawMessage;

      setErrors({ auth: message });
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };


  const switchMode = (next: Mode) => {
    setMode(next);
    setRegisterStep("form");
    setErrors({});
    setSuccessMessage(null);
    setConfirmPassword("");
    setOtp("");
    setShowPassword(false);
    setShowConfirmPassword(false);
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
            {mode === "login" ? "Log in to continue to TuneVault." : "Sign up to start listening."}
          </p>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "register" && registerStep === "form" && (
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

          {successMessage && (
            <div className="mb-4 rounded-md bg-green-500/10 border border-green-500/20 p-2.5 text-center text-xs font-semibold text-green-300">
              {successMessage}
            </div>
          )}

          {registerStep === "form" && (
            <>
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
                  onToggleVisibility={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />
              )}
            </>
          )}

          {mode === "register" && registerStep === "otp" && (
            <Field
              id="auth-otp"
              label="OTP"
              type="text"
              value={otp}
              onChange={(value) => setOtp(value.replace(/\D/g, ""))}
              error={errors.otp}
              placeholder="Enter OTP code"
            />
          )}

          {/* Nút bấm Submit kiểu Pill-shaped bo tròn màu xanh lá */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-full bg-green-500 py-3 text-sm font-bold text-black transition-all hover:bg-green-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log In"
                : registerStep === "form"
                  ? "Sign Up"
                  : "Verify OTP"}
          </button>
        </form>

        {/* Chuyển đổi luân phiên giữa Login và Register */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
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
        className={`w-full rounded-md border bg-zinc-800/60 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all ${error
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
          className={`w-full rounded-md border bg-zinc-800/60 px-3 py-2 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all ${error
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