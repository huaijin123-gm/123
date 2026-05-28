import { useEffect, useMemo, useRef, useState } from "react";
import { achievements, futureLetters, memories } from "./data/memories";
import AchievementWall from "./components/AchievementWall";
import Confession from "./components/Confession";
import CustomModules from "./components/CustomModules";
import FutureMailbox from "./components/FutureMailbox";
import Hero from "./components/Hero";
import MuseumEditor from "./components/MuseumEditor";
import MemoryTimeline from "./components/MemoryTimeline";
import { fetchSharedMuseum, saveSharedMuseum } from "./utils/api";
import { readMuseumContent, saveMuseumContent } from "./utils/storage";
import { resizeImage } from "./utils/image";

const syncText = {
  loading: "正在连接共享数据",
  saving: "正在同步",
  synced: "已同步",
  offline: "已保存到此设备",
};

function App() {
  const defaultContent = useMemo(
    () => ({
      memories,
      achievements,
      futureLetters,
      customModules: [
        {
          id: "wish-list",
          title: "我们的愿望清单",
          content:
            "想一起看海、一起拍很多照片、一起去喜欢的城市，也一起过很多普通但幸福的日子。",
          hidden: false,
        },
      ],
      sectionSettings: {
        timeline: true,
        achievements: true,
        letters: true,
        customModules: true,
        confession: true,
      },
      siteText: {
        heroBadge: "只属于我们的收藏展",
        heroTitle: "我们的时间博物馆",
        heroSubtitle: "把我们走过的时间，好好收藏起来",
        confessionTitle:
          "这座博物馆最珍贵的藏品，是我们还会一起走向明天。",
        confessionHidden:
          "我喜欢你的每一个今天，也想认真参与你的每一个明天。你不用变成任何样子，在我这里，你一直都是最特别、最值得被偏爱的那个人。",
      },
    }),
    [],
  );

  const [museumContent, setMuseumContent] = useState(() =>
    normalizeContent(readMuseumContent(defaultContent), defaultContent),
  );
  const [editMode, setEditMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState("loading");
  const didLoad = useRef(false);
  const skipNextSharedSave = useRef(false);
  const latestSharedUpdate = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function connectSharedData() {
      try {
        const shared = await fetchSharedMuseum();

        if (cancelled) {
          return;
        }

        if (shared.content) {
          latestSharedUpdate.current = shared.updatedAt;
          skipNextSharedSave.current = true;
          setMuseumContent(normalizeContent(shared.content, defaultContent));
          setSyncStatus("synced");
          return;
        }

        const seeded = await saveSharedMuseum(museumContent);
        latestSharedUpdate.current = seeded.updatedAt;
        setSyncStatus("synced");
      } catch {
        setSyncStatus("offline");
      }
    }

    connectSharedData();

    return () => {
      cancelled = true;
    };
  }, [defaultContent]);

  useEffect(() => {
    saveMuseumContent(museumContent);

    if (!didLoad.current) {
      didLoad.current = true;
      return undefined;
    }

    if (skipNextSharedSave.current) {
      skipNextSharedSave.current = false;
      return undefined;
    }

    setSyncStatus("saving");
    const timer = window.setTimeout(async () => {
      try {
        const saved = await saveSharedMuseum(museumContent);
        latestSharedUpdate.current = saved.updatedAt;
        setSyncStatus("synced");
      } catch {
        setSyncStatus("offline");
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [museumContent]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (editMode) {
        return;
      }

      try {
        const shared = await fetchSharedMuseum();

        if (
          shared.content &&
          shared.updatedAt &&
          shared.updatedAt !== latestSharedUpdate.current
        ) {
          latestSharedUpdate.current = shared.updatedAt;
          skipNextSharedSave.current = true;
          setMuseumContent(normalizeContent(shared.content, defaultContent));
        }

        setSyncStatus("synced");
      } catch {
        setSyncStatus("offline");
      }
    }, 6000);

    return () => window.clearInterval(timer);
  }, [defaultContent, editMode]);

  function updateContent(nextContent) {
    setMuseumContent(normalizeContent(nextContent, defaultContent));
  }

  function updateMemory(memoryId, field, value) {
    updateContent({
      ...museumContent,
      memories: museumContent.memories.map((memory) =>
        memory.id === memoryId ? { ...memory, [field]: value } : memory,
      ),
    });
  }

  async function uploadMemoryImage(memoryId, file) {
    if (!file) {
      return;
    }

    const image = await resizeImage(file);
    updateMemory(memoryId, "image", image);
  }

  function addMemory() {
    updateContent({
      ...museumContent,
      memories: [
        ...museumContent.memories,
        {
          id: `memory-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10).replaceAll("-", "."),
          title: "新的回忆",
          type: "日常",
          image: "/placeholders/memory-1.svg",
          achievement: "新的小成就",
          message: "点这里写下你想收藏的话。",
        },
      ],
    });
  }

  function updateLetter(letterId, field, value) {
    updateContent({
      ...museumContent,
      futureLetters: museumContent.futureLetters.map((letter) =>
        letter.id === letterId ? { ...letter, [field]: value } : letter,
      ),
    });
  }

  function addCustomModule() {
    updateContent({
      ...museumContent,
      customModules: [
        ...museumContent.customModules,
        {
          id: `module-${Date.now()}`,
          title: "新的模块",
          content:
            "点这里写下你想展示的内容，比如愿望清单、纪念日、歌单或旅行计划。",
          hidden: false,
        },
      ],
    });
  }

  function updateCustomModule(moduleId, field, value) {
    updateContent({
      ...museumContent,
      customModules: museumContent.customModules.map((module) =>
        module.id === moduleId ? { ...module, [field]: value } : module,
      ),
    });
  }

  function removeCustomModule(moduleId) {
    updateContent({
      ...museumContent,
      customModules: museumContent.customModules.filter(
        (module) => module.id !== moduleId,
      ),
    });
  }

  function updateSiteText(field, value) {
    updateContent({
      ...museumContent,
      siteText: {
        ...museumContent.siteText,
        [field]: value,
      },
    });
  }

  function toggleSection(sectionKey) {
    updateContent({
      ...museumContent,
      sectionSettings: {
        ...museumContent.sectionSettings,
        [sectionKey]: !museumContent.sectionSettings[sectionKey],
      },
    });
  }

  function moveMemory(memoryId, direction) {
    updateContent({
      ...museumContent,
      memories: moveById(museumContent.memories, memoryId, direction),
    });
  }

  function moveLetter(letterId, direction) {
    updateContent({
      ...museumContent,
      futureLetters: moveById(museumContent.futureLetters, letterId, direction),
    });
  }

  function moveCustomModule(moduleId, direction) {
    updateContent({
      ...museumContent,
      customModules: moveById(museumContent.customModules, moduleId, direction),
    });
  }

  function exportContent() {
    const blob = new Blob([JSON.stringify(museumContent, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "time-museum-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importContent(file) {
    if (!file) {
      return;
    }

    const text = await file.text();
    const parsed = JSON.parse(text);
    updateContent(parsed);
  }

  const visible = museumContent.sectionSettings;

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7fb] text-[#3f2633]">
      <Hero
        editMode={editMode}
        siteText={museumContent.siteText}
        onUpdateSiteText={updateSiteText}
      />

      {visible.timeline && (
        <MemoryTimeline
          editMode={editMode}
          memories={museumContent.memories}
          onAddMemory={addMemory}
          onUpdateMemory={updateMemory}
          onUploadMemoryImage={uploadMemoryImage}
        />
      )}

      {visible.achievements && (
        <AchievementWall achievements={museumContent.achievements} />
      )}

      {visible.letters && (
        <FutureMailbox
          editMode={editMode}
          letters={museumContent.futureLetters}
          onUpdateLetter={updateLetter}
        />
      )}

      {visible.customModules && (
        <CustomModules
          editMode={editMode}
          modules={museumContent.customModules}
          onAddModule={addCustomModule}
          onRemoveModule={removeCustomModule}
          onUpdateModule={updateCustomModule}
        />
      )}

      {visible.confession && (
        <Confession
          editMode={editMode}
          siteText={museumContent.siteText}
          onUpdateSiteText={updateSiteText}
        />
      )}

      <MuseumEditor
        defaultContent={defaultContent}
        editMode={editMode}
        museumContent={museumContent}
        saveStatus={syncText[syncStatus]}
        onAddModule={addCustomModule}
        onChange={updateContent}
        onExport={exportContent}
        onImport={importContent}
        onMoveLetter={moveLetter}
        onMoveMemory={moveMemory}
        onMoveModule={moveCustomModule}
        onToggleEditMode={() => setEditMode((value) => !value)}
        onToggleSection={toggleSection}
      />
    </main>
  );
}

function normalizeContent(content, defaultContent) {
  return {
    ...defaultContent,
    ...content,
    memories: content?.memories || defaultContent.memories,
    achievements: content?.achievements || defaultContent.achievements,
    futureLetters: content?.futureLetters || defaultContent.futureLetters,
    customModules: content?.customModules || defaultContent.customModules,
    sectionSettings: {
      ...defaultContent.sectionSettings,
      ...content?.sectionSettings,
    },
    siteText: {
      ...defaultContent.siteText,
      ...content?.siteText,
    },
  };
}

function moveById(items, itemId, direction) {
  const nextItems = [...items];
  const currentIndex = nextItems.findIndex((item) => item.id === itemId);
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= nextItems.length) {
    return items;
  }

  const [item] = nextItems.splice(currentIndex, 1);
  nextItems.splice(nextIndex, 0, item);
  return nextItems;
}

export default App;
