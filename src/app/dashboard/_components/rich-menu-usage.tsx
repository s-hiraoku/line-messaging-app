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
      <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">リッチメニュー利用状況</h2>
          <Menu className="h-5 w-5 text-slate-500" />
        </div>
        <p className="py-8 text-center text-sm text-slate-500">リッチメニューがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">リッチメニュー利用状況</h2>
        <Menu className="h-5 w-5 text-purple-500" />
      </div>

      <ul className="space-y-3">
        {data.map((menu) => (
          <li
            key={menu.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {menu.name}
                </p>
                {menu.selected && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
                    <Check className="h-3 w-3" />
                    デフォルト
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {menu.userCount} ユーザーに割り当て
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-right">
                <p className="text-lg font-semibold text-purple-400">{menu.userCount}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          合計割り当て数: <span className="text-white font-medium">{totalAssigned}</span>
        </p>
      </div>
    </article>
  );
}
