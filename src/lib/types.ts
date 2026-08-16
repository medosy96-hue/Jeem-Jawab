export interface LeaderboardEntry {
  playerId: string;
  name: string;
  score: number;
  isHost: boolean;
  isYou: boolean;
  rank: number;
}

export interface QuestionView {
  id: number;
  category: string;
  text: string;
  options: string[];
  correctIndex: number | null;
  imageUrl: string | null;
}

export interface MyView {
  playerId: string;
  name: string;
  score: number;
  answered: boolean;
  selectedIndex: number | null;
  isCorrect: boolean | null;
}

export type Phase = "lobby" | "active" | "break" | "finished";

export interface GameState {
  code: string;
  mode: "local" | "online";
  status: string;
  hostName: string;
  categories: string[];
  difficulties: string[];
  phase: Phase;
  questionIndex: number;
  questionNumber: number;
  totalQuestions: number;
  manualAdvance: boolean;
  questionSeconds: number;
  breakSeconds: number;
  activeEndsAt: number;
  breakEndsAt: number;
  now: number;
  question: QuestionView | null;
  my: MyView | null;
  playersCount: number;
  maxPlayers: number;
  leaderboard: LeaderboardEntry[];
}
