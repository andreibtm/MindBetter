export type TrainingStage = "lesson" | "encode" | "recall" | "results";

export type StoredAnswer = {
  raw: string;
  normalized: string;
};

export type SessionRecord = {
  id: "association-intro";
  version: 1;
  status: "in_progress" | "completed";
  stage: TrainingStage;
  pairIndex: number;
  answers: StoredAnswer[];
  startedAt: string;
  updatedAt: string;
  score?: number;
};

export type ProgressRecord = {
  version: 2;
  completedSessions: number;
  totalCorrect: number;
  totalAttempts: number;
  bestScore: number;
  latestScore: number | null;
  lastCompletedAt: string | null;
  completedLessonIds: string[];
  xp: number;
  streak: number;
  lastActivityDate: string | null;
};

export type GuidedSessionRecord = {
  version: 1;
  lessonId: string;
  pageIndex: number;
  updatedAt: string;
};

export type MindBetterData = {
  schemaVersion: 2;
  session: SessionRecord | null;
  guidedSession: GuidedSessionRecord | null;
  progress: ProgressRecord;
  exportedAt?: string;
};

const DATABASE_NAME = "mindbetter";
const DATABASE_VERSION = 2;
const STORE_NAME = "records";
const SESSION_KEY = "current-session";
const GUIDED_SESSION_KEY = "guided-session";
const PROGRESS_KEY = "progress";

export const EMPTY_PROGRESS: ProgressRecord = {
  version: 2,
  completedSessions: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  bestScore: 0,
  latestScore: null,
  lastCompletedAt: null,
  completedLessonIds: [],
  xp: 0,
  streak: 0,
  lastActivityDate: null,
};

function migrateProgress(progress?: Partial<ProgressRecord> & { version?: number }): ProgressRecord {
  const hadAssociationSession = (progress?.completedSessions ?? 0) > 0;
  return {
    ...EMPTY_PROGRESS,
    ...progress,
    version: 2,
    completedLessonIds:
      progress?.completedLessonIds ??
      (hadAssociationSession
        ? ["foundation-baseline", "foundation-attention", "foundation-association"]
        : []),
    xp: progress?.xp ?? (hadAssociationSession ? 35 : 0),
    streak: progress?.streak ?? (hadAssociationSession ? 1 : 0),
    lastActivityDate:
      progress?.lastActivityDate ?? progress?.lastCompletedAt?.slice(0, 10) ?? null,
  };
}

export function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[.,!?;:]+$/g, "");
}

export function scoreAnswers(
  answers: StoredAnswer[],
  targets: string[],
) {
  return targets.reduce(
    (score, target, index) =>
      score + (answers[index]?.normalized === normalizeAnswer(target) ? 1 : 0),
    0,
  );
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadMindBetterData(): Promise<MindBetterData> {
  if (typeof indexedDB === "undefined") {
    return { schemaVersion: 2, session: null, guidedSession: null, progress: EMPTY_PROGRESS };
  }

  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const [session, guidedSession, progress] = await Promise.all([
      requestResult<SessionRecord | undefined>(store.get(SESSION_KEY)),
      requestResult<GuidedSessionRecord | undefined>(store.get(GUIDED_SESSION_KEY)),
      requestResult<ProgressRecord | undefined>(store.get(PROGRESS_KEY)),
    ]);
    await transactionComplete(transaction);
    return {
      schemaVersion: 2,
      session: session ?? null,
      guidedSession: guidedSession ?? null,
      progress: migrateProgress(progress),
    };
  } finally {
    database.close();
  }
}

export async function saveSession(session: SessionRecord) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(session, SESSION_KEY);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function saveGuidedSession(session: GuidedSessionRecord) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(session, GUIDED_SESSION_KEY);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function clearGuidedSession() {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(GUIDED_SESSION_KEY);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function saveProgress(progress: ProgressRecord) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(progress, PROGRESS_KEY);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function saveCompletion(
  session: SessionRecord,
  progress: ProgressRecord,
) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(session, SESSION_KEY);
    store.put(progress, PROGRESS_KEY);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function clearMindBetterData() {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).clear();
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function exportMindBetterData() {
  const data = await loadMindBetterData();
  return JSON.stringify(
    { ...data, exportedAt: new Date().toISOString() },
    null,
    2,
  );
}
