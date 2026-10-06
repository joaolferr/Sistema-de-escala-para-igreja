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
  sistema: "lider.html",
  lider: "lider.html",
  voluntario: "voluntario.html",
};

// perfis Permitidos aceita um perfil só ("voluntario") ou uma lista (['lider','sistema'])
function mostrarErroSessao(msg) {
  console.error(msg);
  const main = document.getElementById("main") || document.body;
  main.innerHTML = `<div style="padding:24px;color:#C81E1E;font-family:sans-serif">
    <strong>Não foi possível carregar a página.</strong><br>${msg}<br>
    <span style="font-size:12px;color:#666">Abra o Console (F12) pra ver o erro técnico completo.</span></div>`;
}

function requireSession(perfisPermitidos, cb) {
  const permitidos = Array.isArray(perfisPermitidos)
    ? perfisPermitidos
    : [perfisPermitidos];
  import("./firebase.js")
    .then((fb) => {
      fb.onAuthStateChanged(fb.auth, async (fbUser) => {
        try {
          if (!fbUser) {
            location.href = "index.html";
            return;
          }
          const snap = await fb.getDoc(fb.doc(fb.db, "usuarios", fbUser.uid));
          if (!snap.exists()) {
            await fb.signOut(fb.auth);
            location.href = "index.html";
            return;
          }
          const user = { uid: fbUser.uid, ...snap.data() };
          if (!permitidos.includes(user.perfil)) {
            location.href = PAGINA_POR_PERFIL[user.perfil] || "index.html";
            return;
          }
          cb(user);
        } catch (err) {
          mostrarErroSessao(
            err.code || err.message || "Erro desconhecido ao carregar sessão.",
          );
        }
      });
    })
    .catch((err) =>
      mostrarErroSessao("Falha ao carregar firebase.js: " + err.message),
    );
}
// Apaga a conta de login + perfil de outra pessoa, via função serverless (/api/removerUsuario).
// Precisa estar hospedado na Vercel com as variáveis de ambiente configuradas — não funciona no Live Server local.
async function removerContaCompleta(uid) {
  const fb = await import("./firebase.js");
  const token = await fb.auth.currentUser.getIdToken();
  const res = await fetch("/api/removerUsuario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ uid }),
  });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.erro || "Não foi possível remover.");
}

async function logout() {
  const fb = await import("./firebase.js");
  await fb.signOut(fb.auth);
  location.href = "index.html";
}
