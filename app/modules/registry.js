const moduleLoaders = [
  () => import('./dashboard/module.config.js'),
  () => import('./notes/module.config.js'),
  () => import('./settings/module.config.js'),
];

export async function loadManifests() {
  const modules = await Promise.all(moduleLoaders.map(async (load) => (await load()).default));
  return modules.sort((left, right) => left.order - right.order);
}

export { moduleLoaders };
