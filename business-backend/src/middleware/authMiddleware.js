const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

/**
 * Auth Middleware - simple role-based access control
 *
 * Use attachUserFromToken on the router so that requests with
 * Authorization: Bearer <token> get req.user set (from auth server or JWT).
 * Then requireAuth / requireRoles can enforce access.
 */
class AuthMiddleware {
  /**
   * When Authorization: Bearer <token> is present:
   * 1. Try auth server GET /oauth/me and set req.user from response.
   * 2. If that fails, try JWT verify with JWT_SECRET or AUTH_JWT_SECRET and set req.user from payload.
   * When no Bearer token is present, does nothing (next()).
   * When both fail: next() without req.user (public routes work; protected routes 401 in requireAuth).
   */
  static attachUserFromToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const isDev = process.env.NODE_ENV !== 'production';

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const accessToken = authHeader.substring(7).trim();
    if (!accessToken) {
      return next();
    }

    authService
      .getProfile(accessToken)
      .then((user) => {
        if (isDev && (!user || !user.id)) {
          console.warn('[Auth] getProfile returned user without id:', user ? Object.keys(user) : 'null');
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        if (isDev) {
          console.warn('[Auth] getProfile failed:', err.message || err);
        }
        // Fallback 1: JWT verify with secret
        const secret = process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET;
        if (secret) {
          try {
            const payload = jwt.verify(accessToken, secret);
            const id = payload.sub || payload.id;
            if (id) {
              const roles = Array.isArray(payload.roles)
                ? payload.roles.map((r) => (typeof r === 'string' ? { name: r } : r))
                : payload.realm_access && Array.isArray(payload.realm_access.roles)
                  ? payload.realm_access.roles.map((r) => ({ name: r }))
                  : [];
              req.user = {
                id,
                email: payload.email,
                firstName: payload.given_name || payload.firstName,
                lastName: payload.family_name || payload.lastName,
                roles: roles.length ? roles : (payload.role ? [{ name: payload.role }] : []),
              };
              if (isDev) {
                console.log('[Auth] req.user set from JWT. id=', id, 'roles=', req.user.roles?.map((r) => r.name));
              }
              return next();
            }
          } catch (jwtErr) {
            if (isDev) {
              console.warn('[Auth] JWT verify failed:', jwtErr.message);
            }
          }
        }
        // Fallback 2 (development only): decode without verify so protected routes work when auth server unreachable
        if (isDev) {
          try {
            const payload = jwt.decode(accessToken);
            if (payload && (payload.sub || payload.id)) {
              const id = payload.sub || payload.id;
              const roles = Array.isArray(payload.roles)
                ? payload.roles.map((r) => (typeof r === 'string' ? { name: r } : r))
                : payload.role
                  ? [{ name: payload.role }]
                  : [{ name: 'super_admin' }];
              req.user = {
                id,
                email: payload.email || 'dev@local',
                firstName: payload.firstName || payload.given_name,
                lastName: payload.lastName || payload.family_name,
                roles,
              };
              console.warn('[Auth] req.user set from JWT decode (dev only, unverified). id=', id);
              return next();
            }
          } catch (_) {
            // ignore
          }
        }
        next();
      });
  }

  /**
   * Extract user object from the request.
   * Falls back to `req.body.user` for compatibility with existing code.
   */
  static getUserFromRequest(req) {
    if (req.user && req.user.id) {
      return req.user;
    }

    if (req.body && req.body.user && req.body.user.id) {
      return req.body.user;
    }

    return null;
  }

  /**
   * Require that a user is present on the request.
   */
  static requireAuth(req, res, next) {
    const user = AuthMiddleware.getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি',
      });
    }

    req.user = user;
    next();
  }

  /**
   * Require that the authenticated user has at least one
   * of the allowed roles.
   *
   * Role names are matched case-insensitively against common
   * fields on each role object (name, roleName, code, slug).
   *
   * Example:
   *   router.use(AuthMiddleware.requireRoles(['admin', 'super_admin']));
   */
  static requireRoles(allowedRoles = []) {
    const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());

    return (req, res, next) => {
      const user = AuthMiddleware.getUserFromRequest(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি',
        });
      }

      const roles = Array.isArray(user.roles) ? user.roles : [];

      const hasAllowedRole = roles.some((role) => {
        if (!role) return false;

        const candidates = [
          role.name,
          role.roleName,
          role.code,
          role.slug,
        ]
          .filter((v) => v !== undefined && v !== null)
          .map((v) => String(v).toLowerCase());

        return candidates.some((c) => normalizedAllowed.includes(c));
      });

      if (!hasAllowedRole) {
        return res.status(403).json({
          success: false,
          message: 'আপনার এই রিসোর্সে প্রবেশাধিকার নেই',
        });
      }

      req.user = user;
      next();
    };
  }
}

module.exports = AuthMiddleware;

