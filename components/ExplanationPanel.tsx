export default function ExplanationPanel({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-white border rounded-xl shadow-lg p-6 overflow-y-auto z-10">
      <h2 className="text-xl font-bold mb-4">Istruzioni</h2>
      <pre className="whitespace-pre-wrap text-sm mb-4">{text}</pre>
      <button
        onClick={onClose}
        className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm shadow hover:opacity-90"
      >
        Torna indietro
      </button>
    </div>
  );
}
