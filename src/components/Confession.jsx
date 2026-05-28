import { useState } from "react";
import { HeartHandshake, LockKeyholeOpen } from "lucide-react";
import InlineEditable from "./InlineEditable";

function Confession({ editMode, siteText, onUpdateSiteText }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const showHiddenText = editMode || isRevealed;

  return (
    <section className="px-5 pb-24 pt-12 sm:px-8">
      <div
        className={`mx-auto max-w-4xl rounded-[32px] border border-white/80 bg-white/75 p-8 text-center shadow-[0_28px_80px_rgba(206,80,128,0.16)] backdrop-blur sm:p-12 ${
          editMode ? "editable-surface" : ""
        }`}
      >
        <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
          <HeartHandshake size={16} />
          最后一间展厅
        </p>

        <h2 className="text-balance text-3xl font-semibold leading-tight text-[#4a1f31] sm:text-4xl">
          <InlineEditable
            as="textarea"
            editMode={editMode}
            value={siteText.confessionTitle}
            onChange={(value) => onUpdateSiteText("confessionTitle", value)}
            placeholder="结尾告白标题"
          />
        </h2>

        <button
          type="button"
          onClick={() => setIsRevealed(true)}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e94683] px-7 py-3 text-base font-semibold text-white shadow-[0_18px_35px_rgba(233,70,131,0.32)] transition hover:-translate-y-0.5 hover:bg-[#d93474] active:scale-95"
        >
          <LockKeyholeOpen size={18} />
          打开隐藏告白
        </button>

        <div
          className={`mx-auto grid max-w-2xl transition-all duration-500 ${
            showHiddenText
              ? "mt-8 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <p className="overflow-hidden text-lg leading-9 text-[#744557]">
            <InlineEditable
              as="textarea"
              editMode={editMode}
              value={siteText.confessionHidden}
              onChange={(value) => onUpdateSiteText("confessionHidden", value)}
              placeholder="隐藏告白文字"
            />
          </p>
        </div>
      </div>
    </section>
  );
}

export default Confession;
