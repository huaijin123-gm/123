import { Plus, Sparkles, Trash2 } from "lucide-react";
import InlineEditable from "./InlineEditable";

function CustomModules({
  editMode,
  modules,
  onAddModule,
  onRemoveModule,
  onUpdateModule,
}) {
  const visibleModules = modules.filter((module) => editMode || !module.hidden);

  if (!editMode && visibleModules.length === 0) {
    return null;
  }

  return (
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
              <Sparkles size={16} />
              自定义展厅
            </p>
            <h2 className="text-3xl font-semibold text-[#4a1f31] sm:text-4xl">
              你们想收藏什么，都可以放在这里
            </h2>
          </div>
          {editMode && (
            <button
              type="button"
              onClick={onAddModule}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e94683] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
            >
              <Plus size={16} />
              添加模块
            </button>
          )}
        </div>

        {visibleModules.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#f4aac6] bg-white/70 p-8 text-center text-sm font-semibold text-[#9a3869]">
            还没有自定义模块。
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleModules.map((module) => (
              <article
                key={module.id}
                className={`rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_50px_rgba(206,80,128,0.12)] backdrop-blur ${
                  editMode ? "editable-surface" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-[#4a1f31]">
                    <InlineEditable
                      editMode={editMode}
                      value={module.title}
                      onChange={(value) =>
                        onUpdateModule(module.id, "title", value)
                      }
                      placeholder="模块标题"
                    />
                  </h3>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => onRemoveModule(module.id)}
                      aria-label="删除这个模块"
                      className="rounded-full bg-[#fff0f6] p-2 text-[#b13c5f] transition hover:bg-[#ffe1ed] active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="mt-4 leading-8 text-[#744557]">
                  <InlineEditable
                    as="textarea"
                    editMode={editMode}
                    value={module.content}
                    onChange={(value) =>
                      onUpdateModule(module.id, "content", value)
                    }
                    placeholder="写下这个模块的内容"
                  />
                </p>

                {editMode && (
                  <label className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#9a3869]">
                    <input
                      type="checkbox"
                      checked={module.hidden}
                      onChange={(event) =>
                        onUpdateModule(module.id, "hidden", event.target.checked)
                      }
                      className="h-4 w-4 accent-[#e94683]"
                    />
                    暂时隐藏这个模块
                  </label>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CustomModules;
