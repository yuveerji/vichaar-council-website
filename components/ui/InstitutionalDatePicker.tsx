"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check
} from "lucide-react";

interface InstitutionalDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  placeholder?: string;
  theme?: "light" | "dark";
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function InstitutionalDatePicker({
  value,
  onChange,
  label,
  required = false,
  minYear = 2003,
  maxYear = new Date().getFullYear(),
  className = "",
  placeholder = "Select Date of Birth",
  theme = "light"
}: InstitutionalDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"quick" | "calendar">("quick"); // default to quick dropdown for DOB ease
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsedDate = value ? new Date(value) : null;
  const initialYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : 2009;
  const initialMonth = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() : 0;
  const initialDay = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getDate() : 1;

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);

  // Update internal states when external value changes
  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setSelectedYear(y);
          setSelectedMonth(m);
          setSelectedDay(d);
          return;
        }
      }
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth());
        setSelectedDay(d.getDate());
      }
    }
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Compute days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInCurrentMonth = getDaysInMonth(selectedYear, selectedMonth);

  // Generate Year options
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Format date to YYYY-MM-DD
  const emitDate = (y: number, m: number, d: number) => {
    const formattedMonth = String(m + 1).padStart(2, "0");
    const formattedDay = String(d).padStart(2, "0");
    const formatted = `${y}-${formattedMonth}-${formattedDay}`;
    onChange(formatted);
  };

  const handleQuickSelect = (year?: number, month?: number, day?: number) => {
    const newYear = year !== undefined ? year : selectedYear;
    const newMonth = month !== undefined ? month : selectedMonth;
    const maxDays = getDaysInMonth(newYear, newMonth);
    let newDay = day !== undefined ? day : selectedDay;
    if (newDay > maxDays) newDay = maxDays;

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedDay(newDay);
    emitDate(newYear, newMonth, newDay);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      const newYear = selectedYear - 1;
      setSelectedYear(newYear);
      setSelectedMonth(11);
      emitDate(newYear, 11, Math.min(selectedDay, getDaysInMonth(newYear, 11)));
    } else {
      const newMonth = selectedMonth - 1;
      setSelectedMonth(newMonth);
      emitDate(selectedYear, newMonth, Math.min(selectedDay, getDaysInMonth(selectedYear, newMonth)));
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      const newYear = selectedYear + 1;
      setSelectedYear(newYear);
      setSelectedMonth(0);
      emitDate(newYear, 0, Math.min(selectedDay, getDaysInMonth(newYear, 0)));
    } else {
      const newMonth = selectedMonth + 1;
      setSelectedMonth(newMonth);
      emitDate(selectedYear, newMonth, Math.min(selectedDay, getDaysInMonth(selectedYear, newMonth)));
    }
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    emitDate(selectedYear, selectedMonth, day);
    setIsOpen(false);
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  const calendarCells: (number | null)[] = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarCells.push(d);
  }

  // Format readable display
  const readableDisplay = value
    ? (() => {
        const parts = value.split("-");
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          return `${d} ${MONTH_NAMES[m]} ${y}`;
        }
        return value;
      })()
    : "";

  const isDark = theme === "dark";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          className={`block text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between ${
            isDark ? "text-warmwhite/80" : "text-charcoal"
          }`}
        >
          <span>
            {label} {required && <span className={isDark ? "text-citrus" : "text-crimson"}>*</span>}
          </span>
          {value && (
            <span
              className={`text-[10.5px] font-mono font-semibold ${
                isDark ? "text-citrus" : "text-navy"
              }`}
            >
              {readableDisplay}
            </span>
          )}
        </label>
      )}

      {/* Input Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm border rounded-xl cursor-pointer transition-all flex items-center justify-between select-none ${
          isDark
            ? isOpen
              ? "bg-[#0A1322] border-citrus ring-1 ring-citrus/40 text-white shadow-lg"
              : "bg-[#080E1A] border-white/15 hover:border-white/30 text-white"
            : isOpen
            ? "border-navy ring-1 ring-navy bg-white shadow-xs text-charcoal"
            : "border-charcoal/20 hover:border-charcoal/40 bg-warmwhite hover:bg-white text-charcoal"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-citrus shrink-0" />
          {value ? (
            <span className={`font-semibold truncate ${isDark ? "text-white" : "text-charcoal"}`}>
              {readableDisplay}
            </span>
          ) : (
            <span className={isDark ? "text-white/35" : "text-charcoal/45"}>{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className={`p-1 transition-colors rounded-full ${
                isDark ? "text-warmwhite/40 hover:text-red-400" : "text-charcoal/50 hover:text-crimson"
              }`}
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-citrus" : isDark ? "text-warmwhite/40" : "text-charcoal/50"
            }`}
          />
        </div>
      </div>

      {/* Popover Calendar Container */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 mt-2 w-full sm:w-[340px] rounded-2xl shadow-2xl overflow-hidden font-sans animate-fadeIn border ${
            isDark
              ? "bg-[#0C1728] border-white/20 text-warmwhite ring-1 ring-black/50"
              : "bg-white border-charcoal/20 text-charcoal"
          }`}
        >
          {/* Header Mode Switcher */}
          <div
            className={`p-3 flex items-center justify-between border-b ${
              isDark
                ? "bg-[#091220] border-white/10 text-warmwhite"
                : "bg-navy text-warmwhite border-citrus/30"
            }`}
          >
            <span className="text-[10px] sm:text-[10.5px] font-bold tracking-widest uppercase text-citrus flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Select Date of Birth</span>
            </span>
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded text-[10px]">
              <button
                type="button"
                onClick={() => setViewMode("quick")}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  viewMode === "quick"
                    ? "bg-citrus text-navy shadow-xs font-bold"
                    : "text-warmwhite/70 hover:text-white"
                }`}
              >
                Quick Jump
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  viewMode === "calendar"
                    ? "bg-citrus text-navy shadow-xs font-bold"
                    : "text-warmwhite/70 hover:text-white"
                }`}
              >
                Calendar
              </button>
            </div>
          </div>

          {/* Quick Select Mode: Day, Month, Year Dropdowns */}
          {viewMode === "quick" && (
            <div className={`p-4 space-y-4 ${isDark ? "bg-[#0C1728]" : "bg-warmwhite/50"}`}>
              <p
                className={`text-[11px] leading-tight ${
                  isDark ? "text-warmwhite/60" : "text-charcoal/60"
                }`}
              >
                Pick Day, Month, and Year (optimized for rapid student accreditation):
              </p>

              <div className="grid grid-cols-3 gap-2">
                {/* Day */}
                <div>
                  <span
                    className={`block text-[10px] font-bold uppercase mb-1 ${
                      isDark ? "text-warmwhite/60" : "text-charcoal/60"
                    }`}
                  >
                    Day
                  </span>
                  <select
                    value={selectedDay}
                    onChange={(e) => handleQuickSelect(undefined, undefined, parseInt(e.target.value, 10))}
                    className={`w-full p-2 text-xs border rounded-lg font-bold focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#070E1A] border-white/15 text-white focus:border-citrus"
                        : "bg-white border-charcoal/20 text-navy focus:border-navy"
                    }`}
                  >
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className={isDark ? "bg-[#070E1A] text-white" : ""}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month */}
                <div>
                  <span
                    className={`block text-[10px] font-bold uppercase mb-1 ${
                      isDark ? "text-warmwhite/60" : "text-charcoal/60"
                    }`}
                  >
                    Month
                  </span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleQuickSelect(undefined, parseInt(e.target.value, 10), undefined)}
                    className={`w-full p-2 text-xs border rounded-lg font-bold focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#070E1A] border-white/15 text-white focus:border-citrus"
                        : "bg-white border-charcoal/20 text-navy focus:border-navy"
                    }`}
                  >
                    {SHORT_MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx} className={isDark ? "bg-[#070E1A] text-white" : ""}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <span
                    className={`block text-[10px] font-bold uppercase mb-1 ${
                      isDark ? "text-warmwhite/60" : "text-charcoal/60"
                    }`}
                  >
                    Year
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleQuickSelect(parseInt(e.target.value, 10), undefined, undefined)}
                    className={`w-full p-2 text-xs border rounded-lg font-bold focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#070E1A] border-white/15 text-white focus:border-citrus"
                        : "bg-white border-charcoal/20 text-navy focus:border-navy"
                    }`}
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className={isDark ? "bg-[#070E1A] text-white" : ""}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fast Suggested Year Pills for Classes 7-12 */}
              <div>
                <span
                  className={`block text-[10px] font-bold uppercase mb-1.5 ${
                    isDark ? "text-warmwhite/60" : "text-charcoal/60"
                  }`}
                >
                  Suggested Birth Years for Classes 7–12:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[2008, 2009, 2010, 2011, 2012, 2013].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleQuickSelect(yr, undefined, undefined)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                        selectedYear === yr
                          ? isDark
                            ? "bg-citrus text-navy border-citrus font-bold"
                            : "bg-navy text-citrus border-navy font-bold"
                          : isDark
                          ? "bg-white/5 border-white/15 text-warmwhite/80 hover:border-citrus/50 hover:text-white"
                          : "bg-white border-charcoal/20 text-charcoal/70 hover:border-navy"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <div
                className={`pt-2.5 border-t flex items-center justify-between ${
                  isDark ? "border-white/10" : "border-charcoal/10"
                }`}
              >
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isDark ? "text-citrus" : "text-navy"
                  }`}
                >
                  {selectedDay} {SHORT_MONTH_NAMES[selectedMonth]} {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ${
                    isDark
                      ? "bg-citrus hover:bg-citrus/90 text-navy"
                      : "bg-navy hover:bg-slate text-warmwhite"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isDark ? "text-navy" : "text-citrus"}`} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

          {/* Visual Calendar Grid Mode */}
          {viewMode === "calendar" && (
            <div className={`p-3.5 space-y-3 ${isDark ? "bg-[#0C1728]" : "bg-white"}`}>
              {/* Month / Year Navigator */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className={`p-1 rounded transition-colors ${
                    isDark ? "hover:bg-white/10 text-white" : "hover:bg-charcoal/5 text-charcoal"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className={`p-1 text-xs font-bold bg-transparent cursor-pointer focus:outline-none ${
                      isDark ? "text-citrus" : "text-navy"
                    }`}
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={m} value={idx} className={isDark ? "bg-[#070E1A] text-white" : ""}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className={`p-1 text-xs font-bold bg-transparent cursor-pointer focus:outline-none ${
                      isDark ? "text-citrus" : "text-navy"
                    }`}
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className={isDark ? "bg-[#070E1A] text-white" : ""}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className={`p-1 rounded transition-colors ${
                    isDark ? "hover:bg-white/10 text-white" : "hover:bg-charcoal/5 text-charcoal"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Headers */}
              <div
                className={`grid grid-cols-7 gap-1 text-center font-bold text-[10px] uppercase ${
                  isDark ? "text-warmwhite/40" : "text-charcoal/50"
                }`}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Day Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarCells.map((cell, idx) => {
                  if (cell === null) {
                    return <div key={`empty-${idx}`} className="h-8" />;
                  }

                  const isSelected =
                    value &&
                    selectedYear === parsedDate?.getFullYear() &&
                    selectedMonth === parsedDate?.getMonth() &&
                    cell === parsedDate?.getDate();

                  const isCurrentDay = cell === selectedDay;

                  return (
                    <button
                      key={`day-${cell}`}
                      type="button"
                      onClick={() => handleDayClick(cell)}
                      className={`h-8 rounded-lg flex items-center justify-center font-semibold transition-all ${
                        isSelected
                          ? isDark
                            ? "bg-citrus text-navy font-bold shadow-md scale-105"
                            : "bg-navy text-citrus font-bold shadow-xs scale-105"
                          : isCurrentDay
                          ? isDark
                            ? "bg-citrus/20 text-citrus font-bold border border-citrus/50"
                            : "bg-citrus/20 text-navy font-bold border border-citrus"
                          : isDark
                          ? "hover:bg-white/10 text-warmwhite"
                          : "hover:bg-charcoal/10 text-charcoal"
                      }`}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>

              <div
                className={`pt-2 border-t flex justify-between items-center text-[10.5px] ${
                  isDark ? "border-white/10" : "border-charcoal/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear(2009);
                    setSelectedMonth(0);
                    setSelectedDay(1);
                    emitDate(2009, 0, 1);
                  }}
                  className={`${
                    isDark ? "text-citrus hover:text-citrus/80" : "text-citrus-dark hover:underline"
                  } font-semibold`}
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold ${
                    isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-navy text-warmwhite"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
