function hasWeekdayGap(start, end) {
  const d = new Date(start);
  d.setDate(d.getDate() + 1);
  while (d < end) {
    const day = d.getDay();
    if (day >= 1 && day <= 5) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
}

export function upStreak(userData, today) {
  const lastStr = userData.lastRoutineCompleted;
  const streak = userData.streak || 0;

  if (!lastStr) {
    return { lastRoutineCompleted: today, streak: 1 };
  }

  const todayDate = new Date(today + "T12:00:00");
  const lastDate = new Date(lastStr + "T12:00:00");
  const todayDay = todayDate.getDay();
  const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { lastRoutineCompleted: today };
  }

  if (todayDay === 0) {
    return { lastRoutineCompleted: today };
  }

  if (hasWeekdayGap(lastDate, todayDate)) {
    const result = { lastRoutineCompleted: today, streak: 0 };
    if (!userData.streakLostAt) {
      result.lastKnownStreak = streak;
      result.streakLostAt = today;
    }
    return result;
  }

  return { lastRoutineCompleted: today, streak: streak + 1 };
}

export function verifyStreak(userData) {
  const today = new Date().toLocaleDateString("sv-SE");
  const lastDate = userData.lastRoutineCompleted;

  if (!lastDate) return null;

  const todayDate = new Date(today + "T12:00:00");
  const lastDateObj = new Date(lastDate + "T12:00:00");

  if (todayDate.getDay() === 0) return null;

  if (hasWeekdayGap(lastDateObj, todayDate)) {
    const result = { streak: 0 };
    if (!userData.streakLostAt) {
      result.lastKnownStreak = userData.streak || 0;
      result.streakLostAt = today;
    }
    return result;
  }

  return null;
}
