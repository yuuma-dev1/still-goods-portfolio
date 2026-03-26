"use strict";

document.addEventListener("DOMContentLoaded", () => {
  let allProducts = [];
  let lastFocusedElement = null;

  const productGrid = document.querySelector("#product-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortSelect = document.querySelector("#sort-select");
  const modal = document.querySelector("#product-modal");
  const modalBody = document.querySelector("#modal-body");
  const closeBtn = document.querySelector(".close-modal");
  const modalOverlay = document.querySelector(".modal-overlay");

  async function fetchProducts() {
    try {
      productGrid.innerHTML = "<p>Loading items...</p>";

      const response = await fetch("products.json");
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      allProducts = await response.json();
      updateList();
    } catch (error) {
      productGrid.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }

  function renderProducts(products) {
    if (products.length === 0) {
      productGrid.innerHTML = "<p>該当する雑貨が見つかりませんでした。</p>";
      return;
    }

    productGrid.innerHTML = products.map((item) => {
      return `
        <article class="product-card" data-id="${item.id}" tabindex="0" role="button" aria-label="${item.name}の詳細を見る">
          <img src="${item.image}" alt="${item.name}">
          <h3>${item.name}</h3>

          <div class="card-bottom">
            <p class="price">¥${item.price.toLocaleString()}</p>
            <span class="category-tag">${item.category}</span>
          </div>
        </article>
      `;
    }).join("");

    const cards = productGrid.querySelectorAll(".product-card");

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const id = Number(card.dataset.id);
        openModal(id);
      });

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const id = Number(card.dataset.id);
          openModal(id);
        }
      });
    });
  }

  function updateList() {
    const activeButton = document.querySelector(".filter-btn.active");
    const activeCategory = activeButton ? activeButton.dataset.category : "all";
    const sortType = sortSelect.value;

    let filtered = activeCategory === "all"
      ? [...allProducts]
      : allProducts.filter((product) => product.category === activeCategory);

    if (sortType === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortType === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
  }

  function openModal(id) {
    const item = allProducts.find((product) => product.id === id);
    if (!item) {
      return;
    }

    lastFocusedElement = document.activeElement;

    modalBody.innerHTML = `
      <h2 id="modal-title">${item.name}</h2>
      <img src="${item.image}" alt="${item.name}">
      <p>${item.description}</p>
      <p class="modal-price">Price: ¥${item.price.toLocaleString()}</p>
    `;

    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalBody.innerHTML = "";

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      updateList();
    });
  });

  sortSelect.addEventListener("change", updateList);
  closeBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-visible")) {
      closeModal();
    }
  });

  fetchProducts();
});
