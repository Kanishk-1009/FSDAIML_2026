let products = [];
const cart = JSON.parse(localStorage.getItem("ecommerceCart") || "{}");

const productContainer = document.getElementById("products-container");
const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const cartCount = document.getElementById("cart-count");
const checkoutButton = document.getElementById("checkout-button");
const checkoutModal = document.getElementById("checkout-modal");
const closeCheckout = document.getElementById("close-checkout");
const checkoutContent = document.getElementById("checkout-content");
const checkoutEmpty = document.getElementById("checkout-empty");
const checkoutItems = document.getElementById("checkout-items");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");
const orderSuccess = document.getElementById("order-success");

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);

const getCartItems = () => products
    .filter((product) => (cart[product.id] || 0) > 0)
    .map((product) => ({
        product,
        quantity: cart[product.id],
        subtotal: product.price * cart[product.id]
    }));

const getCartTotal = () =>
    getCartItems().reduce((total, item) => total + item.subtotal, 0);

const getCartCount = () =>
    getCartItems().reduce((total, item) => total + item.quantity, 0);

const saveCart = () => {
    localStorage.setItem("ecommerceCart", JSON.stringify(cart));
};

const updateCartSummary = () => {
    cartCount.textContent = getCartCount();
    saveCart();
};

const createProductCard = (product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const img = document.createElement("img");
    img.src = product.thumbnail;
    img.alt = product.title;
    img.loading = "lazy";

    const title = document.createElement("h2");
    title.textContent = product.title;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = formatCurrency(product.price);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const decrementButton = document.createElement("button");
    decrementButton.type = "button";
    decrementButton.textContent = "−";
    decrementButton.setAttribute("aria-label", `Decrease ${product.title} quantity`);

    const quantity = document.createElement("span");
    quantity.className = "quantity";
    quantity.textContent = "Add";

    const incrementButton = document.createElement("button");
    incrementButton.type = "button";
    incrementButton.textContent = "+";
    incrementButton.setAttribute("aria-label", `Increase ${product.title} quantity`);

    const updateQuantity = () => {
        const value = cart[product.id] || 0;
        quantity.textContent = value === 0 ? "Add" : value;
        updateCartSummary();
    };

    incrementButton.addEventListener("click", () => {
        cart[product.id] = (cart[product.id] || 0) + 1;
        updateQuantity();
    });

    decrementButton.addEventListener("click", () => {
        const current = cart[product.id] || 0;
        if (current > 0) cart[product.id] = current - 1;
        updateQuantity();
    });

    controls.append(decrementButton, quantity, incrementButton);
    card.append(img, title, price, controls);
    return card;
};

const renderCheckout = () => {
    const items = getCartItems();
    const hasItems = items.length > 0;

    checkoutEmpty.hidden = hasItems;
    checkoutContent.hidden = !hasItems;
    orderSuccess.hidden = true;

    if (!hasItems) return;

    checkoutItems.replaceChildren(...items.map(({ product, quantity, subtotal }) => {
        const row = document.createElement("div");
        row.className = "checkout-item";
        row.innerHTML = `
            <span>${product.title} × ${quantity}</span>
            <strong>${formatCurrency(subtotal)}</strong>
        `;
        return row;
    }));

    checkoutTotal.textContent = formatCurrency(getCartTotal());
};

const openCheckout = () => {
    renderCheckout();
    checkoutModal.hidden = false;
    document.body.classList.add("modal-open");
};

const closeCheckoutModal = () => {
    checkoutModal.hidden = true;
    document.body.classList.remove("modal-open");
};

checkoutButton.addEventListener("click", openCheckout);
closeCheckout.addEventListener("click", closeCheckoutModal);

checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) closeCheckoutModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !checkoutModal.hidden) closeCheckoutModal();
});

checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (getCartCount() === 0) {
        renderCheckout();
        return;
    }

    if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    const customerName = document.getElementById("full-name").value.trim();
    const payment = new FormData(checkoutForm).get("payment");
    const total = getCartTotal();

    Object.keys(cart).forEach((id) => delete cart[id]);
    saveCart();
    updateCartSummary();
    checkoutForm.reset();
    checkoutContent.hidden = true;
    checkoutEmpty.hidden = true;
    orderSuccess.hidden = false;
    orderSuccess.innerHTML = `
        <div class="success-icon">✓</div>
        <h3>Order Placed Successfully!</h3>
        <p>Thank you, <strong>${customerName}</strong>.</p>
        <p>Order ID: <strong>${orderNumber}</strong></p>
        <p>Payment: <strong>${payment}</strong></p>
        <p>Total: <strong>${formatCurrency(total)}</strong></p>
        <button id="continue-shopping" class="place-order-button" type="button">Continue Shopping</button>
    `;

    document.getElementById("continue-shopping").addEventListener("click", closeCheckoutModal);
});

const getProductsData = async () => {
    try {
        const response = await fetch("https://dummyjson.com/products?limit=30");
        if (!response.ok) throw new Error(`Unable to load products (${response.status}).`);

        const data = await response.json();
        if (!Array.isArray(data.products)) throw new Error("Invalid product data received from the API.");

        products = data.products;
        productContainer.replaceChildren(...products.map(createProductCard));
        loadingMessage.hidden = true;
        updateCartSummary();

        if (new URLSearchParams(window.location.search).get("checkout") === "true") {
            openCheckout();
        }
    } catch (error) {
        console.error("Product loading error:", error);
        loadingMessage.hidden = true;
        errorMessage.hidden = false;
        errorMessage.textContent =
            "Products could not be loaded. Please check your internet connection and refresh the page.";
    }
};

getProductsData();
