import { useMemo, useState } from "react";
import { KeyRound, Loader2, Mail, Sparkles } from "lucide-react";

function AuthEntrance({ onSignIn, syncStatus }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSignIn(email);
      setSent(true);
    } catch {
      setError("钥匙没有发出去，请检查邮箱后再试一次。");
    } finally {
      setLoading(false);
    }
  }

  const statusText = useMemo(() => {
    if (sent) {
      return "已经发送，请去邮箱点开那封信。";
    }
    return syncStatus || "等待进入";
  }, [sent, syncStatus]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7fb] text-[#3f2633]">
      <section className="relative flex min-h-screen items-center justify-center px-5 py-12 text-center">
        <div className="absolute inset-0 hero-scene" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-md rounded-[30px] border border-white/70 bg-white/72 p-6 shadow-[0_28px_80px_rgba(206,80,128,0.22)] backdrop-blur-xl sm:p-8">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#9a3869]">
            <Sparkles size={16} />
            只属于两个人的入口
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-[#4a1f31]">
            我们的时间博物馆
          </h1>
          <p className="mt-4 leading-7 text-[#71364f]">
            输入邮箱，领取进入我们博物馆的钥匙。
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4 text-left">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#9a3869]">
                邮箱
              </span>
              <span className="flex items-center gap-3 rounded-2xl border border-[#ffd8e8] bg-white/78 px-4 py-3">
                <Mail size={18} className="text-[#d7427c]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  className="min-w-0 flex-1 bg-transparent text-base text-[#4a1f31] outline-none"
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e94683] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_34px_rgba(233,70,131,0.32)] transition enabled:active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              {loading ? "正在发送" : "领取钥匙"}
            </button>
          </form>

          <p className="mt-5 min-h-6 text-sm font-semibold text-[#bd4a73]">
            {error || statusText}
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthEntrance;
