import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Función para obtener el nombre del usuario por UID
export const fetchUserNameByUid = async (uid) => {
  const firestore = getFirestore();
  const userDocRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data().name; // Asegúrate de que el campo del nombre se llama 'name'
  } else {
    console.error('No se encontró el usuario');
    return null;
  }
};
