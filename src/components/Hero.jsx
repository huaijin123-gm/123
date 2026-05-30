import { CalendarHeart, ChevronDown, Sparkles } from "lucide-react";
import InlineEditable from "./InlineEditable";

function Hero({ editMode, siteText, onUpdateSiteText }) {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center px-5 py-16 text-center sm:px-8">
      <div className="absolute inset-0 hero-scene" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <div className="hero-badge mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
          <Sparkles size={16} />
          <InlineEditable
            editMode={editMode}
            value={siteText.heroBadge}
            onChange={(value) => onUpdateSiteText("heroBadge", value)}
            placeholder="小标题"
          />
        </div>

        <h1 className="text-balance text-5xl font-semibold leading-tight text-[#4a1f31] drop-shadow-[0_4px_18px_rgba(255,255,255,0.5)] sm:text-6xl lg:text-7xl">
          <InlineEditable
            editMode={editMode}
            value={siteText.heroTitle}
            onChange={(value) => onUpdateSiteText("heroTitle", value)}
            placeholder="网站标题"
          />
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-[#71364f] sm:text-xl">
          <InlineEditable
            editMode={editMode}
            value={siteText.heroSubtitle}
            onChange={(value) => onUpdateSiteText("heroSubtitle", value)}
            placeholder="网站副标题"
          />
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#home"
            className="hero-primary-link inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-base font-semibold text-white transition hover:-translate-y-0.5 active:scale-95"
          >
            <CalendarHeart size={19} />
            进入今天
          </a>
          <a
            href="#timeline"
            className="hero-secondary-link inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-base font-semibold transition hover:-translate-y-0.5 active:scale-95"
          >
            参观时间轴
          </a>
        </div>
      </div>

      <a
        href="#home"
        aria-label="前往首页"
        className="hero-scroll-link absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full p-3 transition"
      >
        <ChevronDown className="animate-bounce" size={22} />
      </a>
    </section>
  );
}

export default Hero;
