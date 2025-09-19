import LineGraphic from "./LineGraphic";
import { LineValue, isYang, isChanging } from "@/utils/iching";

export default function HexagramView({
  lines,
  title,
}: {
  lines: LineValue[];
  title: string;
}) {
  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <div className="text-base font-semibold">{title}</div>
      </div>
      <div className="p-4 space-y-2 flex flex-col">
        {[...lines].reverse().map((v, idx) => {
          const yang = isYang(v);
          const changing = isChanging(v);
          const lineNumber = lines.length - idx;
          return (
            <div key={idx} className="flex items-center gap-3">
              <LineGraphic yang={yang} changing={changing} />
              <div className="w-24 text-xs text-right text-neutral-500">
                linea {lineNumber} {changing ? "(muta)" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
