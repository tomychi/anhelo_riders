import { projectAuth } from '../firebase/config';

let error;

const login = async (email, password) => {
  error = null;

  try {
    const res = await projectAuth.signInWithEmailAndPassword(email, password);
    error = null;

    return res;
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'message' in err) {
      error = err.message;
    } else {
      error = 'Error desconocido';
    }

    console.log(error);
  }
};

const userLogin = () => {
  return { error, login };
};

export default userLogin;
