import * as SQLite from "expo-sqlite";

import { getQuestIntensity } from "../core/quest/questEngine";
import type { CheckIn, Quest } from "../core/quest/questTypes";
import type { XpByStat } from "../core/xp/xpTypes";
import type {
  AppStorage,
  JournalReflection,
  LocalSnapshot,
  PlayerProfile,
  QuestLogRecord
} from "./storage";
import { createEmptyXpTotals, lastNDays, todayKey } from "./storage";

type Database = ReturnType<typeof SQLite.openDatabaseSync>;
type ValueRow = { value: string };
type QuestRow = { value: string };
type LogRow = { value: string };
type JournalRow = { value: string };
type XpRow = { stat: keyof XpByStat; value: number };

const DB_NAME = "ascend-local-mvp.db";
let database: Database | null = null;

function getDb() {
  if (!database) {
    database = SQLite.openDatabaseSync(DB_NAME);
    database.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS check_ins (
        date TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS quests (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS quest_logs (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        quest_id TEXT NOT NULL,
        status TEXT NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS journal_reflections (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS xp_totals (
        stat TEXT PRIMARY KEY NOT NULL,
        value INTEGER NOT NULL
      );
    `);
  }
  return database;
}

function readJson<T>(row?: ValueRow | QuestRow | LogRow | JournalRow | null) {
  if (!row) return undefined;
  return JSON.parse(row.value) as T;
}

function setKv<T>(key: string, value: T) {
  getDb().runSync(
    "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
    key,
    JSON.stringify(value)
  );
}

function getKv<T>(key: string) {
  const row = getDb().getFirstSync<ValueRow>(
    "SELECT value FROM kv WHERE key = ?",
    key
  );
  return readJson<T>(row);
}

export const localStore: AppStorage = {
  async loadSnapshot(): Promise<LocalSnapshot> {
    const date = todayKey();
    const profile = getKv<PlayerProfile>("profile");
    const todayCheckIn = readJson<CheckIn>(
      getDb().getFirstSync<ValueRow>(
        "SELECT value FROM check_ins WHERE date = ?",
        date
      )
    );
    const todayQuest = readJson<Quest>(
      getDb().getFirstSync<QuestRow>(
        "SELECT value FROM quests WHERE date = ? ORDER BY id DESC LIMIT 1",
        date
      )
    );
    const questLogs = getDb()
      .getAllSync<LogRow>(
        "SELECT value FROM quest_logs ORDER BY date DESC, id DESC LIMIT 50"
      )
      .map((row) => readJson<QuestLogRecord>(row))
      .filter((value): value is QuestLogRecord => Boolean(value));
    const journalReflections = getDb()
      .getAllSync<JournalRow>(
        "SELECT value FROM journal_reflections ORDER BY date DESC, id DESC LIMIT 50"
      )
      .map((row) => readJson<JournalReflection>(row))
      .filter((value): value is JournalReflection => Boolean(value));
    const xpTotals = loadXpTotals();
    const history = questLogs.map((log) => ({
      date: log.date,
      questId: log.questId,
      category: log.category,
      dayMode: log.dayMode,
      status: log.status,
      intensity:
        log.category === "strength" && log.dayMode === "green"
          ? "high"
          : getQuestIntensity({
              id: log.questId,
              title: log.questTitle,
              category: log.category,
              dayMode: log.dayMode,
              durationMin: 0,
              xpReward: log.xpTotal,
              reason: "",
              steps: []
            })
    }));

    return {
      profile,
      todayCheckIn,
      todayQuest,
      questLogs,
      journalReflections,
      xpTotals,
      history,
      activeDays7: countActiveDays(questLogs, 7),
      activeDays14: countActiveDays(questLogs, 14)
    };
  },

  async saveProfile(profile: PlayerProfile): Promise<void> {
    setKv("profile", profile);
  },

  async saveDailyPlan(checkIn: CheckIn, quest: Quest): Promise<void> {
    getDb().runSync(
      "INSERT OR REPLACE INTO check_ins (date, value) VALUES (?, ?)",
      checkIn.date,
      JSON.stringify(checkIn)
    );
    getDb().runSync(
      "INSERT OR REPLACE INTO quests (id, date, value) VALUES (?, ?, ?)",
      quest.id,
      checkIn.date,
      JSON.stringify(quest)
    );
  },

  async getQuestById(id: string): Promise<Quest | null> {
    const row = getDb().getFirstSync<QuestRow>(
      "SELECT value FROM quests WHERE id = ?",
      id
    );
    return readJson<Quest>(row) ?? null;
  },

  async saveQuestLog(log: QuestLogRecord): Promise<void> {
    getDb().runSync(
      "INSERT OR REPLACE INTO quest_logs (id, date, quest_id, status, value) VALUES (?, ?, ?, ?, ?)",
      log.id,
      log.date,
      log.questId,
      log.status,
      JSON.stringify(log)
    );
  },

  async addXp(xp: XpByStat): Promise<void> {
    const current = loadXpTotals();
    for (const stat of Object.keys(current) as (keyof XpByStat)[]) {
      const value = current[stat] + xp[stat];
      getDb().runSync(
        "INSERT OR REPLACE INTO xp_totals (stat, value) VALUES (?, ?)",
        stat,
        value
      );
    }
  },

  async saveJournalReflection(reflection: JournalReflection): Promise<void> {
    getDb().runSync(
      "INSERT OR REPLACE INTO journal_reflections (id, date, value) VALUES (?, ?, ?)",
      reflection.id,
      reflection.date,
      JSON.stringify(reflection)
    );
  }
};

function loadXpTotals() {
  const totals = createEmptyXpTotals();
  const rows = getDb().getAllSync<XpRow>("SELECT stat, value FROM xp_totals");
  for (const row of rows) {
    totals[row.stat] = row.value;
  }
  return totals;
}

function countActiveDays(logs: QuestLogRecord[], dayCount: number) {
  const days = new Set(lastNDays(dayCount));
  const active = new Set(
    logs
      .filter(
        (log) =>
          days.has(log.date) &&
          (log.status === "completed" || log.status === "stopped_safely")
      )
      .map((log) => log.date)
  );
  return active.size;
}
