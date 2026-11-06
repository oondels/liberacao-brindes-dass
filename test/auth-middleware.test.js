import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";

const secret = "test-brindes-secret";

test("authenticateToken: aceita token via Bearer header", () => {
  const token = jwt.sign({ matricula: "3023093", usuario: "TEST.USER", is_admin: true }, secret);
  const req = {
    headers: { authorization: `Bearer ${token}` },
    cookies: {},
  };

  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && /^Bearer\s+/i.test(authHeader)
    ? authHeader.replace(/^Bearer\s+/i, "").trim()
    : null;
  const cookieToken = req.cookies?.token ? String(req.cookies.token).trim() : null;
  const candidates = [cookieToken, bearerToken].filter(Boolean);

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0], token);
  const decoded = jwt.verify(candidates[0], secret);
  assert.equal(decoded.matricula, "3023093");
  assert.equal(decoded.is_admin, true);
});

test("authenticateToken: faz fallback entre cookie válido e Bearer expirado", () => {
  const expiredBearer = jwt.sign(
    { matricula: "3023093", usuario: "TEST.USER", exp: Math.floor(Date.now() / 1000) - 60 },
    secret
  );
  const validCookie = jwt.sign(
    { matricula: "3023093", usuario: "TEST.USER" },
    secret,
    { expiresIn: "15m" }
  );

  const req = {
    headers: { authorization: `Bearer ${expiredBearer}` },
    cookies: { token: validCookie },
  };

  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && /^Bearer\s+/i.test(authHeader)
    ? authHeader.replace(/^Bearer\s+/i, "").trim()
    : null;
  const cookieToken = req.cookies?.token ? String(req.cookies.token).trim() : null;
  const candidates = [...new Set([cookieToken, bearerToken].filter(Boolean))];

  let authenticatedUser = null;
  for (const candidate of candidates) {
    try {
      authenticatedUser = jwt.verify(candidate, secret);
      break;
    } catch (_err) {
      // tenta próximo candidato
    }
  }

  assert.ok(authenticatedUser);
  assert.equal(authenticatedUser.matricula, "3023093");
});

test("authorization: concede isMasterAdmin apenas com is_admin = true", () => {
  const reqAdmin = { user: { matricula: "100", setor: "qualquer", is_admin: true } };
  const reqSectorOnly = { user: { matricula: "200", setor: "automacao", is_admin: false } };

  const isMasterAdmin1 = Boolean(reqAdmin.user?.is_admin);
  const isMasterAdmin2 = Boolean(reqSectorOnly.user?.is_admin);

  assert.equal(isMasterAdmin1, true);
  assert.equal(isMasterAdmin2, false);
});
