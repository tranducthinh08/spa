export type DashboardPeriod = "TODAY" | "WEEK" | "MONTH" | "THIS_MONTH" | "ALL";

export interface PeriodDateRanges {
  start?: Date;
  end?: Date;
  priorStart?: Date;
  priorEnd?: Date;
  periodLabel: string;
  priorLabel: string;
  isAll: boolean;
}

export function getPeriodDateRanges(period: DashboardPeriod): PeriodDateRanges {
  const now = new Date();
  const vnFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = vnFormatter.format(now);
  const startOfToday = new Date(`${todayStr}T00:00:00+07:00`);
  const endOfToday = new Date(`${todayStr}T23:59:59.999+07:00`);

  if (period === "TODAY") {
    const yesterdayDate = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = vnFormatter.format(yesterdayDate);
    return {
      start: startOfToday,
      end: endOfToday,
      priorStart: new Date(`${yesterdayStr}T00:00:00+07:00`),
      priorEnd: new Date(`${yesterdayStr}T23:59:59.999+07:00`),
      periodLabel: "Hôm nay",
      priorLabel: "so với hôm qua",
      isAll: false,
    };
  }

  if (period === "WEEK") {
    const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(startOfToday.getTime() - 13 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoEnd = new Date(sevenDaysAgo.getTime() - 1);
    return {
      start: sevenDaysAgo,
      end: endOfToday,
      priorStart: fourteenDaysAgo,
      priorEnd: sevenDaysAgoEnd,
      periodLabel: "7 ngày qua",
      priorLabel: "so với 7 ngày trước",
      isAll: false,
    };
  }

  if (period === "MONTH") {
    const thirtyDaysAgo = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(startOfToday.getTime() - 59 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoEnd = new Date(thirtyDaysAgo.getTime() - 1);
    return {
      start: thirtyDaysAgo,
      end: endOfToday,
      priorStart: sixtyDaysAgo,
      priorEnd: thirtyDaysAgoEnd,
      periodLabel: "30 ngày qua",
      priorLabel: "so với 30 ngày trước",
      isAll: false,
    };
  }

  if (period === "THIS_MONTH") {
    const [year, month] = todayStr.split("-").map(Number);
    const startOfMonth = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00+07:00`);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const startOfPrevMonth = new Date(`${prevYear}-${String(prevMonth).padStart(2, "0")}-01T00:00:00+07:00`);
    const endOfPrevMonth = new Date(startOfMonth.getTime() - 1);

    return {
      start: startOfMonth,
      end: endOfToday,
      priorStart: startOfPrevMonth,
      priorEnd: endOfPrevMonth,
      periodLabel: `Tháng ${month}/${year}`,
      priorLabel: `so với tháng ${prevMonth}`,
      isAll: false,
    };
  }

  return {
    start: undefined,
    end: undefined,
    priorStart: undefined,
    priorEnd: undefined,
    periodLabel: "Toàn bộ chuỗi",
    priorLabel: "toàn thời gian",
    isAll: true,
  };
}

export function generateDailyBuckets(
  start?: Date,
  end?: Date
): Array<{ dateStr: string; label: string }> {
  if (!start || !end) return [];
  const buckets: Array<{ dateStr: string; label: string }> = [];
  const vnFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dayMonthFormatter = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
  });

  const curr = new Date(start.getTime());
  while (curr.getTime() <= end.getTime()) {
    const dateStr = vnFormatter.format(curr);
    const label = dayMonthFormatter.format(curr);
    buckets.push({ dateStr, label });
    curr.setDate(curr.getDate() + 1);
  }
  return buckets;
}
