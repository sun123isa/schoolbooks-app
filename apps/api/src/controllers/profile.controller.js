import * as profileService from '../services/profile.service.js';

export async function updateProfileController(
  req,
  res,
  next
) {
  try {
    const account = await profileService.updateProfile(
      req.auth.accountType,
      req.auth.userId,
      req.body
    );

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
}