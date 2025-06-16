import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// ✅ Cargar credenciales
const serviceAccount = JSON.parse(fs.readFileSync('./src/firebase/serviceAccount.json', 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://proyecto-fit-plus-ultra.firebaseio.com"
});

const db = getFirestore();

async function importData() {
  const batch = db.batch();

  // === Cargar ejercicios ===
  const exerciseData = JSON.parse(fs.readFileSync('./exercises.json', 'utf-8'));
  const exercises = exerciseData.exercises;
  const exercisesRef = db.collection('exercises');

  Object.keys(exercises).forEach((docId) => {
    const docRef = exercisesRef.doc(docId);
    batch.set(docRef, exercises[docId]);
  });

  console.log(`🗂️ Preparados ${Object.keys(exercises).length} ejercicios para importación.`);

  // === Cargar recompensas ===
  const rewardData = JSON.parse(fs.readFileSync('./rewards.json', 'utf-8'));
  const rewards = rewardData.rewards;
  const rewardsRef = db.collection('rewards');

  let rewardCount = 0;

  ['visuales', 'fisicas'].forEach((categoria) => {
    const grupo = rewards[categoria];
    Object.keys(grupo).forEach((docId) => {
      const docRef = rewardsRef.doc(docId);
      batch.set(docRef, grupo[docId]);
      rewardCount++;
    });
  });

  console.log(`🛍️ Preparadas ${rewardCount} recompensas para importación.`);

  // === Ejecutar importación ===
  await batch.commit();
  console.log('✅ Importación completada con éxito.');
}

importData().catch(console.error);