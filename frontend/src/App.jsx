
import { useEffect, useState } from "react";

import {
  addItem,
  changeQuantity,
  removeItem,
  getCartCount,
  calculateSubtotal,
} from "../../cart.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const PRODUCT_PRESENTATION = {
  1: {
    emoji: "🎧",
    colorClass: "product-art-sand",
  },
  2: {
    emoji: "🎒",
    colorClass: "product-art-blue",
  },
  3: {
    emoji: "☕",
    colorClass: "product-art-green",
  },
  4: {
    emoji: "💡",
    colorClass: "product-art-pink",
  },
};

const DEFAULT_PRESENTATION = {
  emoji: "🛍️",
  colorClass: "product-art-sand",
};

const CART_STORAGE_KEY = "shopflow-cart-v1";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function loadCart() {
  try {
    const savedData = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedData) {
      return [];
    }

    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData.filter(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        Number.isSafeInteger(item.productId) &&
        item.productId > 0 &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch (error) {
    console.warn("Could not load saved cart.", error);
    return [];
  }
}

export default function App() {
  const [cart, setCart] = useState(loadCart);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");


  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/products/`
        );

        if (!response.ok) {
          throw new Error(
            `API request failed: HTTP ${response.status}`
          );
        }

        const data = await response.json();

        const apiProducts = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.value)
              ? data.value
              : null;

        if (!apiProducts) {
          throw new Error("Unexpected products API response.");
        }

        const normalizedProducts = apiProducts.map((product) => {
          const id = Number(product.id);
          const presentation =
            PRODUCT_PRESENTATION[id] ?? DEFAULT_PRESENTATION;

          return {
            ...product,
            id,
            price: Number(product.price),
            categoryLabel: String(product.category).toUpperCase(),
            emoji: presentation.emoji,
            colorClass: presentation.colorClass,
          };
        });

        const invalidProduct = normalizedProducts.some(
          (product) =>
            !Number.isSafeInteger(product.id) ||
            product.id <= 0 ||
            typeof product.name !== "string" ||
            !Number.isFinite(product.price) ||
            product.price < 0
        );

        if (invalidProduct) {
          throw new Error("The API returned invalid product data.");
        }

        if (cancelled) return;

        setProducts(normalizedProducts);

        // Keep only cart items that still exist in the API.
        setCart((currentCart) =>
          currentCart.filter((item) =>
            normalizedProducts.some(
              (product) => product.id === item.productId
            )
          )
        );
      } catch (error) {
        if (!cancelled) {
          setProductsError(
            error instanceof Error
              ? error.message
              : "Could not load products."
          );
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save cart.", error);
    }
  }, [cart]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const cartCount = getCartCount(cart);
  const subtotal = calculateSubtotal(cart, products);

  function handleAddToCart(productId) {
    setCart((currentCart) => addItem(currentCart, productId));
  }

  function handleQuantityChange(productId, amount) {
    setCart((currentCart) =>
      changeQuantity(currentCart, productId, amount)
    );
  }

  function handleRemoveFromCart(productId) {
    setCart((currentCart) => removeItem(currentCart, productId));
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <a className="logo" href="#" aria-label="ShopFlow home">
            <span className="logo-mark">S</span>
            <span>ShopFlow</span>
          </a>

          <nav className="navigation" aria-label="Main navigation">
            <a href="#products">Products</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a className="nav-link cart-link" href="#cart">
              Cart (<span aria-live="polite">{cartCount}</span>)
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">CURATED EVERYDAY ESSENTIALS</p>

              <h1>
                Good design.
                <span>Better everyday.</span>
              </h1>

              <p className="hero-description">
                Discover thoughtfully selected products designed
                to make everyday life simpler and more enjoyable.
              </p>

              <a className="button" href="#products">
                Explore the collection
                <span aria-hidden="true">→</span>
              </a>

              <p className="hero-note">
                A learning project built with HTML, CSS, JavaScript and React.
              </p>
            </div>

            <div className="hero-art" aria-label="Decorative product display">
              <div className="art-circle" />

              <div className="art-card art-card-main">
                <span className="art-emoji" aria-hidden="true">🎧</span>
                <span className="art-label">Thoughtful design</span>
              </div>

              <div className="art-card art-card-small">
                <span aria-hidden="true">✦</span>
                Made for everyday
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" aria-label="Store highlights">
          <div className="container benefits-grid">
            <article className="benefit">
              <span className="benefit-icon" aria-hidden="true">✦</span>
              <div>
                <h2>Curated products</h2>
                <p>Simple, useful and thoughtful.</p>
              </div>
            </article>

            <article className="benefit">
              <span className="benefit-icon" aria-hidden="true">◇</span>
              <div>
                <h2>Clean design</h2>
                <p>A comfortable shopping experience.</p>
              </div>
            </article>

            <article className="benefit">
              <span className="benefit-icon" aria-hidden="true">↗</span>
              <div>
                <h2>Always improving</h2>
                <p>Built step by step with code.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE COLLECTION</p>
                <h2>Everyday favorites</h2>
              </div>

              <p className="section-description">
                Search and explore our sample product catalog.
              </p>
            </div>

            <div className="product-controls">
              <div className="search-control">
                <label htmlFor="search-input">Search products</label>
                <input
                  id="search-input"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Try headphones..."
                  autoComplete="off"
                />
              </div>

              <div className="filter-control">
                <label htmlFor="category-filter">Category</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="all">All categories</option>
                  <option value="technology">Technology</option>
                  <option value="accessories">Accessories</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="home">Home</option>
                </select>
              </div>
            </div>

            <p className="results-status" aria-live="polite">
            {productsLoading
              ? "Loading products..."
              : productsError
                ? "Products unavailable"
                : `${filteredProducts.length} product(s) found`}
          </p>


            <div className="product-grid">
              {productsLoading ? (
                <p className="empty-state" role="status">
                  Loading products from ShopFlow API...
                </p>
              ) : productsError ? (
                <p className="empty-state" role="alert">
                  Could not load products: {productsError}
                  {" "}
                  Make sure the Django server is running.
                </p>
              ) : filteredProducts.length === 0 ? (
                <p className="empty-state">
                  No products found. Try another search.
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className={`product-art ${product.colorClass}`}>
                      <span className="product-emoji" aria-hidden="true">
                        {product.emoji}
                      </span>
                    </div>

                    <div className="product-info">
                      <p className="product-category">
                        {product.categoryLabel}
                      </p>

                      <h3>{product.name}</h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <p className="product-price">
                        {formatPrice(product.price)}
                      </p>

                      <button
                        className="add-to-cart"
                        type="button"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>


            <section
              className="cart-section"
              id="cart"
              aria-labelledby="cart-heading"
            >
              <div className="cart-section-heading">
                <p className="eyebrow">YOUR SELECTION</p>
                <h2 id="cart-heading">Shopping cart</h2>
              </div>

              <div className="cart-panel">
                <ul className="cart-items" aria-live="polite">
                  {cart.length === 0 ? (
                    <li className="cart-empty">Your cart is empty.</li>
                  ) : (
                    cart.map((item) => {
                      const product = products.find(
                        (entry) => entry.id === item.productId
                      );

                      if (!product) {
                        return null;
                      }

                      return (
                        <li className="cart-item" key={item.productId}>
                          <div className="cart-item-details">
                            <h3>{product.name}</h3>
                            <p>{formatPrice(product.price)} each</p>
                          </div>

                          <div className="cart-item-actions">
                            <button
                              type="button"
                              aria-label={`Decrease ${product.name} quantity`}
                              onClick={() =>
                                handleQuantityChange(product.id, -1)
                              }
                            >
                              −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              aria-label={`Increase ${product.name} quantity`}
                              onClick={() =>
                                handleQuantityChange(product.id, 1)
                              }
                            >
                              +
                            </button>

                            <button
                              type="button"
                              className="remove-item"
                              onClick={() =>
                                handleRemoveFromCart(product.id)
                              }
                            >
                              Remove
                            </button>
                          </div>

                          <strong className="cart-item-total">
                            {formatPrice(product.price * item.quantity)}
                          </strong>
                        </li>
                      );
                    })
                  )}
                </ul>

                <div className="cart-summary">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <p className="cart-note">
                  Demo only — no real orders or payments are processed.
                </p>
              </div>
            </section>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="container about-content">
            <p className="eyebrow">ABOUT SHOPFLOW</p>
            <h2>Small details make a difference.</h2>
            <p>
              ShopFlow is a portfolio project growing toward a functional
              online store with a Python backend, React frontend and
              useful business automations.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="container footer-inner">
          <a className="logo footer-logo" href="#">
            <span className="logo-mark">S</span>
            <span>ShopFlow</span>
          </a>

          <p>Portfolio demo — no real orders or payments are processed.</p>
          <p>Built step by step with code.</p>
        </div>
      </footer>
    </>
  );
}
