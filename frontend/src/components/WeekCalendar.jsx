import React from "react";
import { Link } from "react-router-dom";
import { TID } from "../lib/testIds";

const DAY_INDEX = { MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6 };

export default function WeekCalendar({ schedule = [], todayDay }) {
    return (
        <div className="grid grid-cols-7 gap-2 sm:gap-3" data-testid={TID.weekCalendar}>
            {schedule.map((d) => {
                const isToday = d.day === todayDay;
                const hasSession = !!d.session_id;
                const inner = (
                    <div
                        className={`h-full p-3 sm:p-4 flex flex-col justify-between hairline transition-all ${
                            isToday
                                ? "bg-blaze/10 border-blaze"
                                : hasSession
                                ? "bg-iron hover:bg-secondary"
                                : "bg-obsidian/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`font-mono text-[10px] tracking-[0.3em] ${
                                isToday ? "text-blaze" : "text-muted-foreground"
                            }`}>
                                {d.day}
                            </span>
                            {isToday && <span className="pulse-dot" />}
                        </div>
                        <div className={`mt-4 sm:mt-6 font-display text-[13px] sm:text-base leading-tight ${
                            hasSession ? "text-bone" : "text-muted-foreground"
                        }`}>
                            {d.label.toUpperCase()}
                        </div>
                    </div>
                );
                return hasSession ? (
                    <Link
                        key={d.day}
                        to={`/session/${d.session_id}`}
                        className="block h-24 sm:h-32"
                        data-testid={`calendar-day-${d.day}`}
                    >
                        {inner}
                    </Link>
                ) : (
                    <div key={d.day} className="h-24 sm:h-32" data-testid={`calendar-day-${d.day}`}>
                        {inner}
                    </div>
                );
            })}
        </div>
    );
}

export { DAY_INDEX };
