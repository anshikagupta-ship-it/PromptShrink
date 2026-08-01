import db from "../db/database.js";
import { cryptoNative } from "../utils/cryptoUtil.js";

export const SessionModel = {
  createSession(userId, durationDays = 7) {
    return new Promise((resolve, reject) => {
      const sessionId = cryptoNative.randomSessionToken();
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
      const createdAt = new Date().toISOString();

      db.run(
        `INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
        [sessionId, userId, expiresAt, createdAt],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: sessionId,
            userId,
            expiresAt,
            createdAt,
          });
        }
      );
    });
  },

  findSessionById(sessionId) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM sessions WHERE id = ?", [sessionId], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        // Check if session has expired
        if (new Date(row.expires_at) < new Date()) {
          this.deleteSession(sessionId);
          return resolve(null);
        }

        resolve({
          id: row.id,
          userId: row.user_id,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
        });
      });
    });
  },

  deleteSession(sessionId) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM sessions WHERE id = ?", [sessionId], function (err) {
        if (err) return reject(err);
        resolve(true);
      });
    });
  },
};
