import React, { useState } from "react";

export default function ExplanationPanel({
  text,
  onClose,
  onBackToCoins,
}: {
  text: string;
  onClose: () => void;
  onBackToCoins: () => void;
}) {
  // 🔹 Divido il testo in blocchi separati dal simbolo "🔹"
  const blocks = text
    .split("🔹")
    .map((b) =>
      b
        .trim()
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"))
    )
    .filter((b) => b.length > 0);

  // 🔹 Indice del blocco visibile
  const [visibleIndex, setVisibleIndex] = useState(0);

  const handleContinue = () => {
    if (visibleIndex < blocks.length - 1) {
      setVisibleIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (visibleIndex > 0) {
      setVisibleIndex((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const hasMore = visibleIndex < blocks.length - 1;

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
        {blocks[visibleIndex].map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>

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
    </div>
  );
}
