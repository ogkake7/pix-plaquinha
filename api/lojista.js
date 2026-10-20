// Configuração de cada lojista. Guarda os dados no Upstash Redis (Vercel Marketplace).
//   GET  /api/lojista?l=nome-do-link  -> devolve a configuração (pública, é o que o cliente vê)
//   POST /api/lojista                 -> cria ou altera, protegido por senha
const crypto = require("crypto");

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const SLUG = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
const TYPES = ["cpf", "cnpj", "tel", "email", "evp"];
const SHOWS = ["both", "code", "qr"];
const MODES = ["open", "fixed"];
const MAX_FAILS = 8;
const LOCK_SECONDS = 900;

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: "Bearer " + REDIS_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmd)
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || "redis_error");
  return j.result;
}

function str(v, n) { return String(v == null ? "" : v).trim().slice(0, n); }

function cleanConfig(c) {
  if (!c || typeof c !== "object") return null;
  const o = {
    type: c.type, key: str(c.key, 80), estab: str(c.estab, 60), name: str(c.name, 60),
    city: str(c.city, 40), mode: c.mode, amount: str(c.amount, 12), show: c.show, msg: str(c.msg, 40)
  };
  if (TYPES.indexOf(o.type) < 0 || SHOWS.indexOf(o.show) < 0 || MODES.indexOf(o.mode) < 0) return null;
  if (!o.key || o.name.length < 2 || o.city.length < 2) return null;
  return o;
}

function hash(pass, salt) {
  return crypto.scryptSync(String(pass), salt, 32).toString("hex");
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (!REDIS_URL || !REDIS_TOKEN) return send(res, 503, { error: "banco_nao_configurado" });
  try {
    if (req.method === "GET") {
      const slug = String((req.query && req.query.l) || "").toLowerCase();
      if (!SLUG.test(slug)) return send(res, 400, { error: "nome_invalido" });
      const raw = await redis(["GET", "loja:" + slug]);
      if (!raw) return send(res, 404, { error: "nao_encontrado" });
      return send(res, 200, { config: JSON.parse(raw).config });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
      if (!body || typeof body !== "object") return send(res, 400, { error: "corpo_invalido" });

      const slug = String(body.slug || "").toLowerCase();
      const pass = String(body.pass || "");
      const config = cleanConfig(body.config);
      if (!SLUG.test(slug)) return send(res, 400, { error: "nome_invalido" });
      if (pass.length < 6 || pass.length > 100) return send(res, 400, { error: "senha_curta" });
      if (!config) return send(res, 400, { error: "config_invalida" });

      const rawPrev = await redis(["GET", "loja:" + slug]);
      let salt, digest, created = false;

      if (rawPrev) {
        const fails = Number(await redis(["GET", "falhas:" + slug])) || 0;
        if (fails >= MAX_FAILS) return send(res, 429, { error: "muitas_tentativas" });
        const prev = JSON.parse(rawPrev);
        const a = Buffer.from(hash(pass, prev.salt), "hex");
        const b = Buffer.from(prev.hash, "hex");
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
          await redis(["INCR", "falhas:" + slug]);
          await redis(["EXPIRE", "falhas:" + slug, LOCK_SECONDS]);
          return send(res, 401, { error: "senha_incorreta" });
        }
        await redis(["DEL", "falhas:" + slug]);
        salt = prev.salt; digest = prev.hash;
      } else {
        created = true;
        salt = crypto.randomBytes(16).toString("hex");
        digest = hash(pass, salt);
      }

      await redis(["SET", "loja:" + slug, JSON.stringify({ config, salt, hash: digest, updatedAt: new Date().toISOString() })]);
      return send(res, 200, { ok: true, created });
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { error: "metodo_nao_permitido" });
  } catch (e) {
    return send(res, 500, { error: "erro_interno" });
  }
};
