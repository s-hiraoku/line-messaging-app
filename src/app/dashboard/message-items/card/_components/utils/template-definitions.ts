import type {
  TemplateAreaDefinition,
  TemplateDefinition,
  TemplateVariant,
} from '@/lib/template-image-splitter/types';

const BASE_SIZE = { width: 1024, height: 1024 } as const;

const verticalSplit = (
  id: string,
  name: string,
  description: string,
  ratios: number[],
  aspectRatioHint: TemplateAreaDefinition['aspectRatioHint'] = 'LANDSCAPE'
): TemplateVariant => {
  let consumed = 0;
  const heights = ratios.map((ratio, index) => {
    if (index === ratios.length - 1) {
      return BASE_SIZE.height - consumed;
    }
    const value = Math.round(BASE_SIZE.height * ratio);
    consumed += value;
    return value;
  });

  const areas: TemplateAreaDefinition[] = heights.map((height, index) => ({
    id: `area-${index + 1}`,
    label: index === 0 ? 'エリア1（上部）' : `エリア${index + 1}`,
    x: 0,
    y: heights.slice(0, index).reduce((sum, value) => sum + value, 0),
    width: BASE_SIZE.width,
    height,
    aspectRatioHint,
  }));

  const ratioLabel = ratios.length === 1 ? '100%' : ratios.map((ratio) => `${Math.round(ratio * 100)}`).join('/');

  return {
    id,
    name,
    description,
    areaCount: areas.length,
    layout: 'vertical',
    ratioLabel,
    baseSize: { ...BASE_SIZE },
    areas,
  };
};

const horizontalSplit = (
  id: string,
  name: string,
  description: string,
  ratios: number[],
  aspectRatioHint: TemplateAreaDefinition['aspectRatioHint'] = 'PORTRAIT'
): TemplateVariant => {
  let consumed = 0;
  const widths = ratios.map((ratio, index) => {
    if (index === ratios.length - 1) {
      return BASE_SIZE.width - consumed;
    }
    const value = Math.round(BASE_SIZE.width * ratio);
    consumed += value;
    return value;
  });

  const areas: TemplateAreaDefinition[] = widths.map((width, index) => ({
    id: `area-${index + 1}`,
    label: index === 0 ? 'エリア1（左）' : `エリア${index + 1}`,
    x: widths.slice(0, index).reduce((sum, value) => sum + value, 0),
    y: 0,
    width,
    height: BASE_SIZE.height,
    aspectRatioHint,
  }));

  const ratioLabel = ratios.length === 1 ? '100%' : ratios.map((ratio) => `${Math.round(ratio * 100)}`).join('/');

  return {
    id,
    name,
    description,
    areaCount: areas.length,
    layout: 'horizontal',
    ratioLabel,
    baseSize: { ...BASE_SIZE },
    areas,
  };
};

const gridVariant = (
  id: string,
  name: string,
  description: string,
  areas: TemplateAreaDefinition[],
  ratioLabel: string
): TemplateVariant => ({
  id,
  name,
  description,
  areaCount: areas.length,
  layout: 'grid',
  ratioLabel,
  baseSize: { ...BASE_SIZE },
  areas,
});

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  {
    id: 'single',
    title: '1分割テンプレート',
    description: '1枚の画像をそのまま表示',
    variants: [
      {
        id: 'split-1-full',
        name: '1分割（全画面）',
        description: '1024px正方形いっぱいに表示',
        ratioLabel: '100%',
        layout: 'single',
        areaCount: 1,
        baseSize: { ...BASE_SIZE },
        areas: [
          {
            id: 'area-1',
            label: 'エリア1',
            x: 0,
            y: 0,
            width: BASE_SIZE.width,
            height: BASE_SIZE.height,
            aspectRatioHint: 'SQUARE',
          },
        ],
      },
    ],
  },
  {
    id: 'split-2-vertical',
    title: '2分割（縦）',
    description: '上下でエリアを構成',
    variants: [
      verticalSplit('split-2-vertical-50-50', '2分割（縦）50/50', '上下に均等分割', [0.5, 0.5]),
      verticalSplit('split-2-vertical-60-40', '2分割（縦）60/40', '上部60%、下部40%', [0.6, 0.4]),
      verticalSplit('split-2-vertical-70-30', '2分割（縦）70/30', '上部70%、下部30%', [0.7, 0.3]),
    ],
  },
  {
    id: 'split-2-horizontal',
    title: '2分割（横）',
    description: '左右でエリアを構成',
    variants: [
      horizontalSplit('split-2-horizontal-50-50', '2分割（横）50/50', '左右に均等分割', [0.5, 0.5]),
      horizontalSplit('split-2-horizontal-60-40', '2分割（横）60/40', '左60%、右40%', [0.6, 0.4]),
      horizontalSplit('split-2-horizontal-70-30', '2分割（横）70/30', '左70%、右30%', [0.7, 0.3]),
    ],
  },
  {
    id: 'split-3-vertical',
    title: '3分割（縦）',
    description: '上下3エリア構成',
    variants: [
      verticalSplit('split-3-vertical-33-33-33', '3分割（縦）33/33/33', '上中下均等', [1 / 3, 1 / 3, 1 / 3]),
      verticalSplit('split-3-vertical-40-30-30', '3分割（縦）40/30/30', '上部40%、残り30%ずつ', [0.4, 0.3, 0.3]),
    ],
  },
  {
    id: 'split-3-horizontal',
    title: '3分割（横）',
    description: '左右3エリア構成',
    variants: [
      horizontalSplit('split-3-horizontal-33-33-33', '3分割（横）33/33/33', '左右均等3エリア', [1 / 3, 1 / 3, 1 / 3]),
      horizontalSplit('split-3-horizontal-40-30-30', '3分割（横）40/30/30', '左40%、残り30%ずつ', [0.4, 0.3, 0.3]),
    ],
  },
  {
    id: 'split-3-grid',
    title: '3分割（グリッド）',
    description: 'タイル状レイアウト',
    variants: [
      gridVariant(
        'split-3-grid-top-2-bottom-1',
        'グリッド 上2/下1',
        '上部に左右2エリア・下部に1エリア',
        [
          { id: 'area-1', label: 'エリア1（左上）', x: 0, y: 0, width: 512, height: 512 },
          { id: 'area-2', label: 'エリア2（右上）', x: 512, y: 0, width: 512, height: 512 },
          { id: 'area-3', label: 'エリア3（下部）', x: 0, y: 512, width: 1024, height: 512, aspectRatioHint: 'LANDSCAPE' },
        ],
        '上2/下1'
      ),
      gridVariant(
        'split-3-grid-top-1-bottom-2',
        'グリッド 上1/下2',
        '上部に1エリア・下部に左右2エリア',
        [
          { id: 'area-1', label: 'エリア1（上部）', x: 0, y: 0, width: 1024, height: 512, aspectRatioHint: 'LANDSCAPE' },
          { id: 'area-2', label: 'エリア2（左下）', x: 0, y: 512, width: 512, height: 512 },
          { id: 'area-3', label: 'エリア3（右下）', x: 512, y: 512, width: 512, height: 512 },
        ],
        '上1/下2'
      ),
      gridVariant(
        'split-3-grid-left-tall',
        'グリッド 左縦 長方形',
        '左側を上下ぶち抜き1枚、右側を上下2枚で構成',
        [
          { id: 'area-1', label: 'エリア1（左縦）', x: 0, y: 0, width: 576, height: 1024, aspectRatioHint: 'PORTRAIT' },
          { id: 'area-2', label: 'エリア2（右上）', x: 576, y: 0, width: 448, height: 512, aspectRatioHint: 'LANDSCAPE' },
          { id: 'area-3', label: 'エリア3（右下）', x: 576, y: 512, width: 448, height: 512, aspectRatioHint: 'LANDSCAPE' },
        ],
        '左縦＋右上下'
      ),
      gridVariant(
        'split-3-grid-right-tall',
        'グリッド 右縦 長方形',
        '右側を上下ぶち抜き1枚、左側を上下2枚で構成',
        [
          { id: 'area-1', label: 'エリア1（左上）', x: 0, y: 0, width: 448, height: 512, aspectRatioHint: 'LANDSCAPE' },
          { id: 'area-2', label: 'エリア2（左下）', x: 0, y: 512, width: 448, height: 512, aspectRatioHint: 'LANDSCAPE' },
          { id: 'area-3', label: 'エリア3（右縦）', x: 448, y: 0, width: 576, height: 1024, aspectRatioHint: 'PORTRAIT' },
        ],
        '右縦＋左上下'
      ),
    ],
  },
];

export const TEMPLATE_VARIANTS: TemplateVariant[] = TEMPLATE_CATALOG.flatMap((group) => group.variants);

export function getTemplateVariantById(templateId?: string | null): TemplateVariant | undefined {
  if (!templateId) return undefined;
  return TEMPLATE_VARIANTS.find((variant) => variant.id === templateId);
}
