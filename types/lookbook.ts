import { FaceShapeType } from '@/types/diagnosis';
import { SeasonType } from '@/types/personalColor';

export type LookbookCategory = 'ALL' | 'CUT' | 'PERM' | 'COLOR';
export type HairLengthType = 'short' | 'medium' | 'long';
export type GenderFilterType = 'female' | 'male' | 'unisex';

export interface LookbookItem {
  id: string;
  styleName: string;
  styleNameEn: string;
  category: 'CUT' | 'PERM' | 'COLOR';
  gender: 'female' | 'male' | 'unisex';
  length: HairLengthType;
  targetFaceShapes: FaceShapeType[];
  targetPersonalColors: SeasonType[];
  imageUrl: string;
  description: string;
  stylingTips: string;
  tags: string[];
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  suitableHairTypes: string[];
  colorHex?: string;
  colorLevel?: string;
  timeEstimate?: string;
}

export interface MatchedLookbookItem extends LookbookItem {
  matchScore: number; // 0 ~ 100
  matchReasons: string[];
  isTopMatch: boolean;
}

export interface SelectedStyle {
  cutOrPerm?: MatchedLookbookItem;
  color?: MatchedLookbookItem;
  additionalStyles: MatchedLookbookItem[];
}
