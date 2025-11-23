export enum POIType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  SHOP = 'SHOP',
  PARK = 'PARK',
  SCHOOL = 'SCHOOL',
  HOSPITAL = 'HOSPITAL',
  LANDMARK = 'LANDMARK'
}

export interface POI {
  id: string;
  x: number;
  y: number;
  type: POIType;
  name: string;
  description: string;
}

export interface Path {
  id: string;
  fromId: string;
  toId: string;
}

export interface MapData {
  pois: POI[];
  paths: Path[];
  name: string;
}

export enum ToolMode {
  SELECT = 'SELECT',
  ADD_POI = 'ADD_POI',
  CONNECT = 'CONNECT'
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}