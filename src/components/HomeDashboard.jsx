import { CalendarDays, PenLine, Sparkles, Upload } from "lucide-react";

const quotes = [
  "今天也把喜欢好好放进生活里。",
  "普通的一天，也可以被我们认真收藏。",
  "慢慢来，很多美好的事都在路上。",
  "这里不是相册，是我们一起生活过的证据。",
];

function HomeDashboard({ memories, onAddMemory }) {
  const quote = quotes[new Date().getDate() % quotes.length];
  const todayMemory = memories[new Date().getDate() % Math.max(memories.length, 1)];
  const nextAnniversary = getNextAnniversary(memories);

  return (
    <section id="home" className="px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_20px_60px_rgba(206,80,128,0.13)] backdrop-blur sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
            <Sparkles size={16} />
            今日一句
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#4a1f31] sm:text-3xl">
            {quote}
          </h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onAddMemory}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e94683] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(233,70,131,0.28)] transition active:scale-95"
            >
              <PenLine size={17} />
              今天想留下些什么？
            </button>
            <a
              href="#timeline"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fff0f6] px-5 text-sm font-semibold text-[#9a3869] transition active:scale-95"
            >
              <Upload size={17} />
              给回忆加照片
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <InfoCard
            icon={<CalendarDays size={17} />}
            label="下一个纪念日"
            value={
              nextAnniversary
                ? `${nextAnniversary.title} · 还有 ${nextAnniversary.days} 天`
                : "先添加一条带日期的回忆"
            }
          />
          <InfoCard
            icon={<Sparkles size={17} />}
            label="今日回忆"
            value={todayMemory ? todayMemory.title : "这里还没有回忆"}
          />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white/72 p-5 shadow-[0_16px_46px_rgba(206,80,128,0.1)] backdrop-blur">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold leading-7 text-[#4a1f31]">
        {value}
      </p>
    </div>
  );
}

function getNextAnniversary(memories) {
  const dated = memories
    .map((memory) => ({
      title: memory.achievement || memory.title,
      date: parseDate(memory.date),
    }))
    .filter((item) => item.date);

  if (!dated.length) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next = dated
    .map((item) => {
      const nextDate = new Date(
        today.getFullYear(),
        item.date.getMonth(),
        item.date.getDate(),
      );

      if (nextDate < today) {
        nextDate.setFullYear(today.getFullYear() + 1);
      }

      return {
        title: item.title,
        days: Math.round((nextDate - today) / 86400000),
      };
    })
    .sort((a, b) => a.days - b.days)[0];

  return next;
}

function parseDate(value) {
  const normalized = String(value || "").replaceAll(".", "-");
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default HomeDashboard;
