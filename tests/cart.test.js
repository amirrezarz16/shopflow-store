
import { test } from "node:test";
import assert from "node:assert/strict";

import {
    addItem,
    changeQuantity,
    removeItem,
    getCartCount,
    calculateSubtotal
} from "../cart.js";

const products = [
    { id: 1, price: 59 },
    { id: 2, price: 18 }
];

test("addItem adds a new product", () => {
    assert.deepEqual(
        addItem([], 1),
        [{ productId: 1, quantity: 1 }]
    );
});

test("addItem increments an existing product", () => {
    const cart = [{ productId: 1, quantity: 1 }];

    assert.deepEqual(
        addItem(cart, 1),
        [{ productId: 1, quantity: 2 }]
    );
});

test("addItem does not mutate the original cart", () => {
    const cart = [{ productId: 1, quantity: 1 }];

    addItem(cart, 1);

    assert.deepEqual(
        cart,
        [{ productId: 1, quantity: 1 }]
    );
});

test("changeQuantity increases quantity", () => {
    const cart = [{ productId: 1, quantity: 1 }];

    assert.deepEqual(
        changeQuantity(cart, 1, 2),
        [{ productId: 1, quantity: 3 }]
    );
});

test("changeQuantity decreases quantity", () => {
    const cart = [{ productId: 1, quantity: 3 }];

    assert.deepEqual(
        changeQuantity(cart, 1, -1),
        [{ productId: 1, quantity: 2 }]
    );
});

test("changeQuantity removes item at zero", () => {
    const cart = [{ productId: 1, quantity: 1 }];

    assert.deepEqual(
        changeQuantity(cart, 1, -1),
        []
    );
});

test("removeItem removes only the selected product", () => {
    const cart = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
    ];

    assert.deepEqual(
        removeItem(cart, 1),
        [{ productId: 2, quantity: 1 }]
    );
});

test("getCartCount sums individual units", () => {
    const cart = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 }
    ];

    assert.equal(getCartCount(cart), 5);
});

test("calculateSubtotal calculates the correct total", () => {
    const cart = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
    ];

    assert.equal(calculateSubtotal(cart, products), 136);
});

test("calculateSubtotal ignores unknown product IDs", () => {
    const cart = [
        { productId: 1, quantity: 1 },
        { productId: 999, quantity: 4 }
    ];

    assert.equal(calculateSubtotal(cart, products), 59);
});

test("addItem rejects an invalid product ID", () => {
    assert.throws(
        () => addItem([], 0),
        RangeError
    );
});
