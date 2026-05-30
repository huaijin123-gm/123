import { Award, CheckCircle2, Lock } from "lucide-react";

function AchievementWall({ achievements }) {
  const defaultLocked = ["第一次一起熬夜", "第一次完成共同目标"];
  const allAchievements = [...new Set([...achievements, ...defaultLocked])];

  return (
    <section className="bg-white/55 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
            <Award size={16} />
            成就墙
          </p>
          <h2 className="text-3xl font-semibold text-[#4a1f31] sm:text-4xl">
            我们一起解锁的小小奇迹
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allAchievements.map((achievement, index) => {
            const unlocked = achievements.includes(achievement);

            return (
              <div
                key={achievement}
                className={`reveal-card flex items-center gap-4 rounded-3xl border p-5 shadow-[0_15px_40px_rgba(206,80,128,0.1)] ${
                  unlocked
                    ? "border-[#ffd6e8] bg-[#fff9fc]"
                    : "border-dashed border-[#e9d8e0] bg-white/50"
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_12px_24px_rgba(233,70,131,0.22)] ${
                    unlocked ? "bg-[#e94683]" : "bg-[#c8b4bf]"
                  }`}
                >
                  {unlocked ? <CheckCircle2 size={22} /> : <Lock size={20} />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#c34973]">
                    {unlocked ? "已解锁成就" : "等待我们一起完成"}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[#4a1f31]">
                    {achievement}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AchievementWall;
