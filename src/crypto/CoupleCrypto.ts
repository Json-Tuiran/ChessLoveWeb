// End-to-End Encryption (E2EE) with Web Crypto API for ChessLove couples

export class CoupleCrypto {
  private static cachedKey: CryptoKey | null = null;
  private static cachedCode: string | null = null;
  // Standard shared salt for PBKDF2 in ChessLove rooms
  private static readonly SALT = new TextEncoder().encode('ChessLoveRomanticE2EESalt2026');

  // Derive AES-GCM 256-bit key from couple code
  private static async getKey(coupleCode: string): Promise<CryptoKey> {
    const normalizedCode = coupleCode.trim().toUpperCase();
    if (this.cachedKey && this.cachedCode === normalizedCode) {
      return this.cachedKey;
    }

    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API no disponible en este entorno');
    }

    const enc = new TextEncoder();
    const rawKeyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(normalizedCode),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.SALT,
        iterations: 100000,
        hash: 'SHA-256',
      },
      rawKeyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.cachedKey = derivedKey;
    this.cachedCode = normalizedCode;
    return derivedKey;
  }

  // Encrypt any JSON-serializable payload
  public static async encrypt(data: unknown, coupleCode: string): Promise<{ iv: string; cipher: string }> {
    try {
      const key = await this.getKey(coupleCode);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(JSON.stringify(data));

      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedData
      );

      // Convert ArrayBuffers to Base64
      const ivBase64 = btoa(String.fromCharCode(...iv));
      const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

      return {
        iv: ivBase64,
        cipher: cipherBase64,
      };
    } catch (err) {
      console.error('Error encrypting payload:', err);
      throw err;
    }
  }

  // Decrypt payload back to original JavaScript object
  public static async decrypt<T = unknown>(ivBase64: string, cipherBase64: string, coupleCode: string): Promise<T> {
    try {
      const key = await this.getKey(coupleCode);

      const iv = new Uint8Array(
        atob(ivBase64)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const ciphertext = new Uint8Array(
        atob(cipherBase64)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        ciphertext
      );

      const decodedString = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decodedString) as T;
    } catch (err) {
      console.error('Error decrypting payload:', err);
      throw err;
    }
  }
}
