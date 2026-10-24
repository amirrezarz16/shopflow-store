
"use strict";

import {
    addItem,
    changeQuantity,
    removeItem,
    getCartCount,
    calculateSubtotal
} from "./cart.js";

// Product catalog
const products = [
    {
        id: 1,
        name: "Studio Headphones",
        category: "technology",
        categoryLabel: "TECHNOLOGY",
        description: "Comfortable listening for every day.",
        price: 59,
        emoji: "🎧",
        colorClass: "product-art-sand"
    },
    {
        id: 2,
        name: "Daily Backpack",
        category: "accessories",
        categoryLabel: "ACCESSORIES",
        description: "A practical companion for your routine.",
        price: 45,
        emoji: "🎒",
        colorClass: "product-art-blue"
    },
    {
        id: 3,
        name: "Ceramic Mug",
        category: "lifestyle",
        categoryLabel: "LIFESTYLE",
        description: "Make your morning ritual special.",
        price: 18,
        emoji: "☕",
        colorClass: "product-art-green"
    },
    {
        id: 4,
        name: "Ambient Desk Light",
        category: "home",
        categoryLabel: "HOME",
        description: "A softer glow for your workspace.",
        price: 35,
        emoji: "💡",
        colorClass: "product-art-pink"
    }
];

// DOM elements
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const resultsStatus = document.querySelector("#results-status");

const cartCountElement = document.querySelector("#cart-count");
const cartItemsElement = document.querySelector("#cart-items");
const cartTotalElement = document.querySelector("#cart-total");

const CART_STORAGE_KEY = "shopflow-cart-v1";

// Load and validate saved cart data.
function loadCart() {
    try {
        const savedData = localStorage.getItem(CART_STORAGE_KEY);

        if (savedData === null) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData.filter(item =>
            item !== null &&
            typeof item === "object" &&
            Number.isSafeInteger(item.productId) &&
            products.some(product => product.id === item.productId) &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity > 0
        );
    } catch (error) {
        console.warn("Could not load saved cart.", error);
        return [];
    }
}

let cart = loadCart();

// Persist cart data in the browser.
function saveCart() {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );
    } catch (error) {
        console.error("Could not save cart.", error);
    }
}

// Price formatting.
function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(price);
}

// Render the product catalog.
function renderProducts(productList) {
    resultsStatus.textContent =
        `${productList.length} product(s) found`;

    if (productList.length === 0) {
        productGrid.innerHTML = `
            <p class="empty-state">
                No products found. Try another search.
            </p>
        `;
        return;
    }

    productGrid.innerHTML = productList.map(product => `
        <article class="product-card">
            <div class="product-art ${product.colorClass}">
                <span class="product-emoji" aria-hidden="true">
                    ${product.emoji}
                </span>
            </div>

            <div class="product-info">
                <p class="product-category">
                    ${product.categoryLabel}
                </p>

                <h3>${product.name}</h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <p class="product-price">
                    ${formatPrice(product.price)}
                </p>

                <button
                    class="add-to-cart"
                    type="button"
                    data-action="add-to-cart"
                    data-product-id="${product.id}"
                >
                    Add to cart
                </button>
            </div>
        </article>
    `).join("");
}

// Search by name or description and filter by category.
function filterProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    renderProducts(filteredProducts);
}

// Add product to cart.
function handleAddToCart(productId) {
    if (!products.some(product => product.id === productId)) {
        return;
    }

    cart = addItem(cart, productId);

    saveCart();
    renderCart();
}

// Render cart and calculate totals.
function renderCart() {
    cartCountElement.textContent = String(getCartCount(cart));

    cartTotalElement.textContent = formatPrice(
        calculateSubtotal(cart, products)
    );

    if (cart.length === 0) {
        cartItemsElement.innerHTML = `
            <li class="cart-empty">
                Your cart is empty.
            </li>
        `;
        return;
    }

    cartItemsElement.innerHTML = cart.map(item => {
        const product = products.find(
            entry => entry.id === item.productId
        );

        if (!product) {
            return "";
        }

        return `
            <li class="cart-item">
                <div class="cart-item-details">
                    <h3>${product.name}</h3>
                    <p>${formatPrice(product.price)} each</p>
                </div>

                <div class="cart-item-actions">
                    <button
                        type="button"
                        data-action="decrease"
                        data-product-id="${product.id}"
                        aria-label="Decrease ${product.name} quantity"
                    >−</button>

                    <span>${item.quantity}</span>

                    <button
                        type="button"
                        data-action="increase"
                        data-product-id="${product.id}"
                        aria-label="Increase ${product.name} quantity"
                    >+</button>

                    <button
                        type="button"
                        class="remove-item"
                        data-action="remove"
                        data-product-id="${product.id}"
                    >Remove</button>
                </div>

                <strong class="cart-item-total">
                    ${formatPrice(product.price * item.quantity)}
                </strong>
            </li>
        `;
    }).join("");
}

// Update cart quantity.
function handleQuantityChange(productId, amount) {
    cart = changeQuantity(cart, productId, amount);

    saveCart();
    renderCart();
}

// Remove a product from cart.
function handleRemoveFromCart(productId) {
    cart = removeItem(cart, productId);

    saveCart();
    renderCart();
}

// Search and filter events.
searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);

// Product button events.
productGrid.addEventListener("click", event => {
    const button = event.target.closest(
        '[data-action="add-to-cart"]'
    );

    if (!button || button.disabled) {
        return;
    }

    const productId = Number(button.dataset.productId);

    handleAddToCart(productId);

    button.textContent = "Added ✓";
    button.disabled = true;

    window.setTimeout(() => {
        button.textContent = "Add to cart";
        button.disabled = false;
    }, 700);
});

// Cart button events.
cartItemsElement.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.productId);

    switch (button.dataset.action) {
        case "increase":
            handleQuantityChange(productId, 1);
            break;

        case "decrease":
            handleQuantityChange(productId, -1);
            break;

        case "remove":
            handleRemoveFromCart(productId);
            break;
    }
});

// Initial rendering.
filterProducts();
renderCart();
