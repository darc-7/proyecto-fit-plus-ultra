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

    // === Cargar Administrador (RBAC) ===
  const adminData = JSON.parse(fs.readFileSync('./admin.json', 'utf-8'));
  const admins = adminData.users;
  const adminsRef = db.collection('users');

  Object.keys(admins).forEach((docId) => {
    const docRef = adminsRef.doc(docId);
    batch.set(docRef, admins[docId]);
  });

  console.log(`👥 Preparados ${Object.keys(admins).length} administradores para importación.`);

  // === Ejecutar importación ===
  await batch.commit();
  console.log('✅ Importación completada con éxito.');
}

importData().catch(console.error);