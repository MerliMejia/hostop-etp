import { addDays, format, isValid, parseISO } from "date-fns";
import type { DateRange } from "./types";

const dateFormat = "yyyy-MM-dd";

export function normalizeDateRange(
  start?: string | string[],
  end?: string | string[],
) {
  const startValue = Array.isArray(start) ? start[0] : start;
  const endValue = Array.isArray(end) ? end[0] : end;
  const startDate = startValue ? parseISO(startValue) : null;
  const endDate = endValue ? parseISO(endValue) : null;

  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return {};
  }

  if (startDate > endDate) {
    return {};
  }

  return {
    start: format(startDate, dateFormat),
    end: format(endDate, dateFormat),
  };
}

export function halfOpenCreatedAtRange(range: DateRange) {
  if (!range.start || !range.end) {
    return null;
  }

  return {
    gte: parseISO(range.start).toISOString(),
    lt: addDays(parseISO(range.end), 1).toISOString(),
  };
}

export function daysInInclusiveRange(range: DateRange) {
  if (!range.start || !range.end) {
    return 0;
  }

  const start = parseISO(range.start);
  const exclusiveEnd = addDays(parseISO(range.end), 1);

  return Math.max(
    1,
    Math.ceil((exclusiveEnd.getTime() - start.getTime()) / 86_400_000),
  );
}
