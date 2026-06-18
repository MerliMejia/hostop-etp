import {
  addDays,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
} from "date-fns";
import type { DateRange } from "./types";

const dateFormat = "yyyy-MM-dd";

export function defaultDateRange(now = new Date()): DateRange {
  return {
    start: format(startOfMonth(now), dateFormat),
    end: format(endOfMonth(now), dateFormat),
  };
}

export function normalizeDateRange(
  start?: string | string[],
  end?: string | string[],
) {
  const fallback = defaultDateRange();
  const startValue = Array.isArray(start) ? start[0] : start;
  const endValue = Array.isArray(end) ? end[0] : end;
  const startDate = startValue ? parseISO(startValue) : null;
  const endDate = endValue ? parseISO(endValue) : null;

  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return fallback;
  }

  if (startDate > endDate) {
    return fallback;
  }

  return {
    start: format(startDate, dateFormat),
    end: format(endDate, dateFormat),
  };
}

export function halfOpenCreatedAtRange(range: DateRange) {
  return {
    gte: parseISO(range.start).toISOString(),
    lt: addDays(parseISO(range.end), 1).toISOString(),
  };
}

export function daysInInclusiveRange(range: DateRange) {
  const start = parseISO(range.start);
  const exclusiveEnd = addDays(parseISO(range.end), 1);

  return Math.max(
    1,
    Math.ceil((exclusiveEnd.getTime() - start.getTime()) / 86_400_000),
  );
}
