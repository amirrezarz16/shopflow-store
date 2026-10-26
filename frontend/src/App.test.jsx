
import "@testing-library/jest-dom/vitest";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import App from "./App.jsx";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("ShopFlow React storefront", () => {
  it("renders all four products", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Studio Headphones" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Daily Backpack" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Ceramic Mug" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Ambient Desk Light" })
    ).toBeInTheDocument();
  });

  it("searches products by name", () => {
    render(<App />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search products" }),
      { target: { value: "headphones" } }
    );

    expect(
      screen.getByRole("heading", { name: "Studio Headphones" })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Daily Backpack" })
    ).not.toBeInTheDocument();
  });

  it("filters products by category", () => {
    render(<App />);

    fireEvent.change(
      screen.getByRole("combobox", { name: "Category" }),
      { target: { value: "technology" } }
    );

    expect(
      screen.getByRole("heading", { name: "Studio Headphones" })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Daily Backpack" })
    ).not.toBeInTheDocument();
  });

  it("adds a product and updates the cart count", () => {
    render(<App />);

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

    expect(within(navigation).getByText("1")).toBeInTheDocument();

    const cart = screen.getByRole("region", {
      name: "Shopping cart",
    });

    expect(
      within(cart).getByRole("heading", {
        name: "Studio Headphones",
      })
    ).toBeInTheDocument();

    expect(
      within(cart).getAllByText("$59.00", { exact: true })
    ).toHaveLength(2);
  });

  it("changes quantity and removes an item", () => {
    render(<App />);

    const productCard = screen
      .getByRole("heading", { name: "Studio Headphones" })
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

    expect(within(cart).getByText("2")).toBeInTheDocument();

    fireEvent.click(
      within(cart).getByRole("button", {
        name: "Decrease Studio Headphones quantity",
      })
    );

    expect(within(cart).getByText("1")).toBeInTheDocument();

    fireEvent.click(
      within(cart).getByRole("button", { name: "Remove" })
    );

    expect(
      within(cart).getByText("Your cart is empty.")
    ).toBeInTheDocument();
  });

  it("restores a saved cart from localStorage", () => {
    localStorage.setItem(
      "shopflow-cart-v1",
      JSON.stringify([{ productId: 1, quantity: 2 }])
    );

    render(<App />);

    const cart = screen.getByRole("region", {
      name: "Shopping cart",
    });

    expect(within(cart).getByText("2")).toBeInTheDocument();

    expect(
      within(cart).getAllByText("$118.00", { exact: true })
    ).toHaveLength(2);
  });
});
