export default {
  id: 'settings',
  icon: 'settings',
  order: 30,
  i18nNamespace: 'settings',
  loadRoot: () => import('./index.js'),
  submodules: [
    { id: 'profile', icon: 'note', order: 10, i18nNamespace: 'settings', loadRoot: () => import('./submodules/profile/index.js') },
    { id: 'display', icon: 'sun', order: 20, i18nNamespace: 'settings', loadRoot: () => import('./submodules/display/index.js') },
    { id: 'security', icon: 'lock', order: 30, i18nNamespace: 'settings', loadRoot: () => import('./submodules/security/index.js') },
    { id: 'database', icon: 'layers', order: 40, i18nNamespace: 'settings', loadRoot: () => import('./submodules/database/index.js') },
  ],
};
