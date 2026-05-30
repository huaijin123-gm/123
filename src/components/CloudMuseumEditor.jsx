import {
  Copy,
  Home,
  LogOut,
  MailPlus,
  Pencil,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";

function CloudMuseumEditor({
  editMode,
  inviteLink,
  members,
  notice,
  role,
  syncStatus,
  uploadState,
  onAddLetter,
  onAddMemory,
  onCreateInvite,
  onReload,
  onSignOut,
  onToggleEditMode,
}) {
  const canInvite = role === "owner" && members.length < 2;

  async function copyInvite() {
    if (inviteLink) {
      await navigator.clipboard?.writeText(inviteLink);
    }
  }

  const statusText = uploadState
    ? `照片上传 ${uploadState.current}/${uploadState.total}${
        uploadState.failed ? `，失败 ${uploadState.failed}` : ""
      }`
    : notice || syncStatus;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/80 bg-white/88 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-16px_40px_rgba(63,38,51,0.14)] backdrop-blur-xl sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-[24px] sm:border sm:px-2 sm:pb-2">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 sm:flex sm:items-center">
          <NavLink href="#home" icon={<Home size={18} />} label="首页" />
          <NavLink href="#timeline" icon={<RefreshCw size={18} />} label="时间轴" />
          <button
            type="button"
            onClick={onAddMemory}
            className="inline-flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl bg-[#3f2633] px-3 text-xs font-semibold text-white transition active:scale-95 sm:min-w-20"
          >
            <Plus size={19} />
            添加
          </button>
          <NavLink href="#letters" icon={<Send size={18} />} label="信箱" />
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`inline-flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-3 text-xs font-semibold transition active:scale-95 sm:min-w-20 ${
              editMode ? "bg-[#e94683] text-white" : "bg-[#fff0f6] text-[#9a3869]"
            }`}
          >
            <Pencil size={18} />
            {editMode ? "完成" : "编辑"}
          </button>
        </div>
      </nav>

      <div className="fixed right-4 top-4 z-40 max-w-[calc(100vw-2rem)] rounded-full bg-white/88 px-4 py-2 text-sm font-semibold text-[#9a3869] shadow-[0_14px_32px_rgba(63,38,51,0.15)] backdrop-blur">
        {statusText}
      </div>

      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 z-40 flex flex-col gap-2">
        <SmallButton onClick={onAddLetter} label="写信" icon={<Send size={16} />} />
        {canInvite && (
          <SmallButton
            onClick={onCreateInvite}
            label="邀请"
            icon={<MailPlus size={16} />}
          />
        )}
        <SmallButton
          onClick={onReload}
          label="同步"
          icon={<RefreshCw size={16} />}
        />
        <SmallButton onClick={onSignOut} label="退出" icon={<LogOut size={16} />} />
      </div>

      {inviteLink && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-xl rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_18px_60px_rgba(63,38,51,0.2)] sm:bottom-28">
          <p className="text-sm font-semibold text-[#4a1f31]">
            邀请链接已复制，发给对方即可加入。
          </p>
          <button
            type="button"
            onClick={copyInvite}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fff0f6] px-4 py-2.5 text-sm font-semibold text-[#9a3869] transition active:scale-95"
          >
            <Copy size={16} />
            再复制一次
          </button>
        </div>
      )}
    </>
  );
}

function NavLink({ href, icon, label }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-3 text-xs font-semibold text-[#9a3869] transition active:scale-95 sm:min-w-20"
    >
      {icon}
      {label}
    </a>
  );
}

function SmallButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-white/88 px-4 py-2.5 text-sm font-semibold text-[#9a3869] shadow-[0_12px_30px_rgba(63,38,51,0.13)] backdrop-blur transition active:scale-95"
    >
      {icon}
      {label}
    </button>
  );
}

export default CloudMuseumEditor;
