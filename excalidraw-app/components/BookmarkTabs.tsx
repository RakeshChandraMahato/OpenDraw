import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";

import "./BookmarkTabs.scss";

import type { BoardMeta } from "../data/boardsManager";

interface BookmarkTabsProps {
  boards: BoardMeta[];
  activeBoardId: string;
  theme?: string;
  onSelectBoard: (id: string) => void;
  onCreateBoard: () => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard: (id: string, name: string) => void;
}

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const BookmarkTabs: React.FC<BookmarkTabsProps> = ({
  boards,
  activeBoardId,
  theme,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartRename = (e: React.MouseEvent, board: BoardMeta) => {
    e.stopPropagation();
    setEditingId(board.id);
    setEditingName(board.name);
  };

  const handleCommitRename = () => {
    if (editingId && editingName.trim()) {
      onRenameBoard(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommitRename();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={clsx("opendraw-bookmark-tabs", {
        "opendraw-bookmark-tabs--dark": isDark,
        "opendraw-bookmark-tabs--light": !isDark,
      })}
      role="tablist"
      aria-label="Drawing Boards"
    >
      <div className="opendraw-bookmark-tabs__list">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          const isEditing = board.id === editingId;

          return (
            <div
              key={board.id}
              className={clsx("opendraw-bookmark-tab", {
                "opendraw-bookmark-tab--active": isActive,
              })}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              title={
                isEditing ? undefined : `${board.name} (double-click to rename)`
              }
              onClick={() => {
                if (!isActive && !isEditing) {
                  onSelectBoard(board.id);
                }
              }}
              onDoubleClick={(e) => handleStartRename(e, board)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isActive && !isEditing) {
                  onSelectBoard(board.id);
                }
              }}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  className="opendraw-bookmark-tab__input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleCommitRename}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="opendraw-bookmark-tab__name">
                  {board.name}
                </span>
              )}

              <button
                type="button"
                className="opendraw-bookmark-tab__delete"
                title={boards.length === 1 ? "Clear board" : "Delete board"}
                aria-label={
                  boards.length === 1 ? "Clear board" : "Delete board"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBoard(board.id);
                }}
              >
                <CloseIcon />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="opendraw-bookmark-add"
        title="New board"
        aria-label="New board"
        onClick={onCreateBoard}
      >
        <PlusIcon />
      </button>
    </div>
  );
};
