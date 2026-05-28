import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Layers,
  ListPlus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { clearMuseumContent } from "../utils/storage";
import { resizeImage } from "../utils/image";

const emptyMemory = {
  id: "",
  date: "",
  title: "",
  type: "日常",
  image: "/placeholders/memory-1.svg",
  achievement: "",
  message: "",
};

const emptyLetter = {
  id: "",
  date: "",
  title: "",
  content: "",
};

const sectionLabels = [
  ["timeline", "回忆时间轴"],
  ["achievements", "成就墙"],
  ["letters", "未来信箱"],
  ["customModules", "自定义展厅"],
  ["confession", "结尾告白"],
];

function MuseumEditor({
  defaultContent,
  editMode,
  museumContent,
  saveStatus,
  onAddModule,
  onChange,
  onExport,
  onImport,
  onMoveLetter,
  onMoveMemory,
  onMoveModule,
  onToggleEditMode,
  onToggleSection,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("memories");
  const [panelHint, setPanelHint] = useState("");

  function updateContent(nextContent) {
    onChange(nextContent);
    setPanelHint("已自动保存到这台设备");
    window.setTimeout(() => setPanelHint(""), 1600);
  }

  function updateMemory(memoryId, field, value) {
    updateContent({
      ...museumContent,
      memories: museumContent.memories.map((memory) =>
        memory.id === memoryId ? { ...memory, [field]: value } : memory,
      ),
    });
  }

  function addMemory() {
    const id = `memory-${Date.now()}`;
    updateContent({
      ...museumContent,
      memories: [
        ...museumContent.memories,
        {
          ...emptyMemory,
          id,
          date: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
          title: "新的回忆",
          achievement: "新的小成就",
          message: "在这里写下你想收藏的话。",
        },
      ],
    });
  }

  function removeMemory(memoryId) {
    updateContent({
      ...museumContent,
      memories: museumContent.memories.filter((memory) => memory.id !== memoryId),
    });
  }

  async function uploadMemoryImage(memoryId, file) {
    if (!file) {
      return;
    }

    const image = await resizeImage(file);
    updateMemory(memoryId, "image", image);
  }

  function updateLetter(letterId, field, value) {
    updateContent({
      ...museumContent,
      futureLetters: museumContent.futureLetters.map((letter) =>
        letter.id === letterId ? { ...letter, [field]: value } : letter,
      ),
    });
  }

  function addLetter() {
    updateContent({
      ...museumContent,
      futureLetters: [
        ...museumContent.futureLetters,
        {
          ...emptyLetter,
          id: `letter-${Date.now()}`,
          date: "写给未来",
          title: "一封新的信",
          content: "在这里写下想寄给未来的话。",
        },
      ],
    });
  }

  function removeLetter(letterId) {
    updateContent({
      ...museumContent,
      futureLetters: museumContent.futureLetters.filter(
        (letter) => letter.id !== letterId,
      ),
    });
  }

  function updateModule(moduleId, field, value) {
    updateContent({
      ...museumContent,
      customModules: museumContent.customModules.map((module) =>
        module.id === moduleId ? { ...module, [field]: value } : module,
      ),
    });
  }

  function removeModule(moduleId) {
    updateContent({
      ...museumContent,
      customModules: museumContent.customModules.filter(
        (module) => module.id !== moduleId,
      ),
    });
  }

  function updateAchievements(value) {
    updateContent({
      ...museumContent,
      achievements: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  function resetAll() {
    clearMuseumContent();
    onChange(defaultContent);
    setPanelHint("已恢复默认内容");
  }

  async function importFile(file) {
    try {
      await onImport(file);
      setPanelHint("已导入");
    } catch {
      setPanelHint("导入失败，请选择正确的数据文件");
    }
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        {saveStatus && (
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#9a3869] shadow-[0_12px_30px_rgba(63,38,51,0.16)] backdrop-blur">
            {saveStatus}
          </span>
        )}
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-[0_18px_45px_rgba(63,38,51,0.28)] transition hover:-translate-y-0.5 active:scale-95 ${
            editMode ? "bg-[#e94683] text-white" : "bg-white text-[#9a3869]"
          }`}
        >
          <Pencil size={17} />
          {editMode ? "完成直接编辑" : "直接编辑"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#3f2633] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(63,38,51,0.28)] transition hover:-translate-y-0.5 active:scale-95"
        >
          <Layers size={17} />
          管理内容
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#3f2633]/35 p-3 backdrop-blur-sm sm:p-5">
          <section className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-[#fff9fc] shadow-[0_28px_90px_rgba(63,38,51,0.28)]">
            <header className="flex items-start justify-between gap-4 border-b border-[#ffd8e8] p-4 sm:p-6">
              <div>
                <p className="text-sm font-semibold text-[#d7427c]">
                  内容、模块和数据
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#4a1f31]">
                  管理我们的时间博物馆
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="关闭管理面板"
                className="rounded-full bg-white p-2 text-[#9a3869] shadow-sm transition hover:bg-[#ffeaf3] active:scale-95"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex gap-2 overflow-x-auto border-b border-[#ffd8e8] px-4 py-3 sm:px-6">
              <TabButton
                active={activeTab === "memories"}
                onClick={() => setActiveTab("memories")}
              >
                回忆
              </TabButton>
              <TabButton
                active={activeTab === "letters"}
                onClick={() => setActiveTab("letters")}
              >
                信箱
              </TabButton>
              <TabButton
                active={activeTab === "achievements"}
                onClick={() => setActiveTab("achievements")}
              >
                成就
              </TabButton>
              <TabButton
                active={activeTab === "modules"}
                onClick={() => setActiveTab("modules")}
              >
                模块
              </TabButton>
              <TabButton
                active={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
              >
                设置
              </TabButton>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === "memories" && (
                <div className="space-y-5">
                  <PanelIntro
                    action={addMemory}
                    actionText="添加回忆"
                    icon={<Plus size={16} />}
                  />

                  {museumContent.memories.length === 0 && (
                    <EmptyState text="还没有回忆卡片。" />
                  )}

                  {museumContent.memories.map((memory, index) => (
                    <div
                      key={memory.id}
                      className="rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_14px_38px_rgba(206,80,128,0.1)]"
                    >
                      <ItemToolbar
                        canMoveUp={index > 0}
                        canMoveDown={index < museumContent.memories.length - 1}
                        onMoveUp={() => onMoveMemory(memory.id, "up")}
                        onMoveDown={() => onMoveMemory(memory.id, "down")}
                        onDelete={() => removeMemory(memory.id)}
                        deleteText="删除"
                      />

                      <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                        <div>
                          <img
                            src={memory.image}
                            alt=""
                            className="aspect-[4/3] w-full rounded-2xl object-cover"
                          />
                          <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fff0f6] px-4 py-2.5 text-sm font-semibold text-[#bd3d6c] transition hover:bg-[#ffe1ed] active:scale-95">
                            <ImagePlus size={16} />
                            上传照片
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) =>
                                uploadMemoryImage(memory.id, event.target.files?.[0])
                              }
                            />
                          </label>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <TextField
                            label="日期"
                            value={memory.date}
                            onChange={(value) =>
                              updateMemory(memory.id, "date", value)
                            }
                          />
                          <TextField
                            label="类型"
                            value={memory.type}
                            onChange={(value) =>
                              updateMemory(memory.id, "type", value)
                            }
                          />
                          <TextField
                            label="标题"
                            value={memory.title}
                            onChange={(value) =>
                              updateMemory(memory.id, "title", value)
                            }
                          />
                          <TextField
                            label="成就"
                            value={memory.achievement}
                            onChange={(value) =>
                              updateMemory(memory.id, "achievement", value)
                            }
                          />
                          <TextArea
                            label="想说的话"
                            value={memory.message}
                            onChange={(value) =>
                              updateMemory(memory.id, "message", value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "letters" && (
                <div className="space-y-5">
                  <PanelIntro
                    action={addLetter}
                    actionText="添加一封信"
                    icon={<ListPlus size={16} />}
                  />

                  {museumContent.futureLetters.length === 0 && (
                    <EmptyState text="还没有未来信。" />
                  )}

                  {museumContent.futureLetters.map((letter, index) => (
                    <div
                      key={letter.id}
                      className="rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_14px_38px_rgba(206,80,128,0.1)]"
                    >
                      <ItemToolbar
                        canMoveUp={index > 0}
                        canMoveDown={
                          index < museumContent.futureLetters.length - 1
                        }
                        onMoveUp={() => onMoveLetter(letter.id, "up")}
                        onMoveDown={() => onMoveLetter(letter.id, "down")}
                        onDelete={() => removeLetter(letter.id)}
                        deleteText="删除"
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <TextField
                          label="时间标签"
                          value={letter.date}
                          onChange={(value) =>
                            updateLetter(letter.id, "date", value)
                          }
                        />
                        <TextField
                          label="信件标题"
                          value={letter.title}
                          onChange={(value) =>
                            updateLetter(letter.id, "title", value)
                          }
                        />
                        <TextArea
                          label="信件内容"
                          value={letter.content}
                          onChange={(value) =>
                            updateLetter(letter.id, "content", value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "achievements" && (
                <div className="rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_14px_38px_rgba(206,80,128,0.1)]">
                  <TextArea
                    label="成就墙内容，一行一个"
                    value={museumContent.achievements.join("\n")}
                    onChange={updateAchievements}
                  />
                </div>
              )}

              {activeTab === "modules" && (
                <div className="space-y-5">
                  <PanelIntro
                    action={onAddModule}
                    actionText="添加模块"
                    icon={<Plus size={16} />}
                  />

                  {museumContent.customModules.length === 0 && (
                    <EmptyState text="还没有自定义模块。" />
                  )}

                  {museumContent.customModules.map((module, index) => (
                    <div
                      key={module.id}
                      className="rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_14px_38px_rgba(206,80,128,0.1)]"
                    >
                      <ItemToolbar
                        canMoveUp={index > 0}
                        canMoveDown={
                          index < museumContent.customModules.length - 1
                        }
                        onMoveUp={() => onMoveModule(module.id, "up")}
                        onMoveDown={() => onMoveModule(module.id, "down")}
                        onDelete={() => removeModule(module.id)}
                        deleteText="删除"
                      />

                      <div className="grid gap-3">
                        <TextField
                          label="模块标题"
                          value={module.title}
                          onChange={(value) =>
                            updateModule(module.id, "title", value)
                          }
                        />
                        <TextArea
                          label="模块内容"
                          value={module.content}
                          onChange={(value) =>
                            updateModule(module.id, "content", value)
                          }
                        />
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#9a3869]">
                          <input
                            type="checkbox"
                            checked={module.hidden}
                            onChange={(event) =>
                              updateModule(module.id, "hidden", event.target.checked)
                            }
                            className="h-4 w-4 accent-[#e94683]"
                          />
                          暂时隐藏这个模块
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-5">
                  <div className="rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_14px_38px_rgba(206,80,128,0.1)]">
                    <h3 className="text-lg font-semibold text-[#4a1f31]">
                      页面模块
                    </h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {sectionLabels.map(([sectionKey, label]) => {
                        const isVisible =
                          museumContent.sectionSettings[sectionKey];

                        return (
                          <button
                            key={sectionKey}
                            type="button"
                            onClick={() => onToggleSection(sectionKey)}
                            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.99] ${
                              isVisible
                                ? "bg-[#fff0f6] text-[#9a3869]"
                                : "bg-[#f3edf1] text-[#8a7780]"
                            }`}
                          >
                            {label}
                            {isVisible ? <Eye size={17} /> : <EyeOff size={17} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#ffd8e8] bg-white p-4 shadow-[0_14px_38px_rgba(206,80,128,0.1)]">
                    <h3 className="text-lg font-semibold text-[#4a1f31]">
                      数据备份
                    </h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={onExport}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3f2633] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
                      >
                        <Download size={16} />
                        导出数据
                      </button>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#fff0f6] px-4 py-2.5 text-sm font-semibold text-[#bd3d6c] transition hover:bg-[#ffe1ed] active:scale-95">
                        <Upload size={16} />
                        导入数据
                        <input
                          type="file"
                          accept="application/json,.json"
                          className="hidden"
                          onChange={(event) => importFile(event.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-[#ffd8e8] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="min-h-5 text-sm font-semibold text-[#d7427c]">
                {panelHint}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#9a3869] shadow-sm transition hover:bg-[#ffeaf3] active:scale-95"
                >
                  <RotateCcw size={16} />
                  恢复默认
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3f2633] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
                >
                  <Save size={16} />
                  完成
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

function PanelIntro({ action, actionText, icon }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={action}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e94683] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
      >
        {icon}
        {actionText}
      </button>
    </div>
  );
}

function ItemToolbar({
  canMoveUp,
  canMoveDown,
  deleteText,
  onDelete,
  onMoveDown,
  onMoveUp,
}) {
  return (
    <div className="mb-4 flex flex-wrap justify-end gap-2">
      <SmallAction disabled={!canMoveUp} onClick={onMoveUp}>
        <ArrowUp size={15} />
        上移
      </SmallAction>
      <SmallAction disabled={!canMoveDown} onClick={onMoveDown}>
        <ArrowDown size={15} />
        下移
      </SmallAction>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[#b13c5f] transition hover:bg-[#fff0f6] active:scale-95"
      >
        <Trash2 size={15} />
        {deleteText}
      </button>
    </div>
  );
}

function SmallAction({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f6] px-3 py-2 text-sm font-semibold text-[#9a3869] transition enabled:hover:bg-[#ffe1ed] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
        active ? "bg-[#e94683] text-white" : "bg-white text-[#9a3869]"
      }`}
    >
      {children}
    </button>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#9a3869]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[#ffd8e8] bg-[#fff9fc] px-4 py-3 text-base text-[#4a1f31] outline-none transition focus:border-[#e94683] focus:bg-white"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block sm:col-span-2">
      <span className="mb-1.5 block text-sm font-semibold text-[#9a3869]">
        {label}
      </span>
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-2xl border border-[#ffd8e8] bg-[#fff9fc] px-4 py-3 text-base leading-7 text-[#4a1f31] outline-none transition focus:border-[#e94683] focus:bg-white"
      />
    </label>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#f4aac6] bg-white/70 p-8 text-center text-sm font-semibold text-[#9a3869]">
      {text}
    </div>
  );
}

export default MuseumEditor;
