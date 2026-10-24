
"use strict";

// Validate the cart input.
function assertCart(cart) {
    if (!Array.isArray(cart)) {
        throw new TypeError("Cart must be an array.");
    }
}

// Validate product IDs.
function assertProductId(productId) {
    if (!Number.isSafeInteger(productId) || productId <= 0) {
        throw new RangeError("Product ID must be a positive integer.");
    }
}

// Add a new product or increase its existing quantity.
export function addItem(cart, productId) {
    assertCart(cart);
    assertProductId(productId);

    const existingItem = cart.find(
        item => item.productId === productId
    );

    if (existingItem) {
        return cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
    }

    return [
        ...cart,
        { productId, quantity: 1 }
    ];
}

// Increase or decrease a product's quantity.
export function changeQuantity(cart, productId, amount) {
    assertCart(cart);
    assertProductId(productId);

    if (!Number.isSafeInteger(amount) || amount === 0) {
        throw new RangeError("Quantity change must be a non-zero integer.");
    }

    const existingItem = cart.find(
        item => item.productId === productId
    );

    if (!existingItem) {
        return cart;
    }

    const newQuantity = existingItem.quantity + amount;

    if (newQuantity <= 0) {
        return removeItem(cart, productId);
    }

    return cart.map(item =>
        item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
    );
}

// Remove a product completely.
export function removeItem(cart, productId) {
    assertCart(cart);
    assertProductId(productId);

    return cart.filter(
        item => item.productId !== productId
    );
}

// Calculate the total number of individual units.
export function getCartCount(cart) {
    assertCart(cart);

    return cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
}

// Calculate the subtotal using product prices.
export function calculateSubtotal(cart, products) {
    assertCart(cart);

    if (!Array.isArray(products)) {
        throw new TypeError("Products must be an array.");
    }

    return cart.reduce((total, item) => {
        const product = products.find(
            entry => entry.id === item.productId
        );

        if (!product) {
            return total;
        }

        return total + product.price * item.quantity;
    }, 0);
}
