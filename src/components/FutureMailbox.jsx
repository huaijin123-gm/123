import { useState } from "react";
import { Mailbox, Send } from "lucide-react";
import InlineEditable from "./InlineEditable";

function FutureMailbox({ editMode, letters, onUpdateLetter }) {
  const [openLetterId, setOpenLetterId] = useState(letters[0]?.id);

  return (
    <section id="letters" className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#d7427c]">
              <Mailbox size={16} />
              未来信箱
            </p>
            <h2 className="text-3xl font-semibold text-[#4a1f31] sm:text-4xl">
              把现在的喜欢，寄给以后的我们
            </h2>
          </div>
          <p className="max-w-md leading-7 text-[#744557]">
            点开一封信，就像拆开一个只属于我们的未来约定。
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {letters.map((letter, index) => {
            const isOpen = editMode || openLetterId === letter.id;

            return (
              <article
                key={letter.id}
                className={`reveal-card min-h-[230px] rounded-[28px] border p-6 text-left shadow-[0_18px_50px_rgba(206,80,128,0.12)] transition hover:-translate-y-1 ${
                  isOpen
                    ? "border-[#f18ab2] bg-white"
                    : "border-white/80 bg-white/70 hover:bg-white"
                } ${editMode ? "editable-surface" : ""}`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#ffe1ed] px-3 py-1 text-sm font-semibold text-[#be3f6d]">
                    {letter.date}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenLetterId(isOpen ? null : letter.id)}
                    disabled={editMode}
                    aria-label="打开或收起这封信"
                    className="rounded-full p-1 text-[#c9879e] transition enabled:hover:bg-[#fff0f6]"
                  >
                    <Send
                      size={18}
                      className={isOpen ? "text-[#e94683]" : "text-[#c9879e]"}
                    />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-[#4a1f31]">
                  <InlineEditable
                    editMode={editMode}
                    value={letter.title}
                    onChange={(value) =>
                      onUpdateLetter(letter.id, "title", value)
                    }
                    placeholder="信件标题"
                  />
                </h3>

                <div
                  className={`grid transition-all duration-300 ${
                    isOpen
                      ? "mt-4 grid-rows-[1fr] opacity-100"
                      : "mt-0 grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="overflow-hidden leading-8 text-[#744557]">
                    <InlineEditable
                      as="textarea"
                      editMode={editMode}
                      value={letter.content}
                      onChange={(value) =>
                        onUpdateLetter(letter.id, "content", value)
                      }
                      placeholder="信件内容"
                    />
                  </p>
                </div>

                {!isOpen && (
                  <button
                    type="button"
                    onClick={() => setOpenLetterId(letter.id)}
                    className="mt-5 text-sm font-semibold text-[#bd4a73]"
                  >
                    点击打开这封信
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FutureMailbox;
