'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CalendarDay } from './CalendarDay';
import { Dream } from '@/types/dream';

interface CalendarGridProps {
  currentMonth: Date;
  dreams: Dream[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  direction: number; // for animation: -1 or 1
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  currentMonth,
  dreams,
  selectedDate,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  direction
}: CalendarGridProps) {
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Previous month days
  const prevMonthDays = getDaysInMonth(year, month - 1);
  const prevDays = Array.from({ length: firstDay }, (_, i) => {
    const d = new Date(year, month - 1, prevMonthDays - firstDay + i + 1);
    return { date: d, isCurrentMonth: false };
  });

  // Current month days
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return { date: d, isCurrentMonth: true };
  });

  // Next month days to fill grid (6 rows of 7 days = 42 cells)
  const remainingCells = 42 - (prevDays.length + currentDays.length);
  const nextDays = Array.from({ length: remainingCells }, (_, i) => {
    const d = new Date(year, month + 1, i + 1);
    return { date: d, isCurrentMonth: false };
  });

  const allDays = [...prevDays, ...currentDays, ...nextDays];

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getDreamsForDate = (date: Date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return dreams.filter((d) => {
      if (typeof d.dream_date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d.dream_date)) {
        return d.dream_date.slice(0, 10) === key;
      }
      const dreamDate = new Date(d.dream_date);
      return (
        dreamDate.getFullYear() === date.getFullYear() &&
        dreamDate.getMonth() === date.getMonth() &&
        dreamDate.getDate() === date.getDate()
      );
    });
  };

  const isSameDay = (d1: Date | null, d2: Date) => {
    if (!d1) return false;
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(today, date);
  };

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  return (
    <div className="w-full bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--border-default)]">
        <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
          {monthName}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onPrevMonth} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="secondary" size="sm" onClick={onNextMonth} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]">
        {WEEKDAYS.map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative overflow-hidden min-h-[480px] md:min-h-[600px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={monthName}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 grid grid-cols-7 grid-rows-6"
          >
            {allDays.map((dayObj, i) => {
              const dayDreams = getDreamsForDate(dayObj.date);
              const moods = dayDreams.map(d => d.mood || 'unknown');

              return (
                <CalendarDay
                  key={i}
                  date={dayObj.date}
                  isCurrentMonth={dayObj.isCurrentMonth}
                  isToday={isToday(dayObj.date)}
                  isSelected={isSameDay(selectedDate, dayObj.date)}
                  dreamsCount={dayDreams.length}
                  moods={moods}
                  onClick={onDateClick}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
