import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Send, X } from "lucide-react";

function MemoryDetail({
  detail,
  memory,
  onAddComment,
  onClose,
  onToggleReaction,
}) {
  const [comment, setComment] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartX = useRef(null);

  if (!memory) {
    return null;
  }

  const photos = memory.photos?.length ? memory.photos : [{ url: memory.image }];
  const currentPhoto = photos[Math.min(photoIndex, photos.length - 1)];

  async function submit(event) {
    event.preventDefault();
    await onAddComment(memory.id, comment);
    setComment("");
  }

  function showPrevious() {
    setPhotoIndex((value) => Math.max(0, value - 1));
  }

  function showNext() {
    setPhotoIndex((value) => Math.min(photos.length - 1, value + 1));
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) {
      return;
    }

    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 44) {
      if (delta > 0) {
        showPrevious();
      } else {
        showNext();
      }
    }
    touchStartX.current = null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#3f2633]/42 p-3 backdrop-blur-sm sm:p-5">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[30px] bg-[#fff9fc] shadow-[0_28px_90px_rgba(63,38,51,0.32)]">
        <header className="flex items-center justify-between gap-3 border-b border-[#ffd8e8] p-4 sm:p-5">
          <div>
            <p className="text-sm font-semibold text-[#d7427c]">{memory.date}</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#4a1f31]">
              {memory.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭详情"
            className="rounded-full bg-white p-2 text-[#9a3869] shadow-sm transition active:scale-95"
          >
            <X size={20} />
          </button>
        </header>

        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className="relative bg-[#ffe6f0] p-3"
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentPhoto.url}
              alt=""
              loading="eager"
              className="max-h-[72vh] w-full rounded-[22px] object-contain"
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  disabled={photoIndex === 0}
                  aria-label="上一张照片"
                  className="absolute left-5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/82 text-[#9a3869] shadow-lg backdrop-blur transition enabled:active:scale-95 disabled:opacity-35"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  disabled={photoIndex === photos.length - 1}
                  aria-label="下一张照片"
                  className="absolute right-5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/82 text-[#9a3869] shadow-lg backdrop-blur transition enabled:active:scale-95 disabled:opacity-35"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, index) => (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => setPhotoIndex(index)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                      index === photoIndex ? "border-[#e94683]" : "border-white"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5">
            <p className="leading-8 text-[#744557]">{memory.message}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {detail?.reactionCounts?.map((reaction) => (
                <button
                  key={reaction.emoji}
                  type="button"
                  onClick={() => onToggleReaction(memory.id, reaction.emoji)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                    reaction.reacted
                      ? "bg-[#e94683] text-white"
                      : "bg-[#fff0f6] text-[#9a3869]"
                  }`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
                <MessageCircle size={16} />
                留言
              </p>

              <div className="max-h-52 space-y-3 overflow-y-auto pr-1">
                {detail?.comments?.length ? (
                  detail.comments.map((item) => (
                    <p
                      key={item.id}
                      className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-[#744557] shadow-sm"
                    >
                      {item.content}
                    </p>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-[#f4aac6] bg-white/70 px-4 py-4 text-sm font-semibold text-[#9a3869]">
                    这里还没有留言，要不要写下第一句？
                  </p>
                )}
              </div>

              <form onSubmit={submit} className="mt-4 flex gap-2">
                <input
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="追加一句留言"
                  className="min-w-0 flex-1 rounded-full border border-[#ffd8e8] bg-white px-4 py-3 text-base text-[#4a1f31] outline-none focus:border-[#e94683]"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e94683] text-white transition active:scale-95"
                  aria-label="发送留言"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MemoryDetail;
