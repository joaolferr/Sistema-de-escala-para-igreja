// Dados mock — serão substituídos por chamadas ao Supabase.
let ministerios = ["Mídia", "Som", "Transmissão"];
let pessoas = [
  { id: 1, nome: "Pedro Alves", ministerios: ["Som", "Transmissão"] },
  { id: 2, nome: "Ana Souza", ministerios: ["Mídia"] },
  { id: 3, nome: "Carlos Lima", ministerios: ["Som"] },
  { id: 4, nome: "Júlia Ferreira", ministerios: ["Mídia", "Transmissão"] },
];
let escalas = [
  {
    id: 1,
    pessoaId: 1,
    ministerio: "Som",
    data: "2026-09-28",
    evento: "Culto de Celebração",
  },
  {
    id: 2,
    pessoaId: 2,
    ministerio: "Mídia",
    data: "2026-09-28",
    evento: "Culto de Celebração",
  },
  {
    id: 3,
    pessoaId: 4,
    ministerio: "Transmissão",
    data: "2026-10-05",
    evento: "Culto de Celebração",
  },
  {
    id: 4,
    pessoaId: 3,
    ministerio: "Som",
    data: "2026-10-05",
    evento: "Culto de Celebração",
  },
];
let indisponibilidades = [
  { id: 1, pessoaId: 1, de: "2026-10-10", ate: "2026-10-17", motivo: "Viagem" },
];
let trocas = [{ id: 1, escalaId: 1, solicitanteId: 1, status: "pendente" }];
let usuarios = [
  {
    id: 1,
    nome: "Admin Sistema",
    email: "admin@igreja.app",
    perfil: "sistema",
  },
  { id: 2, nome: "Líder Mídia", email: "lider@igreja.app", perfil: "lider" },
  {
    id: 3,
    nome: "Pedro Alves",
    email: "pedro@igreja.app",
    perfil: "voluntario",
  },
];
let uid = 100;

function nomePessoa(id) {
  return pessoas.find((p) => p.id === id)?.nome || "—";
}
function iniciais(nome) {
  return nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}
function avatarHtml(nome) {
  return `<div class="avatar" title="${nome}">${iniciais(nome)}</div>`;
}
function fmtData(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
function diasLabel(iso) {
  const hoje = new Date("2026-09-25T00:00:00");
  const d = new Date(iso + "T00:00:00");
  const dias = Math.round((d - hoje) / 86400000);
  if (dias === 0) return "hoje";
  if (dias < 0) return "já passou";
  if (dias === 1) return "amanhã";
  return `daqui a ${dias} dias`;
}

// Sessão real via Firebase Auth. O perfil (sistema/lider/voluntario) vem de usuarios/{uid} no Firestore.
const PAGINA_POR_PERFIL = {
  sistema: "sistema.html",
  lider: "lider.html",
  voluntario: "voluntario.html",
};

function requireSession(perfilEsperado, cb) {
  import("./firebase.js").then((fb) => {
    fb.onAuthStateChanged(fb.auth, async (fbUser) => {
      if (!fbUser) {
        location.href = "login.html";
        return;
      }
      const snap = await fb.getDoc(fb.doc(fb.db, "usuarios", fbUser.uid));
      if (!snap.exists()) {
        await fb.signOut(fb.auth);
        location.href = "login.html";
        return;
      }
      const user = { uid: fbUser.uid, ...snap.data() };
      if (user.perfil !== perfilEsperado) {
        location.href = PAGINA_POR_PERFIL[user.perfil] || "login.html";
        return;
      }
      cb(user);
    });
  });
}
async function logout() {
  const fb = await import("./firebase.js");
  await fb.signOut(fb.auth);
  location.href = "login.html";
}
