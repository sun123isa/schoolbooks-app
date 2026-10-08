import * as subjectsService from '../services/subjects.service.js';

// GET /api/subjects
export async function listSubjectsController(req, res, next) {
  try {
    const subjects = await subjectsService.listSubjects();

    res.json({
      success: true,
      data: {
        items: subjects,
        count: subjects.length
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/subjects/:id
export async function getSubjectController(req, res, next) {
  try {
    const subject = await subjectsService.getSubjectById(req.params.id);

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/subjects/code/:code
export async function getSubjectByCodeController(req, res, next) {
  try {
    const subject = await subjectsService.getSubjectByCode(
      req.params.code
    );

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
}