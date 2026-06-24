import type { PlayerStat, QuestHistoryEntry } from "../quest/questTypes";

export type XpByStat = Record<PlayerStat, number>;

export type QuestLogStatus = QuestHistoryEntry["status"];

export type XpResult = {
  total: number;
  byStat: XpByStat;
  comebackBonus: number;
  message: string;
};
