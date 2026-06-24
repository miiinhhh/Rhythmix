import { useNavigate } from "react-router-dom";
import { Music2 } from "lucide-react";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-6 text-white">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute left-10 top-10 h-72 w-24 rotate-45 bg-zinc-700" />
                <div className="absolute right-32 top-0 h-96 w-36 rotate-45 bg-zinc-700" />
                <div className="absolute bottom-10 left-1/2 h-80 w-28 rotate-45 bg-zinc-800" />
            </div>

            <div className="relative z-10 grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[420px_1fr]">
                {/* Ảnh bên trái */}
                <div className="hidden justify-center lg:flex">
                    <div className="relative h-[560px] w-[360px] overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl">
                        <img
                            src="/landing-cover.png"
                            alt="Music cover"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
                {/* Nội dung bên phải */}
                <div className="flex max-w-3xl flex-col items-center text-center lg:justify-self-center">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-green-500 text-black">
                            <Music2 size={26} />
                        </div>
                        <h1 className="text-3xl font-bold">Rhythmix</h1>
                    </div>

                    <h2 className="mb-6 text-4xl font-black leading-tight md:text-6xl">
                        Play any song, anytime, free.
                    </h2>

                    <p className="mb-10 max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
                        Nghe nhạc, tạo playlist, lưu bài hát yêu thích và chia sẻ âm nhạc với
                        bạn bè ngay trong Rhythmix.
                    </p>

                    <div className="mb-8 flex w-72 items-center gap-4 text-xs uppercase tracking-[0.25em] text-zinc-500">
                        <div className="h-px flex-1 bg-zinc-700" />
                        <span>Already have an account?</span>
                        <div className="h-px flex-1 bg-zinc-700" />
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mb-8 w-72 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:scale-105 hover:bg-zinc-200"
                    >
                        Log in
                    </button>

                    <p className="mb-8 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                        New to Rhythmix?
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="w-72 rounded-full bg-green-500 px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:scale-105 hover:bg-green-400"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;