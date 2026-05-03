import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ExternalLink, X, ChevronDown, ChevronRight, AlertTriangle, Copy, RotateCcw, ArrowRightLeft } from 'lucide-react';
import type { TabData, TabGroupData } from '../db';

interface OtherGroup {
  id: string;
  name: string;
}

interface TabCardProps {
  group: TabGroupData;
  index: number;
  otherGroups: OtherGroup[];
  onDeleteGroup: (id: string) => void;
  onDeleteTab: (groupId: string, tabId: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onMoveTab: (tabId: string, fromGroupId: string, toGroupId: string) => void;
  onRestoreGroup?: (tabs: TabData[]) => void;
  onDragStart?: (tabId: string, groupId: string) => void;
  onDrop?: (tabId: string, fromGroupId: string, toGroupId: string) => void;
  onDragEnter?: (groupId: string) => void;
  onDragLeave?: (groupId: string) => void;
  isDraggingOver?: boolean;
}

export function TabCard({ group, index, otherGroups, onDeleteGroup, onDeleteTab, onRenameGroup, onMoveTab, onRestoreGroup, onDragStart, onDrop, onDragEnter, onDragLeave, isDraggingOver }: TabCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedTabId = e.dataTransfer.getData('text/plain');
    const draggedFromGroupId = e.dataTransfer.getData('application/x-from-group-id');
    if (onDrop && draggedTabId && draggedFromGroupId) {
      onDrop(draggedTabId, draggedFromGroupId, group.id);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragEnter) onDragEnter(group.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragLeave) onDragLeave(group.id);
  };

  const handleRename = () => {
    if (editName.trim()) {
      onRenameGroup(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-xl border p-3 transition-all duration-200 ${
        isDraggingOver
          ? 'border-purple-500/50 bg-purple-500/10 scale-[1.02]'
          : group.color || 'bg-surface-raised border-zinc-700/50'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-white/5 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          {isEditing ? (
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              autoFocus
              className="bg-transparent border-b border-brand outline-none text-sm font-medium min-w-0 w-40"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium truncate hover:underline text-left"
              title="Click to rename"
            >
              {group.name}
            </button>
          )}
          <span className="text-xs opacity-50 shrink-0">({group.tabs.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {onRestoreGroup && (
            <button
              onClick={() => onRestoreGroup(group.tabs)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
              title="Restore all tabs in this group"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors opacity-40 hover:opacity-100"
            title="Delete group"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1">
              {group.tabs.map((tab, i) => (
                <TabRow
                  key={tab.id}
                  tab={tab}
                  index={i}
                  groupId={group.id}
                  otherGroups={otherGroups}
                  onDelete={() => onDeleteTab(group.id, tab.id)}
                  onMove={(toGroupId) => onMoveTab(tab.id, group.id, toGroupId)}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TabRow({ tab, index, groupId, otherGroups, onDelete, onMove, onDragStart }: {
  tab: TabData;
  index: number;
  groupId: string;
  otherGroups: OtherGroup[];
  onDelete: () => void;
  onMove: (toGroupId: string) => void;
  onDragStart?: (tabId: string, fromGroupId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const moveRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', tab.id);
    e.dataTransfer.setData('application/x-from-group-id', groupId);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(tab.id, groupId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!showMove) return;
    const handler = (e: MouseEvent) => {
      if (moveRef.current && !moveRef.current.contains(e.target as Node)) {
        setShowMove(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMove]);

  const domainInitial = tab.domain.charAt(0).toUpperCase();
  const hue = tab.domain.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group cursor-grab active:cursor-grabbing ${
        tab.isDuplicate ? 'opacity-60' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className="flex items-center gap-2 w-full"
      >
        <GripVertical size={14} className="opacity-40 shrink-0" />

      <div className="relative shrink-0">
        {tab.favicon ? (
          <img
            src={tab.favicon}
            alt=""
            className="w-4 h-4 rounded-sm"
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-4 h-4 rounded-sm text-[10px] font-bold flex items-center justify-center text-white shrink-0"
          style={{
            background: `hsl(${hue}, 60%, 45%)`,
            display: tab.favicon ? 'none' : 'flex',
          }}
        >
          {domainInitial}
        </div>
      </div>

      <a
        href={tab.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm truncate flex-1 min-w-0 text-zinc-300 hover:text-white transition-colors"
        title={tab.title}
      >
        {tab.title || tab.url}
      </a>

      <div className="flex items-center gap-1 shrink-0">
        {tab.isDuplicate && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300" title="Duplicate tab">
            <Copy size={10} className="inline" />
          </span>
        )}
        {tab.isDead && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300" title="Link may be dead">
            <AlertTriangle size={10} className="inline" />
          </span>
        )}
        <span className="text-[10px] opacity-40 hidden sm:block">{tab.domain}</span>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 relative"
            >
              {otherGroups.length > 0 && (
                <div ref={moveRef} className="relative">
                  <button
                    onClick={() => setShowMove(!showMove)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    title="Move to another group"
                  >
                    <ArrowRightLeft size={12} />
                  </button>
                  {showMove && (
                    <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[160px]">
                      <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">Move to</div>
                      {otherGroups.map(g => (
                        <button
                          key={g.id}
                          onClick={() => { onMove(g.id); setShowMove(false); }}
                          className="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5 transition-colors truncate"
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <a
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Open tab"
              >
                <ExternalLink size={12} />
              </a>
              <button
                onClick={onDelete}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Remove from group"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  </div>
  );
}
