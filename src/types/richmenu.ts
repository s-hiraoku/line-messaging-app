export interface TapArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: "uri" | "message" | "postback" | "datetimepicker" | "richmenuswitch" | "camera" | "cameraRoll" | "location";
    label?: string;
    uri?: string;
    text?: string;
    data?: string;
    mode?: string;
    initial?: string;
    max?: string;
    min?: string;
    richMenuAliasId?: string;
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
