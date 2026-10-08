import crypto from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import {
  findAccountByEmail,
  createLearnerAccount,
  createTrainerAccount,
  updateLastLogin,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  findAccountById
} from '../repositories/auth.repository.js';

function createAccessToken(account) {
  return jwt.sign(
    {
      sub: account.id,
      accountType: account.account_type,
      email: account.email
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    }
  );
}

function createRefreshTokenValue(account) {
  return jwt.sign(
    {
      sub: account.id,
      accountType: account.account_type
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
}

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

function getRefreshExpirationDate() {
  const days = 7;
  const date = new Date();

  date.setDate(date.getDate() + days);

  return date;
}

function sanitizeAccount(account) {
  const {
    password_hash,
    ...safeAccount
  } = account;

  return safeAccount;
}

export async function registerLearner(data) {
  const existingAccount = await findAccountByEmail(data.email);

  if (existingAccount) {
    const error = new Error(
      'Cette adresse e-mail est déjà utilisée'
    );

    error.status = 409;
    error.code = 'EMAIL_ALREADY_USED';

    throw error;
  }

  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id
  });

  const account = await createLearnerAccount({
    ...data,
    password_hash: passwordHash
  });

  return sanitizeAccount(account);
}

export async function registerTrainer(data) {
  const existingAccount = await findAccountByEmail(data.email);

  if (existingAccount) {
    const error = new Error(
      'Cette adresse e-mail est déjà utilisée'
    );

    error.status = 409;
    error.code = 'EMAIL_ALREADY_USED';

    throw error;
  }

  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id
  });

  const account = await createTrainerAccount({
    ...data,
    password_hash: passwordHash
  });

  return sanitizeAccount(account);
}

export async function login(email, password) {
  const account = await findAccountByEmail(email);

  if (!account || !account.password_hash) {
    const error = new Error('E-mail ou mot de passe incorrect');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const passwordIsValid = await argon2.verify(
    account.password_hash,
    password
  );

  if (!passwordIsValid) {
    const error = new Error('E-mail ou mot de passe incorrect');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (account.status !== 'active') {
    const error = new Error('Ce compte est désactivé');
    error.status = 403;
    error.code = 'ACCOUNT_INACTIVE';
    throw error;
  }

  await updateLastLogin(
    account.account_type,
    account.id
  );

  const accessToken = createAccessToken(account);
  const refreshToken = createRefreshTokenValue(account);

  await createRefreshToken({
    token_hash: hashToken(refreshToken),
    account_type: account.account_type,
    account_id: account.id,
    expires_at: getRefreshExpirationDate()
  });

  return {
    account: sanitizeAccount(account),
    accessToken,
    refreshToken
  };
}

export async function refresh(refreshTokenValue) {
  let payload;

  try {
    payload = jwt.verify(
      refreshTokenValue,
      process.env.JWT_REFRESH_SECRET
    );
  } catch {
    const error = new Error('Refresh token invalide ou expiré');
    error.status = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  const storedToken = await findRefreshToken(
    hashToken(refreshTokenValue)
  );

  if (!storedToken) {
    const error = new Error('Refresh token révoqué ou introuvable');
    error.status = 401;
    error.code = 'REFRESH_TOKEN_NOT_FOUND';
    throw error;
  }

  await revokeRefreshToken(storedToken.id);

  const account = {
    id: payload.sub,
    account_type: payload.accountType
  };

  const newAccessToken = createAccessToken(account);
  const newRefreshToken = createRefreshTokenValue(account);

  await createRefreshToken({
    token_hash: hashToken(newRefreshToken),
    account_type: account.account_type,
    account_id: account.id,
    expires_at: getRefreshExpirationDate()
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

export async function logout(refreshTokenValue) {
  if (!refreshTokenValue) {
    return;
  }

  const storedToken = await findRefreshToken(
    hashToken(refreshTokenValue)
  );

  if (storedToken) {
    await revokeRefreshToken(storedToken.id);
  }
}



export async function getCurrentAccount(accountType, accountId) {
  const account = await findAccountById(
    accountType,
    accountId
  );

  if (!account) {
    const error = new Error('Compte introuvable');
    error.status = 404;
    error.code = 'ACCOUNT_NOT_FOUND';
    throw error;
  }

  return account;
}