const PASSWORD_ITERATIONS = 210000;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function subtle() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('当前运行时缺少 Web Crypto subtle API');
  }
  return globalThis.crypto.subtle;
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : textEncoder.encode(value);
  return bytesToBase64(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export function base64UrlDecode(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
  return new TextDecoder().decode(base64ToBytes(padded));
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await subtle().importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle().deriveBits({ name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${base64UrlEncode(salt)}$${base64UrlEncode(new Uint8Array(bits))}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof encoded !== 'string' || !encoded.startsWith('pbkdf2$')) {
    return false;
  }
  const [, iterationValue, saltValue, hashValue] = encoded.split('$');
  const iterations = Number(iterationValue);
  if (!Number.isInteger(iterations) || !saltValue || !hashValue) {
    return false;
  }
  try {
    const key = await subtle().importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await subtle().deriveBits({ name: 'PBKDF2', salt: base64ToBytes(saltValue.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (saltValue.length % 4)) % 4)), iterations, hash: 'SHA-256' }, key, 256);
    return timingSafeEqual(new Uint8Array(bits), base64ToBytes(hashValue.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (hashValue.length % 4)) % 4)));
  } catch {
    return false;
  }
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }
  return result === 0;
}

export async function hmacSign(secret, message) {
  const key = await subtle().importKey('raw', textEncoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await subtle().sign('HMAC', key, textEncoder.encode(message));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createEnvelopeKey(secret) {
  if (!secret) {
    throw new Error('ENCRYPTION_KEY 未配置');
  }
  const digest = await subtle().digest('SHA-256', textEncoder.encode(secret));
  return subtle().importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptSecret(value, secret) {
  const key = await createEnvelopeKey(secret);
  const iv = randomBytes(12);
  const cipher = await subtle().encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(value));
  return `${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(cipher))}`;
}

export async function decryptSecret(value, secret) {
  const [ivValue, cipherValue] = String(value).split(':');
  if (!ivValue || !cipherValue) {
    throw new Error('密文格式无效');
  }
  const key = await createEnvelopeKey(secret);
  const plain = await subtle().decrypt({ name: 'AES-GCM', iv: base64ToBytes(ivValue) }, key, base64ToBytes(cipherValue));
  return textDecoder.decode(plain);
}

export { PASSWORD_ITERATIONS };
