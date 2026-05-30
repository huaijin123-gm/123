import { useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import MemoryCard from "./MemoryCard";

function MemoryTimeline({
  detailByMemoryId = {},
  editMode,
  memories,
  onAddMemory,
  onOpenMemory,
  onUpdateMemory,
  onUploadMemoryImage,
  uploadState,
}) {
  const [activeType, setActiveType] = useState("全部");

  const memoryTypes = useMemo(() => {
    const types = memories.map((memory) => memory.type).filter(Boolean);
    return ["全部", ...Array.from(new Set(types))];
  }, [memories]);

  const filteredMemories = useMemo(() => {
    if (activeType === "全部") {
      return memories;
    }

    return memories.filter((memory) => memory.type === activeType);
  }, [activeType, memories]);

  return (
    <section id="timeline" className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
              <Heart size={16} fill="currentColor" />
              回忆时间轴
            </p>
            <h2 className="text-3xl font-semibold text-[#4a1f31] sm:text-4xl">
              每一天都值得被珍藏
            </h2>
          </div>

          {memoryTypes.length > 1 && (
            <div className="flex flex-wrap gap-2 rounded-[28px] bg-white/65 p-2 shadow-[0_18px_50px_rgba(204,84,128,0.12)] backdrop-blur">
              {memoryTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95 ${
                    activeType === type
                      ? "bg-[#e94683] text-white shadow-[0_10px_22px_rgba(233,70,131,0.28)]"
                      : "text-[#8d4b67] hover:bg-white"
                  }`}
                >
                  {type === "全部" && <Search size={15} />}
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-[#f4aac6] via-[#e94683] to-[#ffd6e8] md:block" />
          <div className="grid gap-6">
            {filteredMemories.map((memory, index) => (
              <MemoryCard
                key={memory.id}
                detail={detailByMemoryId[memory.id]}
                editMode={editMode}
                memory={memory}
                index={index}
                onOpenMemory={onOpenMemory}
                onUpdateMemory={onUpdateMemory}
                onUploadMemoryImage={onUploadMemoryImage}
                uploadState={uploadState}
              />
            ))}
          </div>

          {filteredMemories.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#f4aac6] bg-white/70 p-8 text-center text-sm font-semibold text-[#9a3869] shadow-[0_18px_50px_rgba(204,84,128,0.1)]">
              这里还没有回忆，要不要一起写下第一条？
            </div>
          )}
        </div>

        {editMode && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onAddMemory}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#e94683] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(233,70,131,0.28)] transition active:scale-95"
            >
              添加一张回忆卡片
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default MemoryTimeline;
