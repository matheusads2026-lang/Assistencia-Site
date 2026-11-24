(() => {
  "use strict";

  // ============================================================
  // NEXATECH INFORMÁTICA - CONFIGURAÇÕES INSTITUCIONAIS
  // ============================================================

  const STORE = {
    name: "NexaTech Informática",
    whatsapp: "85991561773",
    owner: "Rafael Martins",

    story:
      "A NexaTech Informática nasceu da paixão por tecnologia e do compromisso de oferecer soluções confiáveis para nossos clientes. Trabalhamos com manutenção de computadores, montagem, upgrades e venda de componentes, buscando sempre oferecer atendimento transparente, qualidade e preço justo. Nosso objetivo é ajudar cada cliente a encontrar a solução ideal para suas necessidades, seja para trabalho, estudo ou entretenimento.",

    address:
      "Av. Pres. Castelo Branco, 5153 - Centro, Horizonte - CE, 62880-031",

    hours:
      "Segunda a sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00 | Domingo: Fechado",

    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(
        "Av. Pres. Castelo Branco, 5153 - Centro, Horizonte - CE, 62880-031",
      ),
  };

  // ============================================================
  // CONEXÃO COM SUPABASE
  // ============================================================

  // Reutiliza uma instância caso o script seja executado novamente.
  const supabaseClient =
    window.__NEXATECH_SUPABASE_CLIENT__ ||
    (() => {
      if (!window.supabase || !window.supabase.createClient) {
        throw new Error("Biblioteca do Supabase não foi carregada.");
      }

      if (!window.SUPABASE_CONFIG) {
        throw new Error("Configuração do Supabase não encontrada.");
      }

      const client = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey,
      );

      window.__NEXATECH_SUPABASE_CLIENT__ = client;

      return client;
    })();

  // ============================================================
  // UTILITÁRIOS
  // ============================================================

  // Formatação de preços
  const money = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // WhatsApp
  function wa(message = "Olá, vim pelo site.") {
    let phone = String(STORE.whatsapp).replace(/\D/g, "");

    // Acrescenta o código do Brasil caso não esteja presente.
    if (!phone.startsWith("55")) {
      phone = "55" + phone;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  // Escapamento de conteúdo HTML
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[char];
    });
  }

  // Preenche elemento caso ele exista
  function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  }

  // ============================================================
  // INFORMAÇÕES INSTITUCIONAIS
  // ============================================================

  document.querySelectorAll("[data-loja]").forEach((element) => {
    element.textContent = STORE.name;
  });

  setText("aboutText", STORE.story);
  setText("ownerName", STORE.owner);
  setText("address", STORE.address);
  setText("hours", STORE.hours);
  setText("year", new Date().getFullYear());

  // ============================================================
  // GOOGLE MAPS
  // ============================================================

  const mapLink = document.getElementById("mapLink");

  if (mapLink) {
    mapLink.href = STORE.mapUrl;
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
  }

  // ============================================================
  // WHATSAPP - BOTÕES PRINCIPAIS
  // ============================================================

  const heroWhatsapp = document.getElementById("heroWhatsapp");

  if (heroWhatsapp) {
    heroWhatsapp.href = wa("Olá, vim pelo site da NexaTech!");
    heroWhatsapp.target = "_blank";
    heroWhatsapp.rel = "noopener noreferrer";
  }

  const floatingWhatsapp = document.getElementById("floatingWhatsapp");

  if (floatingWhatsapp) {
    floatingWhatsapp.href = wa();
    floatingWhatsapp.target = "_blank";
    floatingWhatsapp.rel = "noopener noreferrer";
  }

  // ============================================================
  // ELEMENTOS DO CATÁLOGO
  // ============================================================

  const servicesGrid = document.getElementById("servicesGrid");
  const productsGrid = document.getElementById("productsGrid");

  let products = [];
  let services = [];

  // ============================================================
  // EXIBIÇÃO DOS SERVIÇOS
  // ============================================================

  function serviceCard(service) {
    const serviceImage = service.imagem
      ? `<img class="service-image" src="${esc(service.imagem)}" alt="${esc(service.nome)}" loading="lazy">`
      : `<div class="service-image service-image-placeholder"><span>⌁</span></div>`;
    return `
      <article class="service-card">

        ${serviceImage}

        <div class="symbol">⌁</div>

        <h3>${esc(service.nome)}</h3>

        <p>
          ${esc(service.descricao || "Consulte detalhes e disponibilidade.")}
        </p>

        ${
          service.preco != null
            ? `<strong>${money(service.preco)}</strong>`
            : ""
        }

        <p>
          <a
            class="btn"
            target="_blank"
            rel="noopener noreferrer"
            href="${wa(
              "Olá! Tenho interesse no serviço: " + service.nome + ".",
            )}"
          >
            Consultar
          </a>
        </p>

      </article>
    `;
  }

  // ============================================================
  // EXIBIÇÃO DOS PRODUTOS
  // ============================================================

  function productCard(product) {
    const image = product.imagem
      ? `
        <img
          src="${esc(product.imagem)}"
          alt="${esc(product.nome)}"
          loading="lazy"
        >
      `
      : `
        <div class="product-img-placeholder">
          Imagem não cadastrada
        </div>
      `;

    return `
      <article class="product-card">

        ${image}

        <div class="product-info">

          <div class="meta">
            ${esc(product.categoria || "")}
            ${product.marca ? " • " + esc(product.marca) : ""}
          </div>

          <h3>${esc(product.nome)}</h3>

          <p class="meta">
            ${esc(product.descricao || "")}
          </p>

          <div class="price-tag">
            ${money(product.preco)}
          </div>

          <a
            class="btn"
            target="_blank"
            rel="noopener noreferrer"
            href="${wa(
              "Olá! Tenho interesse no produto " +
                product.nome +
                " (R$ " +
                product.preco +
                ").",
            )}"
          >
            Consultar no WhatsApp
          </a>

        </div>

      </article>
    `;
  }

  // ============================================================
  // RENDERIZAÇÃO DOS SERVIÇOS
  // ============================================================

  function renderServices() {
    if (!servicesGrid) return;

    servicesGrid.innerHTML = services.length
      ? services.map(serviceCard).join("")
      : `
        <p class="empty">
          Nenhum serviço cadastrado ainda.
        </p>
      `;
  }

  // ============================================================
  // FILTRO DE MARCAS
  // ============================================================

  function populateBrands() {
    const brandElement = document.getElementById("brand");

    if (!brandElement) return;

    const brands = [
      ...new Set(products.map((product) => product.marca).filter(Boolean)),
    ].sort();

    brandElement.innerHTML = `
      <option value="">Todas as marcas</option>

      ${brands
        .map(
          (brand) => `
            <option value="${esc(brand)}">
              ${esc(brand)}
            </option>
          `,
        )
        .join("")}
    `;
  }

  // ============================================================
  // FILTROS DOS PRODUTOS
  // ============================================================

  function renderProducts() {
    if (!productsGrid) return;

    const searchElement = document.getElementById("search");
    const categoryElement = document.getElementById("category");
    const brandElement = document.getElementById("brand");
    const minPriceElement = document.getElementById("minPrice");
    const maxPriceElement = document.getElementById("maxPrice");

    const q = searchElement ? searchElement.value.toLowerCase().trim() : "";

    const category = categoryElement ? categoryElement.value : "";

    const brand = brandElement ? brandElement.value : "";

    const min = minPriceElement ? minPriceElement.value : "";

    const max = maxPriceElement ? maxPriceElement.value : "";

    const filteredProducts = products.filter((product) => {
      const matchesSearch =
        !q ||
        [
          product.nome,
          product.marca,
          product.descricao,
          product.categoria,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q),
        );

      const matchesCategory = !category || product.categoria === category;

      const matchesBrand = !brand || product.marca === brand;

      const matchesMinPrice =
        min === "" || Number(product.preco) >= Number(min);

      const matchesMaxPrice =
        max === "" || Number(product.preco) <= Number(max);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });

    productsGrid.innerHTML = filteredProducts.length
      ? filteredProducts.map(productCard).join("")
      : `
        <p class="empty">
          Nenhum produto corresponde aos filtros.
        </p>
      `;
  }

  // ============================================================
  // CARREGAMENTO DOS DADOS DO SUPABASE
  // ============================================================

  async function load() {
    try {
      // Busca produtos e serviços simultaneamente
      const [productsResponse, servicesResponse] = await Promise.all([
        supabaseClient.from("produtos").select("*").order("nome"),

        supabaseClient.from("servicos").select("*").order("nome"),
      ]);

      if (productsResponse.error) {
        throw productsResponse.error;
      }

      if (servicesResponse.error) {
        throw servicesResponse.error;
      }

      products = productsResponse.data || [];
      services = servicesResponse.data || [];

      renderServices();
      renderProducts();
      populateBrands();
    } catch (error) {
      if (servicesGrid) {
        servicesGrid.innerHTML = `
          <p class="empty">
            Não foi possível carregar os serviços.
            ${esc(error.message || "")}
          </p>
        `;
      }

      if (productsGrid) {
        productsGrid.innerHTML = `
          <p class="empty">
            Não foi possível carregar o catálogo.
            Confira a conexão e as políticas de acesso.
          </p>
        `;
      }

      console.error("Erro ao carregar dados:", error);
    }
  }

  // ============================================================
  // EVENTOS DOS FILTROS
  // ============================================================

  ["search", "category", "brand", "minPrice", "maxPrice"].forEach((id) => {
    const element = document.getElementById(id);

    if (element) {
      element.addEventListener("input", renderProducts);
      element.addEventListener("change", renderProducts);
    }
  });

  // ============================================================
  // MENU MOBILE
  // ============================================================

  const menuButton = document.querySelector(".menu");
  const navigation = document.querySelector(".top nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      navigation.classList.toggle("open");
    });
  }

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  load();
})();
