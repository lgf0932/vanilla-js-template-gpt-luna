import { bootstrap } from './core/bootstrap.js';

bootstrap().catch((error) => {
  console.error(error);
  const shell = document.querySelector('app-shell');
  shell?.showError(error);
});
