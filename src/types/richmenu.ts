export interface TapArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "uri" | "message" | "postback";
    label?: string;
    uri?: string;
    text?: string;
    data?: string;
  };
}

export interface RichMenuSize {
  width: number;
  height: number;
}

export type RichMenuSizeType = "full" | "half";

export interface Point {
  x: number;
  y: number;
}
