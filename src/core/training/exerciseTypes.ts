import type { Equipment, QuestCategory } from "../quest/questTypes";

export type Exercise = {
  id: string;
  name: string;
  category: QuestCategory;
  equipment: Equipment[];
  cue: string;
  easierVersion: string;
};
