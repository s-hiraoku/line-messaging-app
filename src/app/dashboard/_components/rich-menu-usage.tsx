import { Menu, Check } from "lucide-react";

type RichMenuStat = {
  id: string;
  name: string;
  selected: boolean;
  userCount: number;
};

type Props = {
  data: RichMenuStat[];
};

export function RichMenuUsage({ data }: Props) {
  const totalAssigned = data.reduce((sum, menu) => sum + menu.userCount, 0);

  if (data.length === 0) {
    return (
      <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">リッチメニュー利用状況</h2>
          <Menu className="h-5 w-5 text-black/40" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-black/60">リッチメニューがありません</p>
      </article>
    );
  }

  return (
    <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-black">リッチメニュー利用状況</h2>
        <Menu className="h-5 w-5 text-[#00B900]" />
      </div>

      <ul className="space-y-3">
        {data.map((menu) => (
          <li
            key={menu.id}
            className="flex items-center gap-3 p-3 border-2 border-black bg-[#FFFEF5] hover:bg-white transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-black truncate">
                  {menu.name}
                </p>
                {menu.selected && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#00B900] border-2 border-black text-white text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Check className="h-3 w-3" />
                    デフォルト
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-black/60 mt-1">
                {menu.userCount} ユーザーに割り当て
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-right">
                <p className="text-lg font-bold text-black">{menu.userCount}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t-2 border-black">
        <p className="text-xs font-bold uppercase tracking-wider text-black/60">
          合計割り当て数: <span className="text-black font-bold">{totalAssigned}</span>
        </p>
      </div>
    </article>
  );
}
