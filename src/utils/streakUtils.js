export function upStreak(userData, today) {
  const lastDate = userData.lastRoutineCompleted;
  const protectors = userData.streakProtectors || 0;
  const protectedDates = userData.protectedDates || [];
  const streak = userData.streak || 0;

  const dayDiff = getDayDiff(lastDate, today);

  let newStreak = streak;
  let newProtectors = protectors;
  let newProtected = [...protectedDates];

  if (dayDiff === 1) {
    newStreak++;
  } else if (dayDiff === 0) {
    return {
      lastRoutineCompleted: today,
    };
  } else if (dayDiff === 2 && protectors > 0) {
    newProtectors--;
    newProtected.push(today);
    newStreak++;
  } else {
    newStreak = 1;
    newProtected = [];
  }

  if (newStreak === 6) {
    newProtected.push(sumarDias(today, 1));
  }

  return {
    lastRoutineCompleted: today,
    streak: newStreak,
    streakProtectors: newProtectors,
    protectedDates: newProtected,
  };
}

export function verifyStreak(userData) {
  const today = new Date().toLocaleDateString("sv-SE");
  const lastDate = userData.lastRoutineCompleted;
  const protectedDates = userData.protectedDates || [];

  if (!lastDate) return null;

  const dayDiff = getDayDiff(lastDate, today);

  if (dayDiff > 1 && !protectedDates.includes(today)) {
    return {
      streak: 0,
      protectedDates: [],
    };
  }

  return null;
}

function getDayDiff(date1, date2) {
  const [y1, m1, d1] = date1.split("-").map(Number);
  const [y2, m2, d2] = date2.split("-").map(Number);
  const d1Obj = new Date(y1, m1 - 1, d1);
  const d2Obj = new Date(y2, m2 - 1, d2);
  const diff = (d2Obj - d1Obj) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
}

function sumarDias(fecha, dias) {
  const [y, m, d] = fecha.split("-").map(Number);
  const fechaObj = new Date(y, m - 1, d);
  fechaObj.setDate(fechaObj.getDate() + dias);
  const año = fechaObj.getFullYear();
  const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObj.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}