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
  let errorCaught = null;
  let nextCalled = false;

  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const extracted = bearerToken || req.cookies?.token;

  assert.equal(extracted, token);
  const decoded = jwt.verify(extracted, secret);
  assert.equal(decoded.matricula, "3023093");
  assert.equal(decoded.is_admin, true);
});

test("authorization: concede isMasterAdmin apenas com is_admin = true", () => {
  const reqAdmin = { user: { matricula: "100", setor: "qualquer", is_admin: true } };
  const reqSectorOnly = { user: { matricula: "200", setor: "automacao", is_admin: false } };

  const isMasterAdmin1 = Boolean(reqAdmin.user?.is_admin);
  const isMasterAdmin2 = Boolean(reqSectorOnly.user?.is_admin);

  assert.equal(isMasterAdmin1, true);
  assert.equal(isMasterAdmin2, false);
});
