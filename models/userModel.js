import db from "../db/database.js";
import { cryptoNative } from "../utils/cryptoUtil.js";

export const UserModel = {
  findUserByGoogleSub(googleSub) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE google_sub = ?", [googleSub], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve({
          id: row.id,
          googleSub: row.google_sub,
          email: row.email,
          name: row.name,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      });
    });
  },

  findUserById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve({
          id: row.id,
          googleSub: row.google_sub,
          email: row.email,
          name: row.name,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      });
    });
  },

  createUser({ googleSub, email, name, avatarUrl }) {
    return new Promise((resolve, reject) => {
      const id = cryptoNative.randomUUID();
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO users (id, google_sub, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, googleSub, email, name, avatarUrl, now, now],
        function (err) {
          if (err) return reject(err);
          resolve({
            id,
            googleSub,
            email,
            name,
            avatarUrl,
            createdAt: now,
            updatedAt: now,
          });
        }
      );
    });
  },
};
