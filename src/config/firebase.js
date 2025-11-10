import admin from 'firebase-admin'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Inicialización robusta de Firebase Admin para verificación de ID tokens
// Prioriza credenciales de servicio por variable de entorno (JSON o Base64),
// luego GOOGLE_APPLICATION_CREDENTIALS (Application Default Credentials).
// Siempre fija projectId para evitar "Unable to detect a Project Id".

let credential
let resolvedProjectId = process.env.FIREBASE_PROJECT_ID
let firebaseApp

try {
	// 1) Servicio por JSON plano en env
	if (process.env.FIREBASE_SERVICE_ACCOUNT) {
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
		credential = admin.credential.cert(serviceAccount)
		resolvedProjectId = resolvedProjectId || serviceAccount.project_id
	} else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
		// 2) Servicio por JSON Base64 en env
		const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
		const serviceAccount = JSON.parse(decoded)
		credential = admin.credential.cert(serviceAccount)
		resolvedProjectId = resolvedProjectId || serviceAccount.project_id
	} else {
		// 3) Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS)
		credential = admin.credential.applicationDefault()
	}

	firebaseApp = admin.initializeApp({
		credential,
		projectId: resolvedProjectId || 'clinica-app-e7b52',
		// storageBucket es opcional para verificación de tokens, pero lo incluimos si existe
		storageBucket:
			process.env.FIREBASE_STORAGE_BUCKET || 'clinica-app-e7b52.appspot.com',
	})

	console.log('[FIREBASE ADMIN] Inicializado con projectId =', resolvedProjectId || 'clinica-app-e7b52')

} catch (err) {
	console.error('[FIREBASE ADMIN] Error de inicialización:', err?.message || err)
	throw err
}

// Log Firebase initialization status
console.log('[FIREBASE] Initialization status:', {
    projectId: resolvedProjectId,
    credentialType: credential ? credential.constructor.name : 'none',
    isInitialized: firebaseApp ? 'yes' : 'no'
});

export default firebaseApp
