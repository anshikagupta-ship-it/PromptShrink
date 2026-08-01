import crypto from "crypto";

export const cryptoNative = {
  randomUUID() {
    return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
  },
  randomSessionToken() {
    return crypto.randomBytes(32).toString("hex");
  }
};
