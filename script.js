"use strict";
class SnackCentre {
    formButton;
    form;
    productsList;
    currentSnackCard = null;
    userRoleSelect;
    addButton;
    userRole;
    viewOneSelect;
    allProducts = [];
    constructor() {
        this.formButton = document.querySelector('.add-button');
        this.form = document.querySelector('form');
        this.productsList = document.querySelector('.products-list');
        this.userRoleSelect = document.getElementById('user-role');
        this.addButton = document.querySelector('.add-button');
        this.viewOneSelect = document.getElementById('view-one-select');
        this.userRole = this.userRoleSelect.value;
        this.setup();
        this.loadProductsFromAPI();
    }
    setup() {
        this.formButton.addEventListener('click', () => this.showForm());
        this.form.addEventListener('submit', (event) => this.saveProduct(event));
        this.userRoleSelect.addEventListener('change', () => this.updateUserRole());
        this.viewOneSelect.addEventListener('change', () => this.filterProducts());
        this.updateUserRole();
    }
    showForm() {
        this.form.style.display = 'block';
        this.form.reset();
        this.currentSnackCard = null;
    }
    async saveProduct(event) {
        event.preventDefault();
        const snackNameInput = document.getElementById('snack-name');
        const flavourInput = document.getElementById('flavour');
        const priceInput = document.getElementById('price');
        const imageUrlInput = document.getElementById('image-url');
        const snackName = snackNameInput.value.trim();
        const flavour = flavourInput.value.trim();
        const price = priceInput.value.trim();
        const imageUrl = imageUrlInput.value.trim();
        if (snackName && flavour && price && imageUrl) {
            const product = { snackName, flavour, price, imageUrl };
            if (this.currentSnackCard) {
                await this.updateProductInAPI(this.currentSnackCard.dataset.id, product);
                this.updateCard(this.currentSnackCard, snackName, flavour, price, imageUrl);
            }
            else {
                const createdProduct = await this.saveProductToAPI(product);
                const snackCard = this.createCard(createdProduct.id, snackName, flavour, price, imageUrl);
                this.productsList.appendChild(snackCard);
                this.allProducts.push({ id: createdProduct.id, snackName, flavour, price, imageUrl });
                this.updateViewOneSelect();
            }
            this.form.reset();
            this.form.style.display = 'none';
        }
    }
    createCard(id, snackName, flavour, price, imageUrl) {
        const snackCard = document.createElement('div');
        snackCard.classList.add('snack-card');
        snackCard.dataset.id = id;
        const img = document.createElement('img');
        img.src = imageUrl;
        const namePara = document.createElement('p');
        namePara.textContent = snackName;
        const flavourPara = document.createElement('p');
        flavourPara.textContent = flavour;
        const pricePara = document.createElement('p');
        pricePara.textContent = `Ksh.${price}`;
        snackCard.appendChild(img);
        snackCard.appendChild(namePara);
        snackCard.appendChild(flavourPara);
        snackCard.appendChild(pricePara);
        if (this.userRole === 'admin') {
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.addEventListener('click', () => this.fillForm(snackCard));
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => this.removeCard(snackCard));
            snackCard.appendChild(updateButton);
            snackCard.appendChild(deleteButton);
        }
        else {
            const cartBtn = document.createElement('button');
            cartBtn.textContent = 'Add To Cart';
            cartBtn.addEventListener('click', () => this.addToCart(snackCard));
            snackCard.appendChild(cartBtn);
        }
        return snackCard;
    }
    updateCard(snackCard, snackName, flavour, price, imageUrl) {
        const img = snackCard.querySelector('img');
        const namePara = snackCard.querySelector('p:nth-of-type(1)');
        const flavourPara = snackCard.querySelector('p:nth-of-type(2)');
        const pricePara = snackCard.querySelector('p:nth-of-type(3)');
        img.src = imageUrl;
        namePara.textContent = snackName;
        flavourPara.textContent = flavour;
        pricePara.textContent = `Ksh.${price}`;
        this.currentSnackCard = null;
    }
    async removeCard(snackCard) {
        await this.deleteProductFromAPI(snackCard.dataset.id);
        this.productsList.removeChild(snackCard);
        this.allProducts = this.allProducts.filter(product => product.id !== snackCard.dataset.id);
        this.updateViewOneSelect();
    }
    fillForm(snackCard) {
        const img = snackCard.querySelector('img');
        const namePara = snackCard.querySelector('p:nth-of-type(1)');
        const flavourPara = snackCard.querySelector('p:nth-of-type(2)');
        const pricePara = snackCard.querySelector('p:nth-of-type(3)');
        const snackNameInput = document.getElementById('snack-name');
        const flavourInput = document.getElementById('flavour');
        const priceInput = document.getElementById('price');
        const imageUrlInput = document.getElementById('image-url');
        snackNameInput.value = namePara.textContent;
        flavourInput.value = flavourPara.textContent;
        priceInput.value = pricePara.textContent.replace('Ksh.', '');
        imageUrlInput.value = img.src;
        this.currentSnackCard = snackCard;
        this.form.style.display = 'block';
    }
    updateUserRole() {
        this.userRole = this.userRoleSelect.value;
        const isAdmin = this.userRole === 'admin';
        const isUser = this.userRole === 'user';
        this.addButton.style.display = isAdmin ? 'block' : 'none';
        this.form.style.display = isAdmin && this.currentSnackCard ? 'block' : 'none';
        const snackCards = this.productsList.querySelectorAll('.snack-card');
        snackCards.forEach(snackCard => {
            const updateButton = snackCard.querySelector('button:nth-of-type(1)');
            const deleteButton = snackCard.querySelector('button:nth-of-type(2)');
            const cartBtn = document.createElement('button');
            cartBtn.textContent = 'Add To Cart';
            snackCard.appendChild(cartBtn);
            if (updateButton && deleteButton) {
                if (isAdmin) {
                    updateButton.style.display = 'block';
                    deleteButton.style.display = 'block';
                    cartBtn.style.display = 'none';
                }
                else if (isUser) {
                    updateButton.style.display = 'none';
                    deleteButton.style.display = 'none';
                    cartBtn.style.display = 'block';
                    const self = this;
                    cartBtn.addEventListener('click', function () {
                        self.addToCart(snackCard);
                    });
                }
            }
        });
    }
    async addToCart(snackCard) {
        const id = snackCard.dataset.id;
        const img = snackCard.querySelector('img').src;
        const name = snackCard.querySelector('p:nth-of-type(1)').textContent;
        const flavour = snackCard.querySelector('p:nth-of-type(2)').textContent;
        const price = snackCard.querySelector('p:nth-of-type(3)').textContent.replace('Ksh.', '');
        const cartItem = { id, img, name, flavour, price };
        await fetch('http://localhost:3000/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
        });
        alert(`${name} added to cart.`);
        // Add the product to the cart card holder
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartCard = this.createCartCard(cartItem);
        cartItemsContainer.appendChild(cartCard);
    }
    createCartCard(cartItem) {
        const cartCard = document.createElement('div');
        cartCard.classList.add('cart-card');
        const img = document.createElement('img');
        img.src = cartItem.img;
        cartCard.appendChild(img);
        const namePara = document.createElement('p');
        namePara.textContent = cartItem.name;
        cartCard.appendChild(namePara);
        const flavourPara = document.createElement('p');
        flavourPara.textContent = cartItem.flavour;
        cartCard.appendChild(flavourPara);
        const pricePara = document.createElement('p');
        pricePara.textContent = `Ksh.${cartItem.price}`;
        cartCard.appendChild(pricePara);
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => this.removeFromCart(cartCard));
        cartCard.appendChild(removeButton);
        return cartCard;
    }
    async removeFromCart(cartCard) {
        const id = cartCard.dataset.id;
        // Implement removal from the cart API endpoint
        // Remove the card from the cart card holder
        cartCard.remove();
    }
    async saveProductToAPI(product) {
        const response = await fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });
        return response.json();
    }
    async updateProductInAPI(id, product) {
        await fetch(`http://localhost:3000/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });
    }
    async deleteProductFromAPI(id) {
        await fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE',
        });
    }
    async loadProductsFromAPI() {
        const response = await fetch('http://localhost:3000/products');
        const products = await response.json();
        this.productsList.innerHTML = '';
        products.forEach((product) => {
            const snackCard = this.createCard(product.id, product.snackName, product.flavour, product.price, product.imageUrl);
            this.productsList.appendChild(snackCard);
            this.allProducts.push(product);
        });
        this.updateViewOneSelect();
    }
    updateViewOneSelect() {
        const uniqueSnackNames = Array.from(new Set(this.allProducts.map(product => product.snackName)));
        this.viewOneSelect.innerHTML = '<option value="">--Select Snack Name--</option>';
        uniqueSnackNames.forEach(snackName => {
            const option = document.createElement('option');
            option.value = snackName;
            option.textContent = snackName;
            this.viewOneSelect.appendChild(option);
        });
    }
    filterProducts() {
        const selectedSnackName = this.viewOneSelect.value;
        if (selectedSnackName) {
            const filteredProducts = this.allProducts.filter(product => product.snackName === selectedSnackName);
            this.productsList.innerHTML = '';
            filteredProducts.forEach(product => {
                const snackCard = this.createCard(product.id, product.snackName, product.flavour, product.price, product.imageUrl);
                this.productsList.appendChild(snackCard);
            });
        }
        else {
            this.productsList.innerHTML = '';
            this.allProducts.forEach(product => {
                const snackCard = this.createCard(product.id, product.snackName, product.flavour, product.price, product.imageUrl);
                this.productsList.appendChild(snackCard);
            });
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new SnackCentre();
    const cartIcon = document.querySelector('.navigation ion-icon[name="cart-outline"]');
    const mainDashboardButton = document.getElementById('main-dashboard-button');
    cartIcon.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
    mainDashboardButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
