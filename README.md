# Sistema de Escalas — Ministério de Mídia

Sistema web para organizar as escalas dos voluntários do ministério de
mídia, som e transmissão de uma igreja.

## Perfis de acesso
- **Líder do ministério:** cadastra voluntários e monta as escalas
- **Voluntário:** vê a própria escala, marca indisponibilidade e pede troca
- **Admin do sistema:** gerencia usuários e faz a manutenção

## Estado atual
- [x] Login com Firebase Authentication
- [x] Cadastro de pessoas e usuários (Firestore)
- [ ] Escalas gravadas no banco
- [ ] Indisponibilidade e pedidos de troca
- [ ] Notificações por e-mail e WhatsApp

## Tecnologias
HTML, CSS e JavaScript puro, Firebase (Authentication e Firestore).

## Como rodar
1. Clone o repositório
2. Abra a pasta no VS Code e rode com a extensão Live Server
   (não funciona abrindo o arquivo direto, por causa dos módulos JS)
3. Acesse `login.html`

Requer um projeto Firebase próprio: troque as chaves em `firebase.js`
e publique as regras do Firestore.
