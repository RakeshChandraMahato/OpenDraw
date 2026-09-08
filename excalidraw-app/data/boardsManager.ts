import { createStore, get, set, del } from "idb-keyval";
import { clearAppStateForLocalStorage } from "@excalidraw/excalidraw/appState";
import { getNonDeletedElements } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

import { STORAGE_KEYS } from "../app_constants";

import { importFromLocalStorage } from "./localStorage";

export interface BoardMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface BoardData {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState> | null;
}

const boardsStore = createStore(
  `${STORAGE_KEYS.IDB_BOARDS}-db`,
  `${STORAGE_KEYS.IDB_BOARDS}-store`,
);

export const getBoardsList = (): BoardMeta[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOARDS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load boards list from localStorage", err);
  }
  return [];
};

export const saveBoardsList = (list: BoardMeta[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOARDS_LIST, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save boards list to localStorage", err);
  }
};

export const getActiveBoardId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BOARD_ID) || "";
  } catch {
    return "";
  }
};

export const setActiveBoardId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BOARD_ID, id);
  } catch (err) {
    console.error("Failed to set active board ID", err);
  }
};

export const loadBoardData = async (
  boardId: string,
): Promise<BoardData | null> => {
  try {
    const data = await get<BoardData>(boardId, boardsStore);
    if (data && Array.isArray(data.elements)) {
      return data;
    }
  } catch (err) {
    console.error(`Failed to load board data for ${boardId} from IDB`, err);
  }

  // Fallback to localStorage if board is board_default
  if (boardId === "board_default") {
    const fallback = importFromLocalStorage();
    if (fallback && fallback.elements && fallback.elements.length > 0) {
      return fallback;
    }
  }

  return null;
};

export const saveBoardData = async (
  boardId: string,
  elements: readonly ExcalidrawElement[],
  appState: AppState,
): Promise<void> => {
  try {
    const cleanElements = getNonDeletedElements(elements);
    const cleanAppState = clearAppStateForLocalStorage(appState);
    const data: BoardData = {
      elements: cleanElements,
      appState: cleanAppState,
    };
    await set(boardId, data, boardsStore);

    // Update updatedAt in metadata
    const list = getBoardsList();
    const target = list.find((b) => b.id === boardId);
    if (target) {
      target.updatedAt = Date.now();
      saveBoardsList(list);
    }
  } catch (err) {
    console.error(`Failed to save board data for ${boardId} to IDB`, err);
  }
};

const getNextBoardName = (list: BoardMeta[]): string => {
  const existingNames = new Set(list.map((b) => b.name.toLowerCase()));
  let num = 1;
  while (existingNames.has(`b${num}`)) {
    num++;
  }
  return `B${num}`;
};

export const createBoard = async (name?: string): Promise<BoardMeta> => {
  const list = getBoardsList();
  const boardName = name || getNextBoardName(list);
  const newBoard: BoardMeta = {
    id: `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: boardName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updatedList = [...list, newBoard];
  saveBoardsList(updatedList);
  setActiveBoardId(newBoard.id);

  // Initialize empty scene in IDB
  await set(newBoard.id, { elements: [], appState: null }, boardsStore);

  return newBoard;
};

export const deleteBoard = async (
  boardId: string,
): Promise<{ remainingBoards: BoardMeta[]; nextActiveId: string }> => {
  try {
    await del(boardId, boardsStore);
  } catch (err) {
    console.error(`Failed to delete board ${boardId} from IDB`, err);
  }

  const list = getBoardsList();
  const index = list.findIndex((b) => b.id === boardId);
  const remaining = list.filter((b) => b.id !== boardId);

  if (remaining.length === 0) {
    // If no boards remain, create a fresh B1
    const fresh = await createBoard("B1");
    return {
      remainingBoards: [fresh],
      nextActiveId: fresh.id,
    };
  }

  saveBoardsList(remaining);

  // Select nearest board
  const nextIndex = Math.min(Math.max(0, index), remaining.length - 1);
  const nextActiveId = remaining[nextIndex].id;
  setActiveBoardId(nextActiveId);

  return {
    remainingBoards: remaining,
    nextActiveId,
  };
};

export const renameBoard = (boardId: string, newName: string): BoardMeta[] => {
  const trimmed = newName.trim();
  if (!trimmed) {
    return getBoardsList();
  }
  const list = getBoardsList();
  const updated = list.map((b) =>
    b.id === boardId ? { ...b, name: trimmed, updatedAt: Date.now() } : b,
  );
  saveBoardsList(updated);
  return updated;
};

export const initBoards = async (): Promise<{
  boards: BoardMeta[];
  activeBoardId: string;
  initialData: BoardData | null;
}> => {
  let list = getBoardsList();

  if (list.length === 0) {
    // Migration: check if existing localStorage has data
    const existing = importFromLocalStorage();
    const defaultBoard: BoardMeta = {
      id: "board_default",
      name: "B1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (existing && existing.elements && existing.elements.length > 0) {
      await set(defaultBoard.id, existing, boardsStore);
    } else {
      await set(defaultBoard.id, { elements: [], appState: null }, boardsStore);
    }

    list = [defaultBoard];
    saveBoardsList(list);
    setActiveBoardId(defaultBoard.id);
  } else {
    // Auto-migrate any legacy "Board 1", "Board 2" to "B1", "B2"
    let didMigrateNames = false;
    list = list.map((b) => {
      const match = b.name.match(/^Board\s*(\d+)$/i);
      if (match) {
        didMigrateNames = true;
        return { ...b, name: `B${match[1]}` };
      }
      return b;
    });
    if (didMigrateNames) {
      saveBoardsList(list);
    }
  }

  let activeId = getActiveBoardId();
  if (!activeId || !list.some((b) => b.id === activeId)) {
    activeId = list[0].id;
    setActiveBoardId(activeId);
  }

  const initialData = await loadBoardData(activeId);

  return {
    boards: list,
    activeBoardId: activeId,
    initialData,
  };
};
