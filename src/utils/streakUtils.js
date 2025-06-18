export function upStreak(userData, today) {
  const lastDate = userData.lastRoutineCompleted;
  const protectors = userData.streakProtectors || 0;
  const protectedDates = userData.protectedDates || [];
  const streak = userData.streak || 0;

  const dayDiff = getDayDiff(lastDate, today);

  let newStreak = streak;
  let newProtectors = protectors;
  let newProtected = [...protectedDates];

  // Día siguiente → +1 racha
  if (dayDiff === 1) {
    newStreak++;
  }

  // Mismo día → nada
  else if (dayDiff === 0) {
    return {
      lastRoutineCompleted: today,
    };
  }

  // Faltó 1 día → usar protector
  else if (dayDiff === 2 && protectors > 0) {
    newProtectors--;
    newProtected.push(today);
    newStreak++; // mantener racha
  }

  // Faltó más de 1 día → reiniciar racha
  else {
    newStreak = 1;
    newProtected = [];
  }

  // Día 6 → descanso automático mañana
  if (newStreak === 6) {
    newProtected.push(sumarDias(today, 1)); // proteger mañana automáticamente
  }

  // Día 5 → permitir descanso manual (puedes mostrar UI aparte)
  // Si implementas UI, añade la lógica aquí también

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
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d.toLocaleDateString("sv-SE")
}