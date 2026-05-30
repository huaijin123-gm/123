import { Sparkles } from "lucide-react";
import InlineEditable from "./InlineEditable";

function CustomModules({ editMode, modules, onUpdateModule }) {
  const visibleModules = modules.filter((module) => editMode || !module.hidden);

  if (!editMode && visibleModules.length === 0) {
    return null;
  }

  return (
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
            <Sparkles size={16} />
            自定义展厅
          </p>
          <h2 className="text-3xl font-semibold text-[#4a1f31] sm:text-4xl">
            你们想收藏什么，都可以放在这里
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {visibleModules.map((module) => (
            <article
              key={module.id}
              className={`rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_50px_rgba(206,80,128,0.12)] backdrop-blur ${
                editMode ? "editable-surface" : ""
              }`}
            >
              <h3 className="text-2xl font-semibold text-[#4a1f31]">
                <InlineEditable
                  editMode={editMode}
                  value={module.title}
                  onChange={(value) => onUpdateModule(module.id, "title", value)}
                  placeholder="模块标题"
                />
              </h3>

              <p className="mt-4 leading-8 text-[#744557]">
                <InlineEditable
                  as="textarea"
                  editMode={editMode}
                  value={module.content}
                  onChange={(value) => onUpdateModule(module.id, "content", value)}
                  placeholder="写下这个模块的内容"
                />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CustomModules;
