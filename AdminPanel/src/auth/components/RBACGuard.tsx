import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { AdminModule, PermissionAction } from '../types/auth';

interface RBACGuardProps {
  module: AdminModule | '*';
  action?: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  module,
  action = 'read',
  fallback = null,
  children,
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(module, action)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
        <h4 className="font-bold text-sm">Access Restricted</h4>
        <p className="text-xs mt-1">
          Your administrator role does not have permission to perform this operation.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
