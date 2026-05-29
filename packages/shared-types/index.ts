/**
 * @packageDocumentation
 * shared-types — DevNexus
 *
 * Single source of truth for all domain types shared between
 * `apps/web` (Next.js) and `apps/api` (FastAPI / Python typegen).
 *
 * Keep this file free of runtime code — types and enums only.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

/** ISO 8601 datetime string (from Supabase TIMESTAMPTZ columns) */
export type ISODateString = string;

/** ISO 8601 date-only string (YYYY-MM-DD) */
export type ISODate = string;

/** Opaque UUID string */
export type UUID = string;

/** Generic API paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Generic API success/error envelope */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: UUID;
  githubId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  name: string | null;
  bio: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Public-safe subset of User (no tokens) */
export type PublicUser = Omit<User, 'githubId'>;

export interface UserSettings {
  userId: UUID;
  theme: ThemeName;
  accentColor: string | null;
  vibeModeEnabled: boolean;
  roastModeEnabled: boolean;
  chronicleTime: string; // HH:mm
  widgetLayout: WidgetLayout;
  updatedAt: ISODateString;
}

export type ThemeName = 'midnight' | 'aurora' | 'synthwave' | 'forest' | 'ocean';

export interface WidgetLayout {
  widgets: WidgetConfig[];
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visible: boolean;
}

export type WidgetType =
  | 'todos'
  | 'github-stats'
  | 'hackathon'
  | 'chronicle'
  | 'notes'
  | 'activity';

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Stats
// ─────────────────────────────────────────────────────────────────────────────

export interface GitHubStats {
  username: string;
  totalCommitsThisYear: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  currentStreak: number;
  longestStreak: number;
  contributionCalendar: ContributionWeek[];
  topLanguages: LanguageStat[];
  pinnedRepos: Repository[];
  recentActivity: ActivityEvent[];
  followers: number;
  following: number;
  publicRepos: number;
  fetchedAt: ISODateString;
}

export interface ContributionWeek {
  weekStart: ISODate;
  days: ContributionDay[];
}

export interface ContributionDay {
  date: ISODate;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // GitHub contribution intensity
}

export interface LanguageStat {
  name: string;
  color: string;
  percentage: number;
  bytes: number;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  isPrivate: boolean;
  updatedAt: ISODateString;
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Events
// ─────────────────────────────────────────────────────────────────────────────

export type ActivityEventType =
  | 'push'
  | 'pr'
  | 'issue'
  | 'star'
  | 'fork'
  | 'comment'
  | 'review';

export interface ActivityEvent {
  id: UUID;
  userId: UUID;
  eventType: ActivityEventType;
  repoName: string;
  eventData: ActivityEventData;
  read: boolean;
  createdAt: ISODateString;
}

export interface ActivityEventData {
  title?: string;
  url?: string;
  branch?: string;
  commitCount?: number;
  action?: string;
  number?: number;
  body?: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Todos
// ─────────────────────────────────────────────────────────────────────────────

export type TodoStatus = 'todo' | 'in-progress' | 'done';
export type TodoPriority = 'high' | 'medium' | 'low';
export type RecurrenceType = 'daily' | 'weekly';

export interface Todo {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  aiScore: number; // 0–100, AI-assigned importance score
  dueDate: ISODateString | null;
  isRecurring: boolean;
  recurrenceType: RecurrenceType | null;
  streak: number;
  tags: string[];
  subtasks: Subtask[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Subtask {
  id: UUID;
  todoId: UUID;
  title: string;
  completed: boolean;
  position: number;
  createdAt: ISODateString;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: ISODateString;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  tags?: string[];
}

export interface UpdateTodoInput extends Partial<CreateTodoInput> {
  status?: TodoStatus;
  aiScore?: number;
  streak?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notes
// ─────────────────────────────────────────────────────────────────────────────

export interface Note {
  id: UUID;
  userId: UUID;
  title: string;
  content: string; // Markdown / rich text
  tags: string[];
  repoLink: string | null;
  isPinned: boolean;
  wordCount: number;
  versions: NoteVersion[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface NoteVersion {
  id: UUID;
  noteId: UUID;
  content: string;
  versionNumber: number;
  createdAt: ISODateString;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  repoLink?: string;
  isPinned?: boolean;
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  saveVersion?: boolean; // if true, snapshot current content before update
}

// ─────────────────────────────────────────────────────────────────────────────
// Hackathons
// ─────────────────────────────────────────────────────────────────────────────

export type HackathonStatus =
  | 'upcoming'
  | 'active'
  | 'submitted'
  | 'archived'
  | 'won';

/** Phases: 0 = Ideation, 1 = Building, 2 = Polish, 3 = Submit */
export type HackathonPhase = 0 | 1 | 2 | 3;

export interface Hackathon {
  id: UUID;
  userId: UUID;
  name: string;
  theme: string | null;
  deadline: ISODateString;
  teamMembers: string[];
  techStack: string[];
  prizePool: string | null;
  status: HackathonStatus;
  currentPhase: HackathonPhase;
  pitchGenerated: string | null;
  judgeScore: JudgeScore | null;
  notes: string | null;
  checklist: HackathonChecklistItem[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface HackathonChecklistItem {
  id: UUID;
  hackathonId: UUID;
  phase: HackathonPhase;
  title: string;
  completed: boolean;
  position: number;
}

export interface JudgeScore {
  innovation: number;   // 0–10
  execution: number;    // 0–10
  design: number;       // 0–10
  impact: number;       // 0–10
  overall: number;      // computed average
  feedback: string;
}

export interface CreateHackathonInput {
  name: string;
  theme?: string;
  deadline: ISODateString;
  teamMembers?: string[];
  techStack?: string[];
  prizePool?: string;
  notes?: string;
}

export interface UpdateHackathonInput extends Partial<CreateHackathonInput> {
  status?: HackathonStatus;
  currentPhase?: HackathonPhase;
  pitchGenerated?: string;
  judgeScore?: JudgeScore;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Chronicles
// ─────────────────────────────────────────────────────────────────────────────

export type ChronicleType = 'daily' | 'weekly' | 'roast';

export interface Chronicle {
  id: UUID;
  userId: UUID;
  type: ChronicleType;
  content: string; // AI-generated markdown narrative
  isRoastMode: boolean;
  date: ISODate;
  createdAt: ISODateString;
}

export interface GenerateChronicleInput {
  type: ChronicleType;
  date?: ISODate; // defaults to today
  roastMode?: boolean;
  context?: ChronicleContext;
}

export interface ChronicleContext {
  todosCompleted?: number;
  todosCreated?: number;
  notesWritten?: number;
  commitsToday?: number;
  hackathonActive?: boolean;
  topRepos?: string[];
  mood?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'hackathon_deadline'
  | 'todo_due'
  | 'chronicle_ready'
  | 'github_activity'
  | 'streak_milestone'
  | 'system';

export interface Notification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: ISODateString;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI / LLM
// ─────────────────────────────────────────────────────────────────────────────

export interface AISuggestion {
  todoId: UUID;
  suggestedPriority: TodoPriority;
  suggestedScore: number;
  reasoning: string;
  estimatedMinutes: number | null;
}

export interface AIHackathonPitch {
  hackathonId: UUID;
  pitch: string;            // elevator pitch paragraph
  tagline: string;          // one-liner
  keyFeatures: string[];
  targetAudience: string;
  techStackRationale: string;
  generatedAt: ISODateString;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard / Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  user: PublicUser;
  githubStats: GitHubStats;
  todaysTodos: Todo[];
  upcomingHackathons: Hackathon[];
  recentNotes: Note[];
  latestChronicle: Chronicle | null;
  notifications: Notification[];
  streak: number;
  productivityScore: number; // 0–100
}

export interface ProductivityMetrics {
  date: ISODate;
  todosCompleted: number;
  todosCreated: number;
  notesCreated: number;
  githubCommits: number;
  score: number;
}
