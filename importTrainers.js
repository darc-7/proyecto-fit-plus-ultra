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

    // === Cargar Entrenadores (RBAC) ===
  const trainersData = JSON.parse(fs.readFileSync('./trainers.json', 'utf-8'));
  const trainers = trainersData.users;
  const trainersRef = db.collection('users');

  Object.keys(trainers).forEach((docId) => {
    const docRef = trainersRef.doc(docId);
    batch.set(docRef, trainers[docId]);
  });

  console.log(`👥 Preparados ${Object.keys(trainers).length} entrenadores para importación.`);

  // === Ejecutar importación ===
  await batch.commit();
  console.log('✅ Importación completada con éxito.');
}

importData().catch(console.error);