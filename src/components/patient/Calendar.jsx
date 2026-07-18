import { useState } from "react";
import { toDateKey } from "../../utils/date.js";

const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function startOfDay(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function buildGrid(viewYear, viewMonth) {
  const first = new Date(viewYear, viewMonth, 1);
  const offset = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false, date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, date: new Date(viewYear, viewMonth, d) });
  }
  const remainder = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainder; d++) {
    cells.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth + 1, d) });
  }
  return cells;
}

export default function Calendar({ selectedDate, onSelect }) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

  const cells = buildGrid(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div>
      <div className="cal-head">
        <b>
          {MOIS_LONG[viewMonth].charAt(0).toUpperCase() + MOIS_LONG[viewMonth].slice(1)} {viewYear}
        </b>
        <div className="cal-nav">
          <button type="button" onClick={prevMonth} aria-label="Mois précédent">
            ‹
          </button>
          <button type="button" onClick={nextMonth} aria-label="Mois suivant">
            ›
          </button>
        </div>
      </div>
      <div className="cal">
        {DOW.map((d) => (
          <div className="dow" key={d}>
            {d}
          </div>
        ))}
        {cells.map((cell) => {
          const isPast = startOfDay(cell.date) < today;
          const disabled = !cell.inMonth || isPast;
          const isSelected = selectedDate && toDateKey(cell.date) === toDateKey(selectedDate);
          const isToday = toDateKey(cell.date) === toDateKey(today);

          const classes = ["day"];
          if (disabled) classes.push("off");
          if (isSelected) classes.push("sel");
          if (isToday && !isSelected) classes.push("today");

          return (
            <div
              key={cell.date.toISOString()}
              className={classes.join(" ")}
              style={{ cursor: disabled ? "default" : "pointer" }}
              onClick={() => !disabled && onSelect(cell.date)}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
