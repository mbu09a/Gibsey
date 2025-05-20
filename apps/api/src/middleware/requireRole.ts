import { t } from '../trpc';
import { permissionsMap } from '../../../../packages/types/permissions';

// Middleware enforcing role-based permissions using ctx.user.role.
// Refer to the permissions map in packages/types for allowed actions.
export const requireRole = (allowed: string[]) =>
  t.middleware(({ ctx, next }) => {
    const role = (ctx.user as any)?.role;
    if (!role || !allowed.includes(role)) {
      throw new Error('Forbidden');
    }
    return next();
  });
