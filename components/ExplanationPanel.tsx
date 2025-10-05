import React, { useState, useMemo } from "react";

export default function ExplanationPanel({
  text,
  onClose,
  onBackToCoins,
}: {
  text: string;
  onClose: () => void;
  onBackToCoins: () => void;
}) {
  // 🔹 Suddivido il testo in paragrafi
  const paragraphs = text.split(/\n\s*\n/).map((p) =>
    p.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
  );

  // 🔹 Trovo dove compare "ulteriori informazioni:"
  const splitIndex = useMemo(() => {
    return paragraphs.findIndex((p) =>
      p.toLowerCase().includes("ulteriori informazioni:")
    );
  }, [paragraphs]);

  // 🔹 Divido in due parti: prima (visibile subito) e dopo (a chunk)
  const beforeExtra =
    splitIndex >= 0 ? paragraphs.slice(0, splitIndex + 1) : paragraphs;
  const afterExtra =
    splitIndex >= 0 ? paragraphs.slice(splitIndex + 1) : [];

  // 🔹 Numero paragrafi per chunk
  const CHUNK_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(0);

  const visibleAfter = afterExtra.slice(0, visibleCount);

  const handleContinue = () => {
    if (visibleCount < afterExtra.length)
      setVisibleCount((prev) => prev + CHUNK_SIZE);
  };

  const handleBack = () => {
    if (visibleCount > 0)
      setVisibleCount((prev) => Math.max(0, prev - CHUNK_SIZE));
    else onClose();
  };

  const hasMore = visibleCount < afterExtra.length;

  return (
    <div className="absolute inset-0 bg-white border rounded-xl shadow-lg p-6 overflow-y-auto z-10">
      <h2 className="text-xl font-bold mb-4">Istruzioni</h2>

      <div
        style={{
          fontFamily: "Verdana, sans-serif",
          fontSize: "20px",
          textAlign: "justify",
        }}
        className="mb-6 space-y-4"
      >
        {/* 🔹 Mostro sempre la prima parte (fino a “ulteriori informazioni:”) */}
        {beforeExtra.map((p, i) => (
          <p key={`b-${i}`} dangerouslySetInnerHTML={{ __html: p }} />
        ))}

        {/* 🔹 Mostro progressivamente la parte successiva */}
        {visibleAfter.map((p, i) => (
          <p key={`a-${i}`} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>

      {/* 🔹 Bottoni visibili se c’è testo dopo “ulteriori informazioni:” */}
      {afterExtra.length > 0 && (
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleBack}
              className="px-3 py-2 rounded-xl bg-gray-700 text-white text-sm shadow hover:opacity-90"
            >
              Torna indietro
            </button>

            <button
              onClick={onBackToCoins}
              className="px-3 py-2 rounded-xl bg-amber-600 text-white text-sm shadow hover:opacity-90"
            >
              Torna al lancio delle monete
            </button>
          </div>

          {hasMore && (
            <button
              onClick={handleContinue}
              className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm shadow hover:opacity-90"
            >
              Continua
            </button>
          )}
        </div>
      )}
    </div>
  );
}
