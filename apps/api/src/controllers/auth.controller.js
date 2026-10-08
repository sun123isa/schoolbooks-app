import * as authService from '../services/auth.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth'
};

function sendAuthenticationResponse(res, result) {
  res.cookie(
    'refreshToken',
    result.refreshToken,
    refreshCookieOptions
  );

  res.json({
    success: true,
    data: {
      account: result.account,
      accessToken: result.accessToken
    }
  });
}

export async function registerLearnerController(
  req,
  res,
  next
) {
  try {
    const account = await authService.registerLearner(req.body);

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
}

export async function registerTrainerController(
  req,
  res,
  next
) {
  try {
    const account = await authService.registerTrainer(req.body);

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const result = await authService.login(
      req.body.email,
      req.body.password
    );

    sendAuthenticationResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function refreshController(req, res, next) {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    if (!refreshToken) {
      const error = new Error('Refresh token absent');
      error.status = 401;
      error.code = 'REFRESH_TOKEN_MISSING';
      throw error;
    }

    const result = await authService.refresh(refreshToken);

    res.cookie(
      'refreshToken',
      result.refreshToken,
      refreshCookieOptions
    );

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutController(req, res, next) {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie('refreshToken', {
      ...refreshCookieOptions,
      maxAge: undefined
    });

    res.json({
      success: true,
      data: {
        message: 'Déconnexion réussie'
      }
    });
  } catch (error) {
    next(error);
  }
}




export async function meController(req, res, next) {
  try {
    const account = await authService.getCurrentAccount(
      req.auth.accountType,
      req.auth.userId
    );

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
}