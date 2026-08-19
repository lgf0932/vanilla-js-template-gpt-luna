export default {
  id: 'dashboard',
  icon: 'dashboard',
  order: 10,
  i18nNamespace: 'dashboard',
  loadRoot: () => import('./index.js'),
  submodules: [],
};
