import { useMemo, useState } from "react";
import { DoorOpen, Loader2, Ticket } from "lucide-react";

function MuseumWelcome({ loading, onCreateMuseum, onJoinMuseum, syncStatus }) {
  const [busy, setBusy] = useState(false);
  const inviteToken = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("invite") || "";
  }, []);

  async function create() {
    setBusy(true);
    try {
      await onCreateMuseum();
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    if (!inviteToken) {
      return;
    }

    setBusy(true);
    try {
      await onJoinMuseum(inviteToken);
      window.history.replaceState({}, "", window.location.pathname);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7fb] text-[#3f2633]">
      <section className="relative flex min-h-screen items-center justify-center px-5 py-12 text-center">
        <div className="absolute inset-0 hero-scene" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-lg rounded-[30px] border border-white/70 bg-white/74 p-6 shadow-[0_28px_80px_rgba(206,80,128,0.22)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold text-[#d7427c]">{syncStatus}</p>
          <h1 className="mt-3 text-4xl font-semibold text-[#4a1f31]">
            开始布置我们的博物馆
          </h1>
          <p className="mt-4 leading-7 text-[#71364f]">
            第一个进入的人会成为馆长，然后把邀请链接发给另一个人。
          </p>

          <div className="mt-8 grid gap-3">
            {inviteToken ? (
              <button
                type="button"
                disabled={busy || loading}
                onClick={join}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e94683] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_34px_rgba(233,70,131,0.32)] transition enabled:active:scale-95 disabled:opacity-70"
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Ticket size={18} />}
                接受邀请，进入博物馆
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || loading}
                onClick={create}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e94683] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_34px_rgba(233,70,131,0.32)] transition enabled:active:scale-95 disabled:opacity-70"
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : <DoorOpen size={18} />}
                创建我们的双人空间
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default MuseumWelcome;
