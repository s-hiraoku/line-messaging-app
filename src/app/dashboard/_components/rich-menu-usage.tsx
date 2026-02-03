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
      <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">リッチメニュー利用状況</h2>
          <Menu className="h-5 w-5 text-gray-400" />
        </div>
        <p className="py-8 text-center text-sm font-bold text-gray-500">リッチメニューがありません</p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">リッチメニュー利用状況</h2>
        <Menu className="h-5 w-5 text-[#00B900]" />
      </div>

      <ul className="space-y-3">
        {data.map((menu) => (
          <li
            key={menu.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#e8f5e9] hover:bg-white transition-colors shadow-[inset_0_-3px_8px_rgba(0,0,0,0.04),inset_0_2px_4px_rgba(255,255,255,0.8)]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {menu.name}
                </p>
                {menu.selected && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00B900] text-white text-xs font-bold uppercase tracking-wider shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)]">
                    <Check className="h-3 w-3" />
                    デフォルト
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-gray-500 mt-1">
                {menu.userCount} ユーザーに割り当て
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{menu.userCount}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          合計割り当て数: <span className="text-gray-800 font-bold">{totalAssigned}</span>
        </p>
      </div>
    </article>
  );
}
