import * as admin from 'firebase-admin';
import serviceAccount from '../config/firebase-service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
