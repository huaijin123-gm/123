import { useEffect, useState } from "react";
import { Heart, ImagePlus, Sparkle } from "lucide-react";
import InlineEditable from "./InlineEditable";
import { readFavorites, saveFavorites } from "../utils/storage";

function MemoryCard({
  editMode,
  memory,
  index,
  onUpdateMemory,
  onUploadMemoryImage,
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(readFavorites().includes(memory.id));
  }, [memory.id]);

  function toggleFavorite() {
    const favorites = readFavorites();
    const nextFavorites = favorites.includes(memory.id)
      ? favorites.filter((id) => id !== memory.id)
      : [...favorites, memory.id];

    saveFavorites(nextFavorites);
    setIsFavorite(nextFavorites.includes(memory.id));
  }

  return (
    <article
      className={`reveal-card group relative rounded-[28px] border border-white/80 bg-white/78 p-4 shadow-[0_20px_60px_rgba(206,80,128,0.13)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(206,80,128,0.18)] md:ml-14 md:grid md:grid-cols-[240px_1fr] md:gap-6 md:p-5 ${
        editMode ? "editable-surface" : ""
      }`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="absolute -left-[45px] top-8 hidden h-7 w-7 rounded-full border-4 border-[#fff7fb] bg-[#e94683] shadow-[0_0_0_6px_rgba(233,70,131,0.13)] md:block" />

      {editMode ? (
        <label className="relative block cursor-pointer overflow-hidden rounded-3xl bg-[#ffe6f0]">
          <img
            src={memory.image}
            alt=""
            className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-x-4 bottom-4 inline-flex items-center justify-center gap-2 rounded-full bg-white/82 px-4 py-2 text-sm font-semibold text-[#bd3d6c] shadow-lg backdrop-blur">
            <ImagePlus size={16} />
            点照片上传
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) =>
              onUploadMemoryImage(memory.id, event.target.files?.[0])
            }
          />
        </label>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-[#ffe6f0]">
          <img
            src={memory.image}
            alt=""
            className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="mt-5 flex flex-col justify-between md:mt-0">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#ffe1ed] px-3 py-1 text-sm font-semibold text-[#be3f6d]">
              <InlineEditable
                editMode={editMode}
                value={memory.date}
                onChange={(value) => onUpdateMemory(memory.id, "date", value)}
                placeholder="日期"
              />
            </span>
            <span className="rounded-full bg-[#f4edff] px-3 py-1 text-sm font-semibold text-[#8a55a8]">
              <InlineEditable
                editMode={editMode}
                value={memory.type}
                onChange={(value) => onUpdateMemory(memory.id, "type", value)}
                placeholder="类型"
              />
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold text-[#4a1f31]">
            <InlineEditable
              editMode={editMode}
              value={memory.title}
              onChange={(value) => onUpdateMemory(memory.id, "title", value)}
              placeholder="标题"
            />
          </h3>
          <p className="mt-3 leading-8 text-[#744557]">
            <InlineEditable
              as="textarea"
              editMode={editMode}
              value={memory.message}
              onChange={(value) => onUpdateMemory(memory.id, "message", value)}
              placeholder="写下想说的话"
            />
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#b64570]">
            <Sparkle size={16} />
            <InlineEditable
              editMode={editMode}
              value={memory.achievement}
              onChange={(value) =>
                onUpdateMemory(memory.id, "achievement", value)
              }
              placeholder="成就"
            />
          </p>
          <button
            type="button"
            onClick={toggleFavorite}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 ${
              isFavorite
                ? "bg-[#e94683] text-white shadow-[0_14px_28px_rgba(233,70,131,0.28)]"
                : "bg-[#fff0f6] text-[#bd3d6c] hover:bg-[#ffe2ef]"
            }`}
          >
            <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "已收藏" : "收藏这一刻"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MemoryCard;
