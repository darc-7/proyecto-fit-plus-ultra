export function checkAchieve(userData) {
  const newBadges = [];

  const { streak = 0, totalPoints = 0, completedRoutines = 0, unlockedRewards = [], badges = [] } = userData;

  const logros = [
    { cond: streak >= 3, nombre: "Racha de 3 días" },
    { cond: streak >= 7, nombre: "Racha de 7 días" },
    { cond: streak >= 14, nombre: "Racha de 14 días" },
    { cond: totalPoints >= 500, nombre: "500 puntos" },
    { cond: totalPoints >= 1000, nombre: "1000 puntos" },
    { cond: totalPoints >= 2000, nombre: "2000 puntos" },
    { cond: completedRoutines >= 5, nombre: "5 rutinas" },
    { cond: completedRoutines >= 10, nombre: "10 rutinas" },
    { cond: unlockedRewards.length >= 1, nombre: "Primera recompensa" },
    { cond: unlockedRewards.length >= 5, nombre: "5 recompensas" },
  ];

  for (const logro of logros) {
    if (logro.cond && !badges.includes(logro.nombre)) {
      newBadges.push(logro.nombre);
    }
  }

  return newBadges;
}