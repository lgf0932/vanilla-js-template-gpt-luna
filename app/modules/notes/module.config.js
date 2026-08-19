export default {
  id: 'notes',
  icon: 'note',
  order: 20,
  i18nNamespace: 'notes',
  loadRoot: () => import('./index.js'),
  submodules: [
    { id: 'list', icon: 'note', order: 10, i18nNamespace: 'notes/notes-list', loadRoot: () => import('./submodules/notes-list/index.js') },
    { id: 'tags', icon: 'layers', order: 20, i18nNamespace: 'notes/notes-tags', loadRoot: () => import('./submodules/notes-tags/index.js') },
  ],
};
