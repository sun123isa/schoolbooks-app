import * as schoolLevelsService from '../services/levels.service.js';

// GET /api/school-levels
// Retourne la liste des niveaux scolaires.
export async function listSchoolLevelsController(req, res, next) {
  try {
    const schoolLevels = await schoolLevelsService.listSchoolLevels();

    res.json({
      success: true,
      data: {
        items: schoolLevels,
        count: schoolLevels.length
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/school-levels/:id
// Retourne un niveau scolaire par son UUID.
export async function getSchoolLevelController(req, res, next) {
  try {
    const { id } = req.params;

    const schoolLevel = await schoolLevelsService.getSchoolLevelById(id);

    res.json({
      success: true,
      data: schoolLevel
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/school-levels/code/:code
// Retourne un niveau scolaire par son code.
export async function getSchoolLevelByCodeController(req, res, next) {
  try {
    const { code } = req.params;

    const schoolLevel =
      await schoolLevelsService.getSchoolLevelByCode(code);

    res.json({
      success: true,
      data: schoolLevel
    });
  } catch (error) {
    next(error);
  }
}