export default function ExplanationPanel({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  // 🔹 Suddivido il testo in paragrafi sugli a capo doppi
  const paragraphs = text.split(/\n\s*\n/).map((p) =>
    // 🔹 Converto **parola** in <b>parola</b>
    p.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
  );

  return (
    <div className="absolute inset-0 bg-white border rounded-xl shadow-lg p-6 overflow-y-auto z-10">
      <h2 className="text-xl font-bold mb-4">Istruzioni</h2>

      <div
        style={{
          fontFamily: "Verdana, sans-serif",
          fontSize: "20px",
          textAlign: "justify",
        }}
        className="mb-4 space-y-4"
      >
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>

      <button
        onClick={onClose}
        className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm shadow hover:opacity-90"
      >
        Torna indietro
      </button>
    </div>
  );
}
