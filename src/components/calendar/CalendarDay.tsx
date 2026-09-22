import React from 'react';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  dreamsCount: number;
  moods: string[];
  onClick: (date: Date) => void;
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  dreamsCount,
  moods,
  onClick,
}: CalendarDayProps) {
  const dayNumber = date.getDate();

  return (
    <div
      onClick={() => onClick(date)}
      className={`
        relative flex flex-col items-center justify-start p-2 min-h-[80px] md:min-h-[100px] border-b border-r border-[var(--border-default)] cursor-pointer transition-colors
        ${!isCurrentMonth ? 'bg-[var(--bg-secondary)] opacity-50' : 'bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)]'}
        ${isSelected ? 'bg-[var(--accent-soft)]' : ''}
      `}
    >
      <div className="w-full flex justify-between items-start">
        <span
          className={`
            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
            ${isToday ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-semibold' : 'text-[var(--text-primary)]'}
            ${!isCurrentMonth && !isToday ? 'text-[var(--text-muted)]' : ''}
          `}
        >
          {dayNumber}
        </span>
        {dreamsCount > 1 && (
          <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded-full">
            {dreamsCount}
          </span>
        )}
      </div>

      <div className="mt-auto w-full flex flex-wrap justify-center gap-1 pb-1">
        {dreamsCount > 0 && (
          <div className="flex gap-1">
            {moods.slice(0, 3).map((mood, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--accent)]"
                title={mood}
              />
            ))}
            {moods.length > 3 && (
              <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
