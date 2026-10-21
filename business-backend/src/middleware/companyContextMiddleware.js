const GRAMEEN_BAZAAR_ID = process.env.GRAMEEN_BAZAAR_ID;

/**
 * Company Context Middleware
 *
 * When enabled via GRAMEEN_BAZAAR_ATTACH_COMPANY_ID=true and
 * GRAMEEN_BAZAAR_ID is set, this middleware automatically injects
 * company_id / companyId into the request body (if not already present)
 * so callers do not have to send it explicitly.
 */
function attachCompanyId(req, res, next) {
  const enabled =
    String(process.env.GRAMEEN_BAZAAR_ATTACH_COMPANY_ID || '').toLowerCase() ===
    'true';

  if (!enabled || !GRAMEEN_BAZAAR_ID) {
    return next();
  }

  // Ensure body exists
  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }

  // Do not override if client already provided a company id
  const hasCompanyId =
    req.body.company_id !== undefined && req.body.company_id !== null;
  const hasCompanyIdCamel =
    req.body.companyId !== undefined && req.body.companyId !== null;

  if (!hasCompanyId && !hasCompanyIdCamel) {
    req.body.company_id = GRAMEEN_BAZAAR_ID;
    req.body.companyId = GRAMEEN_BAZAAR_ID;
  }

  return next();
}

module.exports = {
  attachCompanyId,
};

