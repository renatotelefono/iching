export default function HeaderBar({
  onExplain,
  onRandomize,
  onReset,
}: {
  onExplain: () => void;
  onRandomize: () => void;
  onReset: () => void;
}) {
  return (
    <header className="flex items-center justify-between relative">
      <h1 className="text-2xl font-bold tracking-tight">Lettura dell’I Ching</h1>
      <div className="flex gap-2">
        <button
          onClick={onExplain}
          className="px-3 py-2 rounded-xl bg-neutral-700 text-white text-sm shadow hover:opacity-90"
        >
          Spiegazione
        </button>
        <button
          onClick={onRandomize}
          className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm shadow hover:opacity-90"
        >
          Lancia 3 monete × 6
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 rounded-xl bg-white border text-sm shadow-sm hover:bg-neutral-50"
        >
          Azzera (tutte yin)
        </button>
      </div>
    </header>
  );
}
