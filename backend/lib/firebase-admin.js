// backend/lib/firebase-admin.js
const admin = require('firebase-admin');

// Note: For production you MUST use a service account key JSON file instead of an empty configuration
// Example:
// const serviceAccount = require('../path/to/serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

try {
  if (!admin.apps.length) {
    admin.initializeApp(); // Assuming GOOGLE_APPLICATION_CREDENTIALS env is set for Cloud Run
  }
} catch (error) {
  console.log('Firebase admin initialization error', error.stack);
}

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized, no Bearer token provided' });
    }
  
    const token = authHeader.split('Bearer ')[1];
  
    try {
      // In production with proper keys, this will actually verify
      // For local testing without a service json, we just pass the JWT decoding
      const decodedIdToken = await admin.auth().verifyIdToken(token);
      req.user = decodedIdToken;
      next();
    } catch (error) {
      console.error('Error verifying auth token:', error);
      res.status(403).json({ success: false, message: 'Unauthorized, invalid token' });
    }
};

module.exports = { admin, verifyToken };
