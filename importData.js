import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// 1. Cargar el JSON (que replica la estructura de Firestore)
const data = JSON.parse(fs.readFileSync('./exercises.json', 'utf-8'));
const exercises = data.exercises; // Objeto con { doc1: { ... }, doc2: { ... } }

// 2. Configuración Firebase
const serviceAccount = JSON.parse(fs.readFileSync('./src/firebase/serviceAccount.json', 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://proyecto-fit-plus-ultra.firebaseio.com"
});

const db = getFirestore();

async function importData() {
  const batch = db.batch();
  const collectionRef = db.collection('exercises');

  // Iterar sobre las claves del objeto (doc1, doc2...)
  Object.keys(exercises).forEach((docId) => {
    const docRef = collectionRef.doc(docId); // Usar el ID original (doc1, doc2...)
    batch.set(docRef, exercises[docId]); // Subir el documento completo
  });

  await batch.commit();
  console.log(`¡${Object.keys(exercises).length} ejercicios importados con sus IDs originales!`);
}

importData().catch(console.error);