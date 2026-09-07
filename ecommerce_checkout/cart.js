let products = [];
const cart = JSON.parse(localStorage.getItem("ecommerceCart") || "{}");

const loading = document.getElementById("cart-loading");
const error = document.getElementById("cart-error");
const content = document.getElementById("cart-content");
const emptyCart = document.getElementById("empty-cart");
const cartItems = document.getElementById("cart-items");
const cartPageCount = document.getElementById("cart-page-count");
const summaryCount = document.getElementById("summary-count");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal = document.getElementById("summary-total");
const checkoutButton = document.getElementById("cart-checkout");
const clearCartButton = document.getElementById("clear-cart");

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);

const saveCart = () =>
    localStorage.setItem("ecommerceCart", JSON.stringify(cart));

const getItems = () => products
    .filter((product) => (cart[product.id] || 0) > 0)
    .map((product) => ({
        product,
        quantity: cart[product.id],
        subtotal: product.price * cart[product.id]
    }));

const render = () => {
    const items = getItems();
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    loading.hidden = true;
    error.hidden = true;
    content.hidden = items.length === 0;
    emptyCart.hidden = items.length !== 0;

    cartPageCount.textContent = count;
    summaryCount.textContent = count;
    summarySubtotal.textContent = formatCurrency(total);
    summaryTotal.textContent = formatCurrency(total);

    if (items.length === 0) return;

    cartItems.replaceChildren(...items.map(({ product, quantity, subtotal }) => {
        const row = document.createElement("article");
        row.className = "cart-item";

        const img = document.createElement("img");
        img.src = product.thumbnail;
        img.alt = product.title;

        const info = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = product.title;
        const price = document.createElement("p");
        price.textContent = formatCurrency(product.price);

        const actions = document.createElement("div");
        actions.className = "cart-item-actions";

        const minus = document.createElement("button");
        minus.className = "qty-btn";
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", `Decrease ${product.title} quantity`);
        minus.addEventListener("click", () => {
            cart[product.id]--;
            if (cart[product.id] <= 0) delete cart[product.id];
            saveCart();
            render();
        });

        const qty = document.createElement("strong");
        qty.textContent = quantity;

        const plus = document.createElement("button");
        plus.className = "qty-btn";
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", `Increase ${product.title} quantity`);
        plus.addEventListener("click", () => {
            cart[product.id]++;
            saveCart();
            render();
        });

        const remove = document.createElement("button");
        remove.className = "remove-btn";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            delete cart[product.id];
            saveCart();
            render();
        });

        actions.append(minus, qty, plus, remove);
        info.append(title, price, actions);

        const itemTotal = document.createElement("div");
        itemTotal.className = "cart-item-total";
        itemTotal.textContent = formatCurrency(subtotal);

        row.append(img, info, itemTotal);
        return row;
    }));
};

clearCartButton.addEventListener("click", () => {
    if (!confirm("Remove all items from your cart?")) return;
    Object.keys(cart).forEach((id) => delete cart[id]);
    saveCart();
    render();
});

checkoutButton.addEventListener("click", () => {
    if (getItems().length === 0) return;
    window.location.href = "index.html?checkout=true";
});

const loadProducts = async () => {
    try {
        const response = await fetch("https://dummyjson.com/products?limit=30");
        if (!response.ok) throw new Error(`Unable to load products (${response.status}).`);

        const data = await response.json();
        if (!Array.isArray(data.products)) throw new Error("Invalid product data.");

        products = data.products;
        render();
    } catch (err) {
        console.error(err);
        loading.hidden = true;
        error.hidden = false;
        error.textContent = "The cart could not be loaded. Please check your internet connection and refresh the page.";
    }
};

loadProducts();
