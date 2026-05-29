import { Copy, LogOut, MailPlus, Pencil, Plus, RefreshCw, Send } from "lucide-react";

function CloudMuseumEditor({
  editMode,
  inviteLink,
  members,
  notice,
  role,
  syncStatus,
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

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-2 rounded-[24px] border border-white/75 bg-white/84 p-2 shadow-[0_18px_45px_rgba(63,38,51,0.22)] backdrop-blur-xl sm:left-auto sm:right-5 sm:w-auto sm:max-w-none">
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-semibold transition active:scale-95 sm:flex-none ${
            editMode ? "bg-[#e94683] text-white" : "bg-[#fff0f6] text-[#9a3869]"
          }`}
        >
          <Pencil size={17} />
          {editMode ? "完成" : "编辑"}
        </button>

        <button
          type="button"
          onClick={onAddMemory}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3f2633] px-3 text-sm font-semibold text-white transition active:scale-95 sm:flex-none"
        >
          <Plus size={17} />
          回忆
        </button>

        <button
          type="button"
          onClick={onAddLetter}
          className="hidden min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#fff0f6] px-3 text-sm font-semibold text-[#9a3869] transition active:scale-95 sm:inline-flex"
        >
          <Send size={16} />
          写信
        </button>

        {canInvite && (
          <button
            type="button"
            onClick={onCreateInvite}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#fff0f6] px-3 text-sm font-semibold text-[#9a3869] transition active:scale-95 sm:flex-none"
          >
            <MailPlus size={17} />
            邀请
          </button>
        )}

        <button
          type="button"
          onClick={onReload}
          aria-label="重新同步"
          className="hidden min-h-11 items-center justify-center rounded-2xl bg-[#fff0f6] px-3 text-[#9a3869] transition active:scale-95 sm:inline-flex"
        >
          <RefreshCw size={17} />
        </button>

        <button
          type="button"
          onClick={onSignOut}
          aria-label="退出"
          className="hidden min-h-11 items-center justify-center rounded-2xl bg-[#fff0f6] px-3 text-[#9a3869] transition active:scale-95 sm:inline-flex"
        >
          <LogOut size={17} />
        </button>
      </div>

      <div className="fixed right-4 top-4 z-40 max-w-[calc(100vw-2rem)] rounded-full bg-white/88 px-4 py-2 text-sm font-semibold text-[#9a3869] shadow-[0_14px_32px_rgba(63,38,51,0.15)] backdrop-blur">
        {notice || syncStatus}
      </div>

      {inviteLink && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-xl rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_18px_60px_rgba(63,38,51,0.2)]">
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

export default CloudMuseumEditor;
