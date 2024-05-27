"use strict";
class SnackCentre {
    formButton;
    form;
    productsList;
    currentSnackCard = null;
    constructor() {
        this.formButton = document.querySelector('button');
        this.form = document.querySelector('form');
        this.productsList = document.querySelector('.products-list');
        this.initialize();
    }
    initialize() {
        this.formButton.addEventListener('click', () => this.toggleForm());
        this.form.addEventListener('submit', (event) => this.addOrUpdateProduct(event));
    }
    toggleForm() {
        const isFormVisible = this.form.style.display === 'block';
        this.form.style.display = isFormVisible ? 'none' : 'block';
        if (!isFormVisible) {
            this.form.reset();
            this.currentSnackCard = null;
        }
    }
    addOrUpdateProduct(event) {
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
                this.updateSnackCard(this.currentSnackCard, snackName, flavour, price, imageUrl);
            }
            else {
                const snackCard = this.createSnackCard(snackName, flavour, price, imageUrl);
                this.productsList.appendChild(snackCard);
            }
            this.form.reset();
            this.toggleForm();
        }
    }
    createSnackCard(snackName, flavour, price, imageUrl) {
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
        updateButton.classList.add('update');
        updateButton.addEventListener('click', () => this.populateFormForUpdate(snackCard));
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => this.deleteSnackCard(snackCard));
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');
        buttonGroup.appendChild(updateButton);
        buttonGroup.appendChild(deleteButton);
        snackCard.appendChild(img);
        snackCard.appendChild(namePara);
        snackCard.appendChild(flavourPara);
        snackCard.appendChild(pricePara);
        snackCard.appendChild(buttonGroup);
        return snackCard;
    }
    updateSnackCard(snackCard, snackName, flavour, price, imageUrl) {
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
    deleteSnackCard(snackCard) {
        this.productsList.removeChild(snackCard);
    }
    populateFormForUpdate(snackCard) {
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
}
document.addEventListener('DOMContentLoaded', () => {
    new SnackCentre();
});
