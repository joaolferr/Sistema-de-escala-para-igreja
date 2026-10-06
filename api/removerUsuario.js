// Função serverless da Vercel — roda no servidor, nunca no navegador.
// Apaga a CONTA DE LOGIN (Authentication) além do perfil no Firestore.
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ erro: "Método não permitido" });

  const { uid } = req.body || {};
  if (!uid)
    return res.status(400).json({ erro: "Faltou o uid da pessoa a remover" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado" });

  try {
    // 1. Confirma quem está chamando
    const decoded = await admin.auth().verifyIdToken(token);

    // 2. Confirma que quem está chamando é líder ou admin do sistema
    const chamadorSnap = await admin
      .firestore()
      .collection("usuarios")
      .doc(decoded.uid)
      .get();
    const perfilChamador = chamadorSnap.exists
      ? chamadorSnap.data().perfil
      : null;
    if (!["lider", "sistema"].includes(perfilChamador)) {
      return res
        .status(403)
        .json({ erro: "Sem permissão para remover usuários" });
    }

    // 3. Se for líder, só pode remover voluntário (nunca outro líder ou admin)
    if (perfilChamador === "lider") {
      const alvoSnap = await admin
        .firestore()
        .collection("usuarios")
        .doc(uid)
        .get();
      if (alvoSnap.exists && alvoSnap.data().perfil !== "voluntario") {
        return res
          .status(403)
          .json({ erro: "Líder só pode remover voluntários" });
      }
    }

    // 4. Impede remover a si mesmo
    if (uid === decoded.uid) {
      return res
        .status(400)
        .json({ erro: "Você não pode remover sua própria conta" });
    }

    // 5. Remove a conta de login e o perfil
    await admin
      .auth()
      .deleteUser(uid)
      .catch((err) => {
        if (err.code !== "auth/user-not-found") throw err; // já não existia, segue o jogo
      });
    await admin.firestore().collection("usuarios").doc(uid).delete();

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ erro: err.message || "Erro ao remover usuário" });
  }
}
