
import "@testing-library/jest-dom/vitest";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import App from "./App.jsx";

const API_PRODUCTS = [
  {
    id: 1,
    name: "Studio Headphones",
    category: "technology",
    description: "Comfortable listening for every day.",
    price: "59.00",
    image_url: "",
  },
  {
    id: 2,
    name: "Daily Backpack",
    category: "accessories",
    description: "A practical companion for your routine.",
    price: "45.00",
    image_url: "",
  },
  {
    id: 3,
    name: "Ceramic Mug",
    category: "lifestyle",
    description: "Make your morning ritual special.",
    price: "18.00",
    image_url: "",
  },
  {
    id: 4,
    name: "Ambient Desk Light",
    category: "home",
    description: "A softer glow for your workspace.",
    price: "35.00",
    image_url: "",
  },
];

beforeEach(() => {
  localStorage.clear();

  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => API_PRODUCTS,
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function renderLoadedApp() {
  render(<App />);

  // Wait until React has received and rendered the API products.
  await screen.findByRole("heading", {
    name: "Studio Headphones",
  });
}

describe("ShopFlow React storefront", () => {
  it("renders all four products", async () => {
    await renderLoadedApp();

    for (const product of API_PRODUCTS) {
      expect(
        screen.getByRole("heading", { name: product.name })
      ).toBeInTheDocument();
    }

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/products/"
    );
  });

  it("searches products by name", async () => {
    await renderLoadedApp();

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search products",
      }),
      { target: { value: "headphones" } }
    );

    expect(
      screen.getByRole("heading", {
        name: "Studio Headphones",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Daily Backpack",
      })
    ).not.toBeInTheDocument();
  });

  it("filters products by category", async () => {
    await renderLoadedApp();

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Category",
      }),
      { target: { value: "technology" } }
    );

    expect(
      screen.getByRole("heading", {
        name: "Studio Headphones",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Daily Backpack",
      })
    ).not.toBeInTheDocument();
  });

  it("adds a product and updates the cart count", async () => {
    await renderLoadedApp();

    const productHeading = screen.getByRole("heading", {
      name: "Studio Headphones",
    });

    const productCard = productHeading.closest("article");

    fireEvent.click(
      within(productCard).getByRole("button", {
        name: "Add to cart",
      })
    );

    const navigation = screen.getByRole("navigation", {
      name: "Main navigation",
    });

    expect(
      within(navigation).getByText("1")
    ).toBeInTheDocument();

    const cart = screen.getByRole("region", {
      name: "Shopping cart",
    });

    expect(
      within(cart).getByRole("heading", {
        name: "Studio Headphones",
      })
    ).toBeInTheDocument();

    // Unit price, row total and cart subtotal.
    expect(
      within(cart).getAllByText("$59.00", {
        exact: true,
      })
    ).toHaveLength(2);
  });

  it("changes quantity and removes an item", async () => {
    await renderLoadedApp();

    const productCard = screen
      .getByRole("heading", {
        name: "Studio Headphones",
      })
      .closest("article");

    fireEvent.click(
      within(productCard).getByRole("button", {
        name: "Add to cart",
      })
    );

    const cart = screen.getByRole("region", {
      name: "Shopping cart",
    });

    fireEvent.click(
      within(cart).getByRole("button", {
        name: "Increase Studio Headphones quantity",
      })
    );

    expect(
      within(cart).getByText("2")
    ).toBeInTheDocument();

    fireEvent.click(
      within(cart).getByRole("button", {
        name: "Decrease Studio Headphones quantity",
      })
    );

    expect(
      within(cart).getByText("1")
    ).toBeInTheDocument();

    fireEvent.click(
      within(cart).getByRole("button", {
        name: "Remove",
      })
    );

    expect(
      within(cart).getByText("Your cart is empty.")
    ).toBeInTheDocument();
  });

  it("restores a saved cart from localStorage", async () => {
    localStorage.setItem(
      "shopflow-cart-v1",
      JSON.stringify([
        { productId: 1, quantity: 2 },
      ])
    );

    render(<App />);

    const cart = screen.getByRole("region", {
      name: "Shopping cart",
    });

    await within(cart).findByRole("heading", {
      name: "Studio Headphones",
    });

    expect(
      within(cart).getByText("2")
    ).toBeInTheDocument();

    expect(
      within(cart).getAllByText("$118.00", {
        exact: true,
      })
    ).toHaveLength(2);
  });
});
