import {
  updateLearnerProfile,
  updateTrainerProfile
} from '../repositories/profile.repository.js';

export async function updateProfile(
  accountType,
  accountId,
  data
) {
  const account =
    accountType === 'trainer'
      ? await updateTrainerProfile(accountId, data)
      : await updateLearnerProfile(accountId, data);

  if (!account) {
    const error = new Error('Compte introuvable');
    error.status = 404;
    error.code = 'ACCOUNT_NOT_FOUND';
    throw error;
  }

  return account;
}