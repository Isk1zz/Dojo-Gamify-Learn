// ================================================
// Knell — cryptography
// ------------------------------------------------
// Public/private keys and authenticated encryption, built entirely on
// the browser's own Web Crypto API (`crypto.subtle`). Nothing here
// implements a cipher, a hash, or modular exponentiation by hand. That
// is deliberate and it is the single most important line in this file:
// hand-rolled crypto fails in ways that testing does not reveal, and the
// browser already ships audited, constant-time implementations of the
// exact primitives cryptocurrencies use.
//
// ---- What this file gives you ----
//
//   1. A DEVICE KEY PAIR (ECDSA P-256) — the "two keys". The private key
//      is generated non-extractable and stored in IndexedDB as a live
//      CryptoKey. It can sign; it can never be read out, exported, or
//      printed, not by this code and not by injected script. The public
//      half is exportable and is what a server would hold.
//
//   2. SIGNING — prove a blob of data came from this device and has not
//      been altered since.
//
//   3. PASSPHRASE ENCRYPTION — PBKDF2-SHA256 (600,000 iterations) to
//      stretch a passphrase into an AES-256-GCM key. GCM is
//      authenticated: a modified ciphertext fails to decrypt rather than
//      decrypting to garbage.
//
// ---- What this file CANNOT do, and no client-side crypto can ----
//
// It cannot stop the person using the app from editing their own saved
// data. Their Tokens, XP and progress live in localStorage on their
// machine; any key used to protect that also lives on their machine, so
// they can always re-sign whatever they changed. Signing local data
// raises the effort from "edit a number in DevTools" to "call the app's
// own sign function" — that is a speed bump, not a defence, and it
// should never be described as one.
//
// The only real fix for that is a server that does not trust the client:
// it keeps the authoritative numbers, and it validates every change
// against its own rules. When the online database goes in, THAT is what
// protects the economy — not this file. This file protects data in
// transit and at rest, which is a different and genuine problem.
//
// ---- Secure context required ----
// crypto.subtle exists only in a secure context: https, or localhost.
// GitHub Pages is https, so production is fine. Plain http over a LAN
// address is not, and every call here will reject. isAvailable() reports
// this so callers can degrade instead of throwing.
//
// ---- Storage ----
// IndexedDB "knell-keys". A brand-new store with nothing saved in it
// yet, which is why it may carry the current brand name — unlike the
// localStorage keys in db.js, i18n.js and exam-sim.js, which address
// existing user data and keep their old names forever. Renaming a
// storage key does not move data, it orphans it.
// ================================================

(() => {
  const DB_NAME  = "knell-keys";
  const STORE    = "keys";
  const KEY_ID   = "device-identity";

  const SIGN_ALGO = { name: "ECDSA", namedCurve: "P-256" };
  const SIGN_PARAMS = { name: "ECDSA", hash: "SHA-256" };

  // 600,000 is the floor OWASP currently gives for PBKDF2-HMAC-SHA256.
  // It is deliberately slow: the whole point is to make guessing a weak
  // passphrase expensive. Raising it later is safe for NEW data but
  // breaks old envelopes, which is why the number travels inside each
  // envelope rather than being read from here at decrypt time.
  const PBKDF2_ITERATIONS = 600000;

  const subtle = (typeof crypto !== "undefined" && crypto.subtle) || null;

  function isAvailable() {
    return !!subtle;
  }

  function requireSubtle() {
    if (!subtle) {
      throw new Error(
        "Web Crypto is unavailable. It requires a secure context — https " +
        "or localhost. A plain-http origin cannot do any of this."
      );
    }
  }

  // ---- byte / text helpers ----------------------------------------
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function toB64(buf) {
    const bytes = new Uint8Array(buf);
    let s = "";
    // Chunked: String.fromCharCode(...bytes) blows the argument limit
    // somewhere around 100KB, and an exported profile can exceed that.
    for (let i = 0; i < bytes.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(s);
  }

  function fromB64(s) {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // ---- IndexedDB ---------------------------------------------------
  // Only IndexedDB can hold a live CryptoKey. localStorage stores
  // strings, which would force the private key to be extractable —
  // exactly what we are avoiding.
  function idb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function idbGet(key) {
    return idb().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    }));
  }

  function idbPut(key, value) {
    return idb().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    }));
  }

  function idbDelete(key) {
    return idb().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    }));
  }

  // ---- Device identity --------------------------------------------

  // Returns { privateKey, publicKey }, generating and persisting the
  // pair on first call. `extractable: false` on the private half is the
  // point of the whole arrangement: the key object can be handed to
  // sign(), and there is no API — none — that turns it back into bytes.
  async function getDeviceKeys() {
    requireSubtle();
    const existing = await idbGet(KEY_ID);
    if (existing && existing.privateKey && existing.publicKey) return existing;

    const pair = await subtle.generateKey(SIGN_ALGO, false, ["sign", "verify"]);
    const record = { privateKey: pair.privateKey, publicKey: pair.publicKey, createdAt: new Date().toISOString() };
    await idbPut(KEY_ID, record);
    return record;
  }

  // The half that leaves the device. JWK rather than raw bytes because
  // it names its own algorithm and curve, so a server cannot be tricked
  // into verifying it under weaker parameters.
  async function getPublicKeyJwk() {
    const { publicKey } = await getDeviceKeys();
    return subtle.exportKey("jwk", publicKey);
  }

  // A short, stable, human-comparable fingerprint of the public key —
  // SHA-256 of its raw form, first 8 bytes, hex. For showing a device
  // identity in a UI or a log without printing a whole key.
  async function getFingerprint() {
    const { publicKey } = await getDeviceKeys();
    const raw = await subtle.exportKey("raw", publicKey);
    const hash = await subtle.digest("SHA-256", raw);
    return [...new Uint8Array(hash).slice(0, 8)]
      .map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Destroys the device identity. Anything signed by the old key stops
  // verifying, which is the intended effect — this is what you call when
  // a device is handed on, not routine housekeeping.
  async function resetDeviceKeys() {
    await idbDelete(KEY_ID);
    return true;
  }

  // ---- Signing -----------------------------------------------------

  // `data` may be a string or an object; objects are serialised with
  // stableStringify so that two structurally equal objects always
  // produce the same bytes and therefore the same signature.
  async function sign(data) {
    requireSubtle();
    const { privateKey } = await getDeviceKeys();
    const bytes = enc.encode(typeof data === "string" ? data : stableStringify(data));
    const sig = await subtle.sign(SIGN_PARAMS, privateKey, bytes);
    return toB64(sig);
  }

  // `publicKeyJwk` omitted means "this device's own key".
  async function verify(data, signatureB64, publicKeyJwk) {
    requireSubtle();
    const key = publicKeyJwk
      ? await subtle.importKey("jwk", publicKeyJwk, SIGN_ALGO, false, ["verify"])
      : (await getDeviceKeys()).publicKey;
    const bytes = enc.encode(typeof data === "string" ? data : stableStringify(data));
    try {
      return await subtle.verify(SIGN_PARAMS, key, fromB64(signatureB64), bytes);
    } catch (e) {
      // A malformed signature is a failed verification, not a crash.
      return false;
    }
  }

  // JSON.stringify does not promise key order for objects built at
  // different times, and a signature over reordered keys fails. This
  // sorts keys at every level so the bytes are reproducible.
  function stableStringify(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
    const keys = Object.keys(value).sort();
    return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify(value[k])).join(",") + "}";
  }

  // ---- Passphrase encryption ---------------------------------------

  async function deriveKey(passphrase, salt, iterations) {
    const base = await subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // Returns a self-describing envelope. Salt, IV and iteration count
  // travel WITH the ciphertext on purpose: none of them is a secret, and
  // an envelope that cannot describe how it was made is one that stops
  // opening the day a parameter here changes.
  async function encryptWithPassphrase(data, passphrase) {
    requireSubtle();
    if (!passphrase) throw new Error("A passphrase is required.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));   // 96 bits, the size GCM is specified for
    const key  = await deriveKey(passphrase, salt, PBKDF2_ITERATIONS);
    const bytes = enc.encode(typeof data === "string" ? data : JSON.stringify(data));
    const ct = await subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
    return {
      v: 1,
      kdf: { name: "PBKDF2", hash: "SHA-256", iterations: PBKDF2_ITERATIONS, salt: toB64(salt) },
      cipher: "AES-GCM",
      iv: toB64(iv),
      data: toB64(ct)
    };
  }

  // Throws on a wrong passphrase OR on tampering — AES-GCM cannot tell
  // the two apart, and neither can this. That is the correct behaviour:
  // both mean "do not trust these bytes".
  async function decryptWithPassphrase(envelope, passphrase) {
    requireSubtle();
    if (!envelope || !envelope.data || !envelope.kdf) throw new Error("Not an encrypted envelope.");
    const salt = fromB64(envelope.kdf.salt);
    const iv   = fromB64(envelope.iv);
    const key  = await deriveKey(passphrase, salt, envelope.kdf.iterations || PBKDF2_ITERATIONS);
    let plain;
    try {
      plain = await subtle.decrypt({ name: "AES-GCM", iv }, key, fromB64(envelope.data));
    } catch (e) {
      throw new Error("Wrong passphrase, or the data has been altered.");
    }
    return dec.decode(plain);
  }

  // ---- Signed envelopes --------------------------------------------

  // Wraps a payload with this device's signature and public key, so a
  // recipient can check both that it is intact and which device made it.
  // Shipping the public key inside proves nothing on its own — anyone can
  // sign with their own pair — so a server must compare the key against
  // one it already trusts. Left to the caller because only the caller
  // knows what "trusted" means.
  async function signEnvelope(payload) {
    const signature = await sign(payload);
    return {
      v: 1,
      payload,
      signature,
      publicKey: await getPublicKeyJwk(),
      fingerprint: await getFingerprint(),
      signedAt: new Date().toISOString()
    };
  }

  async function verifyEnvelope(envelope, trustedPublicKeyJwk) {
    if (!envelope || !envelope.payload || !envelope.signature) return { ok: false, reason: "not-an-envelope" };
    const key = trustedPublicKeyJwk || envelope.publicKey;
    if (!key) return { ok: false, reason: "no-key" };
    const ok = await verify(envelope.payload, envelope.signature, key);
    if (!ok) return { ok: false, reason: "bad-signature" };
    return {
      ok: true,
      // Loud, because it is the difference between "intact" and
      // "intact AND from someone you trust".
      selfSigned: !trustedPublicKeyJwk,
      fingerprint: envelope.fingerprint || null
    };
  }

  Dojo.Crypto = {
    isAvailable,
    getDeviceKeys, getPublicKeyJwk, getFingerprint, resetDeviceKeys,
    sign, verify, stableStringify,
    encryptWithPassphrase, decryptWithPassphrase,
    signEnvelope, verifyEnvelope
  };
})();
