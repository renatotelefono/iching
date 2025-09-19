export default function LineGraphic({
  yang,
  changing,
}: {
  yang: boolean;
  changing: boolean;
}) {
  return (
    <div className="flex-1 h-3 relative">
      {yang ? (
        <div
          className={`h-full rounded bg-neutral-900/90 ${
            changing ? "animate-pulse" : ""
          }`}
        />
      ) : (
        <div className="h-full flex items-center justify-between">
          <div
            className={`h-1.5 w-2/5 rounded bg-neutral-900/90 ${
              changing ? "animate-pulse" : ""
            }`}
          />
          <div className="h-1.5 w-6" />
          <div
            className={`h-1.5 w-2/5 rounded bg-neutral-900/90 ${
              changing ? "animate-pulse" : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}
