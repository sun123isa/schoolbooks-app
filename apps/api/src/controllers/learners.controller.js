import * as learnersService from '../services/learners.service.js';

export async function listLearnersController(req, res, next) {
  try {
    const learners = await learnersService.listLearners();

    res.json({
      success: true,
      data: {
        items: learners,
        count: learners.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getLearnerController(req, res, next) {
  try {
    const learner = await learnersService.getLearnerById(
      req.params.id
    );

    res.json({
      success: true,
      data: learner
    });
  } catch (error) {
    next(error);
  }
}

export async function createLearnerController(req, res, next) {
  try {
    const learner = await learnersService.createLearner(req.body);

    res.status(201).json({
      success: true,
      data: learner
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLearnerController(req, res, next) {
  try {
    const learner = await learnersService.updateLearner(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: learner
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteLearnerController(req, res, next) {
  try {
    const learner = await learnersService.deactivateLearner(
      req.params.id
    );

    res.json({
      success: true,
      data: learner
    });
  } catch (error) {
    next(error);
  }
}