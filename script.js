"use strict";
class SnackCentre {
    formButton;
    form;
    productsList;
    currentSnackCard = null;
    userRoleSelect;
    addButton;
    constructor() {
        this.formButton = document.querySelector('.add-button');
        this.form = document.querySelector('form');
        this.productsList = document.querySelector('.products-list');
        this.userRoleSelect = document.getElementById('user-role');
        this.addButton = document.querySelector('.add-button');
        this.setup();
    }
    setup() {
        this.formButton.addEventListener('click', () => this.showForm());
        this.form.addEventListener('submit', (event) => this.saveProduct(event));
        this.userRoleSelect.addEventListener('change', () => this.updateUserRole());
        this.updateUserRole();
    }
    showForm() {
        this.form.style.display = 'block';
        this.form.reset();
        this.currentSnackCard = null;
    }
    saveProduct(event) {
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
            if (this.currentSnackCard) {
                this.updateCard(this.currentSnackCard, snackName, flavour, price, imageUrl);
            }
            else {
                const snackCard = this.createCard(snackName, flavour, price, imageUrl);
                this.productsList.appendChild(snackCard);
            }
            this.form.reset();
            this.form.style.display = 'none';
        }
    }
    createCard(snackName, flavour, price, imageUrl) {
        const snackCard = document.createElement('div');
        snackCard.classList.add('snack-card');
        const img = document.createElement('img');
        img.src = imageUrl;
        const namePara = document.createElement('p');
        namePara.textContent = snackName;
        const flavourPara = document.createElement('p');
        flavourPara.textContent = flavour;
        const pricePara = document.createElement('p');
        pricePara.textContent = `Ksh.${price}`;
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.addEventListener('click', () => this.fillForm(snackCard));
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => this.removeCard(snackCard));
        snackCard.appendChild(img);
        snackCard.appendChild(namePara);
        snackCard.appendChild(flavourPara);
        snackCard.appendChild(pricePara);
        snackCard.appendChild(updateButton);
        snackCard.appendChild(deleteButton);
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
    removeCard(snackCard) {
        this.productsList.removeChild(snackCard);
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
        const userRole = this.userRoleSelect.value;
        const isAdmin = userRole === 'admin';
        this.addButton.style.display = isAdmin ? 'block' : 'none';
        this.form.style.display = isAdmin && this.currentSnackCard ? 'block' : 'none';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new SnackCentre();
});
