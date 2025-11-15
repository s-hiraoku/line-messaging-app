export interface TemplateAreaDefinition {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatioHint?: 'SQUARE' | 'LANDSCAPE' | 'PORTRAIT';
}

export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  ratioLabel: string;
  layout: 'single' | 'vertical' | 'horizontal' | 'grid';
  areaCount: number;
  baseSize: {
    width: number;
    height: number;
  };
  areas: TemplateAreaDefinition[];
}

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  variants: TemplateVariant[];
}

export interface TemplateArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
}

export interface TemplateImageMessage {
  templateId: string;
  areas: TemplateArea[];
}
