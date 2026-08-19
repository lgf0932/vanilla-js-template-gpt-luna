export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function asNonEmptyString(value, maxLength = 200) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    return null;
  }
  return normalized;
}

export function asOptionalString(value, maxLength = 20000) {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value !== 'string' || value.length > maxLength) {
    return null;
  }
  return value;
}

export function asPositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    return fallback;
  }
  return Math.min(number, max);
}

export function asOneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}
