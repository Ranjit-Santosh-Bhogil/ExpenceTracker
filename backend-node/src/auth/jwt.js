import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function createAccessToken(userId) {
  const expiresIn = config.accessTokenExpireMinutes * 60;
  return jwt.sign({ sub: String(userId) }, config.secretKey, {
    algorithm: config.jwtAlgorithm,
    expiresIn,
  });
}

export function decodeAccessToken(token) {
  return jwt.verify(token, config.secretKey, {
    algorithms: [config.jwtAlgorithm],
  });
}
