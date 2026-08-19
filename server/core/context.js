export function createRequestContext({ db, env, route, driver }) {
  return {
    db,
    env,
    params: route?.params || {},
    driver,
  };
}
