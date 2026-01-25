"use client";

import { useState } from 'react';
import {
  SelectRadix,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  Combobox,
  Dropdown,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui';
import {
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  MapPin,
  Settings,
  Star,
  Heart,
  Home,
  Code,
  Database,
  Cloud,
  Server,
} from 'lucide-react';

export default function DropdownDemoPage() {
  // Select (Radix UI) の状態
  const [selectValue, setSelectValue] = useState('');
  const [selectGroupValue, setSelectGroupValue] = useState('');

  // Combobox の状態
  const [comboboxValue, setComboboxValue] = useState('');
  const [comboboxGroupValue, setComboboxGroupValue] = useState('');

  // カスタムDropdown の状態
  const [dropdownValue, setDropdownValue] = useState('');
  const [dropdownMultiValue, setDropdownMultiValue] = useState<string[]>([]);

  // Combobox用オプション
  const comboboxOptions = [
    {
      value: 'react',
      label: 'React',
      description: 'UIを構築するためのJavaScriptライブラリ',
      icon: <Code className="h-4 w-4" />,
    },
    {
      value: 'nextjs',
      label: 'Next.js',
      description: 'Reactのフレームワーク',
      icon: <Server className="h-4 w-4" />,
    },
    {
      value: 'typescript',
      label: 'TypeScript',
      description: '型安全なJavaScript',
      icon: <Code className="h-4 w-4" />,
    },
    {
      value: 'tailwind',
      label: 'Tailwind CSS',
      description: 'ユーティリティファーストのCSSフレームワーク',
      icon: <Cloud className="h-4 w-4" />,
    },
    {
      value: 'postgres',
      label: 'PostgreSQL',
      description: 'オープンソースのリレーショナルデータベース',
      icon: <Database className="h-4 w-4" />,
    },
  ];

  // Comboboxグループ化オプション
  const comboboxGroups = [
    {
      label: '人気',
      options: [
        {
          value: 'star1',
          label: 'お気に入り 1',
          icon: <Star className="h-4 w-4" />,
        },
        {
          value: 'star2',
          label: 'お気に入り 2',
          icon: <Star className="h-4 w-4" />,
        },
        {
          value: 'heart1',
          label: 'いいね 1',
          icon: <Heart className="h-4 w-4" />,
        },
      ],
    },
    {
      label: '一般',
      options: [
        {
          value: 'home',
          label: 'ホーム',
          icon: <Home className="h-4 w-4" />,
        },
        {
          value: 'settings',
          label: '設定',
          icon: <Settings className="h-4 w-4" />,
        },
        {
          value: 'user',
          label: 'プロフィール',
          icon: <User className="h-4 w-4" />,
        },
      ],
    },
  ];

  // カスタムDropdown用オプション
  const dropdownOptions = [
    { value: 'user', label: 'ユーザー', icon: <User className="h-4 w-4" /> },
    { value: 'mail', label: 'メール', icon: <Mail className="h-4 w-4" /> },
    { value: 'phone', label: '電話', icon: <Phone className="h-4 w-4" /> },
    { value: 'globe', label: 'ウェブサイト', icon: <Globe className="h-4 w-4" /> },
    { value: 'calendar', label: 'カレンダー', icon: <Calendar className="h-4 w-4" /> },
    { value: 'map', label: '地図', icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#e8f5e9] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            ドロップダウンコンポーネント デモ
          </h1>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto">
            shadcn/ui (Radix UI) ベースの高品質なSelectとComboboxコンポーネント。
            アクセシビリティ、キーボードナビゲーション、スムーズなアニメーションを備えています。
          </p>
        </div>

        {/* コンポーネント比較表 */}
        <Card className="rounded-2xl shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <CardTitle className="text-gray-800">コンポーネントの選択ガイド</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-4 rounded-xl bg-[#e8f5e9] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                <h3 className="font-semibold text-[#00B900]">Select (Radix UI)</h3>
                <p className="text-sm text-gray-500">
                  シンプルな選択肢に最適。ネイティブに近い動作で、キーボード操作に完全対応。
                </p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>10-20個程度のオプション</li>
                  <li>グループ化サポート</li>
                  <li>高速・軽量</li>
                </ul>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-[#e8f5e9] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                <h3 className="font-semibold text-[#00B900]">Combobox</h3>
                <p className="text-sm text-gray-500">
                  検索可能なドロップダウン。多数のオプションから絞り込みが必要な場合に最適。
                </p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>20個以上のオプション</li>
                  <li>検索/フィルタリング</li>
                  <li>説明テキスト対応</li>
                </ul>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-[#e8f5e9] shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                <h3 className="font-semibold text-[#00B900]">カスタムDropdown</h3>
                <p className="text-sm text-gray-500">
                  高度な機能が必要な場合。マルチセレクト、最大選択数制限など。
                </p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>マルチセレクト</li>
                  <li>最大選択数制限</li>
                  <li>カスタムレンダリング</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Select (Radix UI) */}
          <Card className="rounded-2xl shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
            <CardHeader>
              <CardTitle className="text-gray-800">Select (Radix UI)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  基本的なSelect
                </label>
                <SelectRadix value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="フルーツを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">りんご</SelectItem>
                    <SelectItem value="banana">バナナ</SelectItem>
                    <SelectItem value="orange">オレンジ</SelectItem>
                    <SelectItem value="grape">ぶどう</SelectItem>
                    <SelectItem value="melon">メロン</SelectItem>
                  </SelectContent>
                </SelectRadix>
                {selectValue && (
                  <p className="mt-2 text-sm text-gray-500">
                    選択: <span className="text-[#00B900]">{selectValue}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  グループ化されたSelect
                </label>
                <SelectRadix value={selectGroupValue} onValueChange={setSelectGroupValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="プログラミング言語を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>フロントエンド</SelectLabel>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="react">React</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>バックエンド</SelectLabel>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                      <SelectItem value="go">Go</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>データベース</SelectLabel>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="nosql">NoSQL</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </SelectRadix>
                {selectGroupValue && (
                  <p className="mt-2 text-sm text-gray-500">
                    選択: <span className="text-[#00B900]">{selectGroupValue}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  無効状態
                </label>
                <SelectRadix disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="無効なSelect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">このオプション</SelectItem>
                  </SelectContent>
                </SelectRadix>
              </div>
            </CardContent>
          </Card>

          {/* Combobox (検索可能) */}
          <Card className="rounded-2xl shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
            <CardHeader>
              <CardTitle className="text-gray-800">Combobox (検索可能)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  技術スタックを検索
                </label>
                <Combobox
                  value={comboboxValue}
                  onValueChange={setComboboxValue}
                  options={comboboxOptions}
                  placeholder="技術を選択..."
                  searchPlaceholder="技術を検索..."
                  emptyMessage="該当する技術が見つかりません"
                />
                {comboboxValue && (
                  <p className="mt-2 text-sm text-gray-500">
                    選択: <span className="text-[#00B900]">{comboboxValue}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  グループ化されたCombobox
                </label>
                <Combobox
                  value={comboboxGroupValue}
                  onValueChange={setComboboxGroupValue}
                  groups={comboboxGroups}
                  placeholder="カテゴリーから選択..."
                  searchPlaceholder="検索..."
                />
                {comboboxGroupValue && (
                  <p className="mt-2 text-sm text-gray-500">
                    選択: <span className="text-[#00B900]">{comboboxGroupValue}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  エラー状態
                </label>
                <Combobox
                  options={comboboxOptions}
                  placeholder="選択してください"
                  error="このフィールドは必須です"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  無効状態
                </label>
                <Combobox
                  options={comboboxOptions}
                  placeholder="無効なCombobox"
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* カスタムDropdown (高度な機能) */}
          <Card className="lg:col-span-2 rounded-2xl shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
            <CardHeader>
              <CardTitle className="text-gray-800">カスタムDropdown (高度な機能)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    シングルセレクト + 検索
                  </label>
                  <Dropdown
                    value={dropdownValue}
                    onChange={(val) => setDropdownValue(val as string)}
                    options={dropdownOptions}
                    placeholder="連絡方法を選択"
                    searchable
                    searchPlaceholder="連絡方法を検索..."
                  />
                  {dropdownValue && (
                    <p className="mt-2 text-sm text-gray-500">
                      選択: <span className="text-[#00B900]">{dropdownValue}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    マルチセレクト (最大3個)
                  </label>
                  <Dropdown
                    value={dropdownMultiValue}
                    onChange={(val) => setDropdownMultiValue(val as string[])}
                    options={dropdownOptions}
                    placeholder="複数選択可能"
                    multiple
                    maxSelections={3}
                    searchable
                  />
                  {dropdownMultiValue.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">選択中:</p>
                      <div className="flex flex-wrap gap-2">
                        {dropdownMultiValue.map((val) => (
                          <span
                            key={val}
                            className="px-2 py-1 bg-[#00B900]/20 text-[#00B900] rounded-lg text-xs"
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主な機能 */}
        <Card className="rounded-2xl shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <CardTitle className="text-gray-800">主な機能と改善点</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">見た目の改善</h3>
                <ul className="text-gray-500 space-y-1 list-disc list-inside">
                  <li>スムーズなアニメーション</li>
                  <li>モダンなデザイン</li>
                  <li>クレイモーフィズム対応</li>
                  <li>ホバー/フォーカスエフェクト</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">キーボード対応</h3>
                <ul className="text-gray-500 space-y-1 list-disc list-inside">
                  <li>上下キーでオプション移動</li>
                  <li>Enter で選択</li>
                  <li>Escape で閉じる</li>
                  <li>文字入力で検索</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">アクセシビリティ</h3>
                <ul className="text-gray-500 space-y-1 list-disc list-inside">
                  <li>ARIA属性完全対応</li>
                  <li>スクリーンリーダー対応</li>
                  <li>フォーカス管理</li>
                  <li>キーボード完全対応</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">高度な機能</h3>
                <ul className="text-gray-500 space-y-1 list-disc list-inside">
                  <li>検索/フィルタリング</li>
                  <li>グループ化</li>
                  <li>アイコン・説明対応</li>
                  <li>マルチセレクト</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用例 */}
        <Card className="rounded-2xl shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <CardTitle className="text-gray-800">使用例</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Select (Radix UI)</h3>
                <div className="rounded-xl p-4 overflow-x-auto bg-gray-50 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                  <pre className="text-xs text-gray-700">
                    <code>{`import {
  SelectRadix,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

<SelectRadix value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="選択してください" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">オプション 1</SelectItem>
    <SelectItem value="option2">オプション 2</SelectItem>
  </SelectContent>
</SelectRadix>`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Combobox</h3>
                <div className="rounded-xl p-4 overflow-x-auto bg-gray-50 shadow-[inset_0_-6px_16px_rgba(0,0,0,0.04),inset_0_3px_8px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.08)]">
                  <pre className="text-xs text-gray-700">
                    <code>{`import { Combobox } from '@/components/ui';

<Combobox
  value={value}
  onValueChange={setValue}
  options={[
    { value: '1', label: 'オプション 1', icon: <Icon /> },
    { value: '2', label: 'オプション 2', description: '説明' },
  ]}
  placeholder="選択してください..."
  searchPlaceholder="検索..."
/>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
