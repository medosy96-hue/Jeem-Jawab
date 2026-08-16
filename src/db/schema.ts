import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/** الأسئلة */
export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    category: text("category").notNull(),
    text: text("text").notNull(),
    /** النص بعد التطبيع لمنع التكرار حتى مع تغير الهمزات أو المسافات */
    textKey: text("text_key"),
    /** يربط الصيغ المختلفة للمعلومة نفسها حتى لا تتكرر أثناء اللعب */
    familyKey: text("family_key"),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("questions_text_key_unique").on(t.textKey)]
);

/** الألعاب */
export const games = pgTable("games", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  mode: text("mode").notNull(), // local | online
  status: text("status").notNull().default("lobby"), // lobby | playing | finished
  hostName: text("host_name").notNull(),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  questionOrder: jsonb("question_order").$type<number[]>().notNull().default([]),
  questionSeconds: integer("question_seconds").notNull().default(20),
  resultSeconds: integer("result_seconds").notNull().default(5),
  totalQuestions: integer("total_questions").notNull().default(20),
  manualAdvance: boolean("manual_advance").notNull().default(false),
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  gamePhase: text("game_phase").notNull().default("lobby"), // lobby | active | break | finished
  phaseStartedAt: timestamp("phase_started_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** اللاعبون */
export const players = pgTable(
  "players",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    score: integer("score").notNull().default(0),
    isHost: boolean("is_host").notNull().default(false),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("players_game_idx").on(t.gameId)]
);

/** إجابات اللاعبين */
export const answers = pgTable(
  "answers",
  {
    id: serial("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    questionId: integer("question_id").notNull(),
    questionIndex: integer("question_index").notNull(),
    selectedIndex: integer("selected_index").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("answers_game_player_q").on(t.gameId, t.playerId, t.questionIndex),
    index("answers_game_idx").on(t.gameId),
  ]
);

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Game = typeof games.$inferSelect;
export type Player = typeof players.$inferSelect;
