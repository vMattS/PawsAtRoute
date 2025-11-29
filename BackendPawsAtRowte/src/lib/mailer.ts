// src/lib/mailerGmail.ts
import { google } from "googleapis";

/** ==== ENV ==== */
const GMAIL_CLIENT_ID     = (process.env.GMAIL_CLIENT_ID ?? "").trim();
const GMAIL_CLIENT_SECRET = (process.env.GMAIL_CLIENT_SECRET ?? "").trim();
const GMAIL_REDIRECT_URI  = (process.env.GMAIL_REDIRECT_URI ?? "https://developers.google.com/oauthplayground").trim();
const GMAIL_REFRESH_TOKEN = (process.env.GMAIL_REFRESH_TOKEN ?? "").trim();
export const FROM_EMAIL   = (process.env.FROM_EMAIL ?? "soporte.pawsatroute@gmail.com").trim();

// =========================
// 🔥 DEBUG: validar credenciales en runtime
// =========================
console.log("📩 Gmail Auth DEBUG (in backend runtime)");
console.log("   CLIENT_ID            =", GMAIL_CLIENT_ID ? "[OK]" : "❗ MISSING");
console.log("   CLIENT_SECRET LEN    =", GMAIL_CLIENT_SECRET?.length ?? 0);
console.log("   REDIRECT_URI         =", GMAIL_REDIRECT_URI);
console.log("   REFRESH_TOKEN LEN    =", GMAIL_REFRESH_TOKEN?.length ?? 0);
console.log("   FROM_EMAIL           =", FROM_EMAIL);

/** OAuth2 client configurado para Gmail API */
export function makeOAuth2Client() {
  const oAuth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  return oAuth2Client;
}

/** ===== Helpers MIME/Base64url ===== */
function b64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// RFC 2047 para Subject en UTF-8
function encodeHeaderUTF8(s: string) {
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

/** Construye el raw (texto plano) para Gmail API */
export function buildRawMessage(opts: {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const { from, to, subject, text, replyTo } = opts;
  const CRLF = "\r\n";

  const headers =
    `From: ${from}${CRLF}` +
    `To: ${to}${CRLF}` +
    `Subject: ${encodeHeaderUTF8(subject)}${CRLF}` +
    `MIME-Version: 1.0${CRLF}` +
    `Content-Type: text/plain; charset="UTF-8"${CRLF}` +
    `Content-Transfer-Encoding: base64${CRLF}` +
    (replyTo ? `Reply-To: ${replyTo}${CRLF}` : "") +
    CRLF;

  const bodyB64 = Buffer.from(text, "utf8").toString("base64");
  return b64url(headers + bodyB64);
}

/** Envía un correo simple (texto) usando Gmail API */
export async function gmailSendText({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {

  console.log("📨 Intentando enviar email vía gmailSendText...");
  console.log("   TO:", to);
  console.log("   SUBJECT:", subject);
  console.log("   USING REFRESH TOKEN LEN:", GMAIL_REFRESH_TOKEN.length);

  const auth = makeOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  const raw = buildRawMessage({
    from: `Paws At Route <${FROM_EMAIL}>`,
    to,
    subject,
    text,
    replyTo: replyTo ?? FROM_EMAIL,
  });

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  console.log("📨 Gmail response:", res.data);

  return res.data; // incluye id, threadId, labelIds
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string; // ignorado en texto, ver variante HTML abajo
}) {
  return gmailSendText({ to: opts.to, subject: opts.subject, text: opts.text });
}
