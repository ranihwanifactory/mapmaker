import { POIType } from './types';
import { Home, Building2, ShoppingBag, TreePine, GraduationCap, Stethoscope, MapPin } from 'lucide-react';

export const POI_CONFIG = {
  [POIType.HOUSE]: { 
    label: '우리집', 
    description: '아늑한 빨간 지붕 집',
    icon: Home
  },
  [POIType.APARTMENT]: { 
    label: '아파트', 
    description: '높은 파란색 아파트',
    icon: Building2
  },
  [POIType.SHOP]: { 
    label: '상점', 
    description: '맛있는 걸 파는 가게',
    icon: ShoppingBag
  },
  [POIType.PARK]: { 
    label: '공원', 
    description: '나무가 많은 공원',
    icon: TreePine
  },
  [POIType.SCHOOL]: { 
    label: '학교', 
    description: '시계탑이 있는 학교',
    icon: GraduationCap
  },
  [POIType.HOSPITAL]: { 
    label: '병원', 
    description: '아픈 곳을 치료해요',
    icon: Stethoscope
  },
  [POIType.LANDMARK]: { 
    label: '랜드마크', 
    description: '동네의 자랑거리',
    icon: MapPin
  },
};

export const INITIAL_MAP_NAME = "나의 멋진 동네";

export const DEFAULT_VIEWPORT = { x: 0, y: 0, scale: 1 };