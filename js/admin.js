const sb = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
  ),
  $ = (id) => document.getElementById(id);
let type = "produtos",
  items = [],
  ownerId = null;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const msg = (id, t) => ($(id).textContent = t);
async function checkSession() {
  $("authMsg").textContent = "Verificando sessão…";
  const {
    data: { session },
    error,
  } = await sb.auth.getSession();
  if (error) {
    msg("authMsg", error.message);
    return;
  }
  if (session) {
    ownerId = session.user.id;
    showDashboard();
  } else {
    showLogin();
  }
}
function showLogin() {
  $("authBox").hidden = false;
  $("dashboard").hidden = true;
}
function showDashboard() {
  $("authBox").hidden = true;
  $("dashboard").hidden = false;
  loadItems();
}
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  msg("authMsg", "Entrando…");
  const { data, error } = await sb.auth.signInWithPassword({
    email: $("email").value,
    password: $("password").value,
  });
  if (error) {
    msg("authMsg", error.message);
    return;
  }
  ownerId = data.user.id;
  showDashboard();
});
$("logout").addEventListener("click", async () => {
  await sb.auth.signOut();
  showLogin();
});
sb.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") showLogin();
  if (session) {
    ownerId = session.user.id;
  }
});
document.querySelectorAll(".tab").forEach((b) =>
  b.addEventListener("click", () => {
    type = b.dataset.type;

    document
      .querySelectorAll(".tab")
      .forEach((x) => x.classList.toggle("active", x === b));

    $("itemType").value = type;

    $("formTitle").textContent =
      type === "produtos" ? "Adicionar peça" : "Adicionar serviço";

    const isService = type === "servicos";

    // Oculta os campos
    document.querySelector(".field-category").hidden = isService;
    document.querySelector(".field-brand").hidden = isService;

    // Categoria só é obrigatória para peças
    $("itemCategory").required = !isService;

    resetForm();
    loadItems();
  }),
);
async function loadItems() {
  if (!ownerId) return;
  $("adminItems").innerHTML = "<p>Carregando registros…</p>";
  const { data, error } = await sb.from(type).select("*").order("nome");
  if (error) {
    $("adminItems").innerHTML =
      `<p class="msg">Erro: ${esc(error.message)}</p>`;
    return;
  }
  items = data || [];
  renderList();
}
function renderList() {
  $("adminItems").innerHTML = items.length
    ? items
        .map(
          (i) =>
            `<article class="admin-row"><div><strong>${esc(i.nome)}</strong><br><small>${esc(i.categoria || "")} ${i.marca ? "• " + esc(i.marca) : ""} • R$ ${Number(i.preco || 0).toFixed(2)}</small></div><div class="row-actions"><button data-edit="${i.id}">Editar</button><button class="delete" data-delete="${i.id}">Excluir</button></div></article>`,
        )
        .join("")
    : `<p>Nenhum registro cadastrado.</p>`;
  $("adminItems")
    .querySelectorAll("[data-edit]")
    .forEach((b) => (b.onclick = () => editItem(b.dataset.edit)));
  $("adminItems")
    .querySelectorAll("[data-delete]")
    .forEach((b) => (b.onclick = () => deleteItem(b.dataset.delete)));
}
function resetForm() {
  $("itemForm").reset();
  $("itemId").value = "";
  $("formTitle").textContent =
    type === "produtos" ? "Adicionar peça" : "Adicionar serviço";
  msg("saveMsg", "");
}
function editItem(id) {
  const i = items.find((x) => String(x.id) === String(id));
  if (!i) return;
  $("itemId").value = i.id;
  $("itemName").value = i.nome || "";
  $("itemCategory").value = i.categoria || "";
  $("itemBrand").value = i.marca || "";
  $("itemPrice").value = i.preco ?? "";
  $("itemDescription").value = i.descricao || "";
  $("formTitle").textContent = "Editar " + i.nome;
  window.scrollTo({ top: $("itemForm").offsetTop - 100, behavior: "smooth" });
}
$("cancelEdit").onclick = resetForm;
$("itemForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  msg("saveMsg", "Salvando…");
  let imageUrl = null;
  const file = $("itemImage").files[0];
  if (file) {
    const ext = file.name.split(".").pop().toLowerCase(),
      path = `${ownerId}/${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage
      .from("catalogo")
      .upload(path, file, { upsert: false });
    if (upErr) {
      msg("saveMsg", "Falha no upload: " + upErr.message);
      return;
    }
    const { data } = sb.storage.from("catalogo").getPublicUrl(path);
    imageUrl = data.publicUrl;
  }
  const payload = {
    nome: $("itemName").value.trim(),
    categoria: $("itemCategory").value.trim() || null,
    marca: $("itemBrand").value.trim() || null,
    descricao: $("itemDescription").value.trim() || null,
    preco: Number($("itemPrice").value),
  };
  if (imageUrl) payload.imagem = imageUrl;
  const id = $("itemId").value;
  let result = id
    ? sb.from(type).update(payload).eq("id", id)
    : sb.from(type).insert(payload);
  const { error } = await result;
  if (error) {
    msg("saveMsg", "Erro: " + error.message);
    return;
  }
  msg("saveMsg", "Registro salvo.");
  resetForm();
  loadItems();
});
async function deleteItem(id) {
  if (!confirm("Excluir este registro?")) return;
  const { error } = await sb.from(type).delete().eq("id", id);
  if (error) {
    alert("Erro: " + error.message);
    return;
  }
  loadItems();
}
// Estado inicial do formulário
document.querySelector(".field-category").hidden = false;
document.querySelector(".field-brand").hidden = false;
$("itemCategory").required = true;
checkSession();
document.querySelector(".field-category").hidden = type === "servicos";
document.querySelector(".field-brand").hidden = type === "servicos";
