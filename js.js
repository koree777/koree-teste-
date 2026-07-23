/* ============================================
   Carrinho de compras — Hidráulica São Gabriel
   Persistência via localStorage
   ============================================ */

const CART_KEY = 'hidraulica_sao_gabriel_cart';

// ----- Estado -----
let cart = loadCart();

// ----- Elementos do DOM -----
const cartToggle   = document.getElementById('cart-toggle');
const cartOverlay  = document.getElementById('cart-overlay');
const cartSidebar  = document.getElementById('cart-sidebar');
const cartClose    = document.getElementById('cart-close');
const cartItemsEl  = document.getElementById('cart-items');
const cartCountEl  = document.getElementById('cart-count');
const cartTotalEl  = document.getElementById('cart-total');

// ----- Funções de persistência -----
function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error('Erro ao salvar carrinho:', e);
    }
}

// ----- Formatação de preço (R$ 1.234,56) -----
function formatPrice(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// ----- Adicionar item ao carrinho -----
function addToCart(product) {
    const existing = cart.find(item => item.name === product.name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            img: product.img,
            qty: 1
        });
    }

    saveCart();
    renderCart();
    openCart();
}

// ----- Alterar quantidade -----
function changeQty(name, delta) {
    const item = cart.find(item => item.name === name);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== name);
    }

    saveCart();
    renderCart();
}

// ----- Remover item -----
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    renderCart();
}

// ----- Renderizar carrinho na tela -----
function renderCart() {
    // Contagem total de itens
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalItems;

    // Lista de itens
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<div class="cart-empty">Seu carrinho está vazio.</div>';
    } else {
        cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item__img" src="${item.img}" alt="${item.name}">
                <div class="cart-item__info">
                    <span class="cart-item__name">${item.name}</span>
                    <span class="cart-item__price">${formatPrice(item.price)}</span>
                    <div class="cart-item__controls">
                        <button class="cart-item__qty-btn" data-action="decrease" data-name="${item.name}">−</button>
                        <span class="cart-item__qty">${item.qty}</span>
                        <button class="cart-item__qty-btn" data-action="increase" data-name="${item.name}">+</button>
                        <button class="cart-item__remove" data-action="remove" data-name="${item.name}">Remover</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Total geral
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotalEl.textContent = formatPrice(total);
}

// ----- Abrir / fechar sidebar -----
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

// ----- Event listeners -----

// Abrir carrinho
cartToggle.addEventListener('click', openCart);

// Fechar carrinho (botão X e clique fora)
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Botões "Comprar" — adiciona produto ao carrinho
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const product = {
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            img: button.dataset.img
        };
        addToCart(product);
    });
});

// Botões dentro do carrinho (+ / − / remover) — delegação de evento
cartItemsEl.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const name = e.target.dataset.name;

    if (!action || !name) return;

    if (action === 'increase') changeQty(name, 1);
    if (action === 'decrease') changeQty(name, -1);
    if (action === 'remove')   removeFromCart(name);
});

// ----- Inicialização -----
renderCart();
