// MongoDB connection was migrated to `src/legacy_mongoose/config/db.js`.
// This stub keeps the API but avoids attempting to connect by default.
export const conexionDB = async () => {
	console.log('conexionDB: MongoDB legacy moved to src/legacy_mongoose/config/db.js — no action taken.')
	return null
}
