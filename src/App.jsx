import { useMemo, useState } from "react";
import AchievementWall from "./components/AchievementWall";
import AuthEntrance from "./components/AuthEntrance";
import CloudMuseumEditor from "./components/CloudMuseumEditor";
import Confession from "./components/Confession";
import CustomModules from "./components/CustomModules";
import FutureMailbox from "./components/FutureMailbox";
import Hero from "./components/Hero";
import MemoryDetail from "./components/MemoryDetail";
import MemoryTimeline from "./components/MemoryTimeline";
import MuseumWelcome from "./components/MuseumWelcome";
import { useSupabaseMuseum } from "./hooks/useSupabaseMuseum";

function App() {
  const defaultContent = useMemo(
    () => ({
      memories: [
        {
          id: "first-meet",
          date: "2024.03.16",
          title: "第一次见到你",
          type: "初见",
          image: "/placeholders/memory-1.svg",
          achievement: "第一次见面",
          message:
            "那天之后，我开始觉得，原来一个普通的日子也可以因为遇见你变得闪闪发光。",
        },
        {
          id: "first-walk",
          date: "2024.04.05",
          title: "一起慢慢散步",
          type: "日常",
          image: "/placeholders/memory-2.svg",
          achievement: "第一次散步",
          message:
            "和你并肩走路的时候，连风都变得很温柔。我想把这段路走得慢一点，再慢一点。",
        },
        {
          id: "first-dinner",
          date: "2024.05.20",
          title: "第一顿正式晚餐",
          type: "纪念日",
          image: "/placeholders/memory-3.svg",
          achievement: "第一次一起吃饭",
          message:
            "我记得你笑起来的样子，也记得那天的灯光。更记得我心里悄悄说：就是她了。",
        },
      ],
      achievements: [
        "第一次见面",
        "第一次散步",
        "第一次一起吃饭",
        "第一次旅行",
        "第一次一起熬夜",
        "第一次过生日",
      ],
      futureLetters: [
        {
          id: "letter-spring",
          date: "写给下一个春天",
          title: "等花开的时候",
          content:
            "等下一个春天来临，我们再一起去看花。到那时，我还是会像现在一样，很认真地喜欢你。",
        },
      ],
      customModules: [
        {
          id: "wish-list",
          title: "我们的愿望清单",
          content:
            "一起看海、一起拍很多照片、一起去喜欢的城市，也一起过很多普通但幸福的日子。",
          hidden: false,
        },
      ],
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

  const cloud = useSupabaseMuseum(defaultContent);
  const [editMode, setEditMode] = useState(false);
  const [siteText, setSiteText] = useState(defaultContent.siteText);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);

  const selectedMemory =
    cloud.memories.find((memory) => memory.id === selectedMemoryId) || null;

  function updateSiteText(field, value) {
    setSiteText((current) => ({ ...current, [field]: value }));
  }

  if (!cloud.configured) {
    return <ConfigMissing />;
  }

  if (cloud.authLoading) {
    return <LoadingScreen text="正在打开我们的博物馆" />;
  }

  if (!cloud.session) {
    return (
      <AuthEntrance onSignIn={cloud.signIn} syncStatus={cloud.syncStatus} />
    );
  }

  if (!cloud.museum) {
    return (
      <MuseumWelcome
        loading={cloud.loadingMuseum}
        onCreateMuseum={cloud.createMuseum}
        onJoinMuseum={cloud.joinMuseum}
        syncStatus={cloud.syncStatus}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7fb] pb-24 text-[#3f2633]">
      <Hero
        editMode={editMode}
        siteText={siteText}
        onUpdateSiteText={updateSiteText}
      />

      <MemoryTimeline
        detailByMemoryId={cloud.detailByMemoryId}
        editMode={editMode}
        memories={cloud.memories}
        onAddMemory={cloud.addMemory}
        onOpenMemory={(memory) => setSelectedMemoryId(memory.id)}
        onUpdateMemory={cloud.updateMemory}
        onUploadMemoryImage={cloud.uploadMemoryImage}
      />

      <AchievementWall achievements={defaultContent.achievements} />

      <FutureMailbox
        editMode={editMode}
        letters={cloud.letters}
        onUpdateLetter={cloud.updateLetter}
      />

      <CustomModules
        editMode={false}
        modules={defaultContent.customModules}
        onAddModule={() => {}}
        onRemoveModule={() => {}}
        onUpdateModule={() => {}}
      />

      <Confession
        editMode={editMode}
        siteText={siteText}
        onUpdateSiteText={updateSiteText}
      />

      <CloudMuseumEditor
        editMode={editMode}
        inviteLink={cloud.inviteLink}
        members={cloud.members}
        notice={cloud.notice}
        role={cloud.role}
        syncStatus={cloud.syncStatus}
        onAddLetter={cloud.addLetter}
        onAddMemory={cloud.addMemory}
        onCreateInvite={cloud.createInvite}
        onReload={cloud.reload}
        onSignOut={cloud.signOut}
        onToggleEditMode={() => setEditMode((value) => !value)}
      />

      {selectedMemory && (
        <MemoryDetail
          detail={cloud.detailByMemoryId[selectedMemory.id]}
          memory={selectedMemory}
          onAddComment={cloud.addComment}
          onClose={() => setSelectedMemoryId(null)}
          onToggleReaction={cloud.toggleReaction}
        />
      )}
    </main>
  );
}

function LoadingScreen({ text }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fff7fb] px-5 text-center text-[#3f2633]">
      <div className="rounded-[30px] border border-white/80 bg-white/72 p-8 shadow-[0_28px_80px_rgba(206,80,128,0.16)] backdrop-blur">
        <p className="text-lg font-semibold text-[#9a3869]">{text}</p>
      </div>
    </main>
  );
}

function ConfigMissing() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fff7fb] px-5 text-center text-[#3f2633]">
      <div className="max-w-md rounded-[30px] border border-white/80 bg-white/72 p-8 shadow-[0_28px_80px_rgba(206,80,128,0.16)] backdrop-blur">
        <h1 className="text-3xl font-semibold text-[#4a1f31]">
          还差一把云端钥匙
        </h1>
        <p className="mt-4 leading-7 text-[#744557]">
          请先配置 Supabase 环境变量，再重新部署。这样照片和回忆才能在两台设备之间同步。
        </p>
      </div>
    </main>
  );
}

export default App;
