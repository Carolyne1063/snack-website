class SnackCentre {
    private formButton: HTMLButtonElement;
    private form: HTMLFormElement;
    private productsList: HTMLDivElement;
    private currentSnackCard: HTMLDivElement | null = null;
    private userRoleSelect: HTMLSelectElement;
    private addButton: HTMLButtonElement;
    private userRole: string;

    constructor() {
        this.formButton = document.querySelector('.add-button')!;
        this.form = document.querySelector('form')!;
        this.productsList = document.querySelector('.products-list')!;
        this.userRoleSelect = document.getElementById('user-role') as HTMLSelectElement;
        this.addButton = document.querySelector('.add-button') as HTMLButtonElement;
        this.userRole = this.userRoleSelect.value;

        this.setup();
        this.loadProductsFromAPI();
    }

    private setup(): void {
        this.formButton.addEventListener('click', () => this.showForm());
        this.form.addEventListener('submit', (event) => this.saveProduct(event));
        this.userRoleSelect.addEventListener('change', () => this.updateUserRole());
        this.updateUserRole(); 
    }

    private showForm(): void {
        this.form.style.display = 'block';
        this.form.reset();
        this.currentSnackCard = null;
    }

    private async saveProduct(event: Event): Promise<void> {
        event.preventDefault();

        const snackNameInput = document.getElementById('snack-name') as HTMLInputElement;
        const flavourInput = document.getElementById('flavour') as HTMLInputElement;
        const priceInput = document.getElementById('price') as HTMLInputElement;
        const imageUrlInput = document.getElementById('image-url') as HTMLInputElement;

        const snackName = snackNameInput.value.trim();
        const flavour = flavourInput.value.trim();
        const price = priceInput.value.trim();
        const imageUrl = imageUrlInput.value.trim();

        if (snackName && flavour && price && imageUrl) {
            const product = { snackName, flavour, price, imageUrl };

            if (this.currentSnackCard) {
                await this.updateProductInAPI(this.currentSnackCard.dataset.id!, product);
                this.updateCard(this.currentSnackCard, snackName, flavour, price, imageUrl);
            } else {
                const createdProduct = await this.saveProductToAPI(product);
                const snackCard = this.createCard(createdProduct.id, snackName, flavour, price, imageUrl);
                this.productsList.appendChild(snackCard);
            }

            this.form.reset();
            this.form.style.display = 'none';
        }
    }

    private createCard(id: string, snackName: string, flavour: string, price: string, imageUrl: string): HTMLDivElement {
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

        return snackCard;
    }

    private updateCard(snackCard: HTMLDivElement, snackName: string, flavour: string, price: string, imageUrl: string): void {
        const img = snackCard.querySelector('img')!;
        const namePara = snackCard.querySelector('p:nth-of-type(1)')!;
        const flavourPara = snackCard.querySelector('p:nth-of-type(2)')!;
        const pricePara = snackCard.querySelector('p:nth-of-type(3)')!;

        img.src = imageUrl;
        namePara.textContent = snackName;
        flavourPara.textContent = flavour;
        pricePara.textContent = `Ksh.${price}`;

        this.currentSnackCard = null;
    }

    private async removeCard(snackCard: HTMLDivElement): Promise<void> {
        await this.deleteProductFromAPI(snackCard.dataset.id!);
        this.productsList.removeChild(snackCard);
    }

    private fillForm(snackCard: HTMLDivElement): void {
        const img = snackCard.querySelector('img')!;
        const namePara = snackCard.querySelector('p:nth-of-type(1)')!;
        const flavourPara = snackCard.querySelector('p:nth-of-type(2)')!;
        const pricePara = snackCard.querySelector('p:nth-of-type(3)')!;

        const snackNameInput = document.getElementById('snack-name') as HTMLInputElement;
        const flavourInput = document.getElementById('flavour') as HTMLInputElement;
        const priceInput = document.getElementById('price') as HTMLInputElement;
        const imageUrlInput = document.getElementById('image-url') as HTMLInputElement;

        snackNameInput.value = namePara.textContent!;
        flavourInput.value = flavourPara.textContent!;
        priceInput.value = pricePara.textContent!.replace('Ksh.', '');
        imageUrlInput.value = img.src;

        this.currentSnackCard = snackCard;
        this.form.style.display = 'block';
    }

    private updateUserRole(): void {
        this.userRole = this.userRoleSelect.value;
        const isAdmin = this.userRole === 'admin';

        this.addButton.style.display = isAdmin ? 'block' : 'none';
        this.form.style.display = isAdmin && this.currentSnackCard ? 'block' : 'none';

        const snackCards = this.productsList.querySelectorAll('.snack-card');
        snackCards.forEach(snackCard => {
            const updateButton = snackCard.querySelector('button:nth-of-type(1)') as HTMLButtonElement;
            const deleteButton = snackCard.querySelector('button:nth-of-type(2)') as HTMLButtonElement;

            if (updateButton && deleteButton) {
                updateButton.style.display = isAdmin ? 'inline-block' : 'none';
                deleteButton.style.display = isAdmin ? 'inline-block' : 'none';
            }
        });
    }

    private async saveProductToAPI(product: { snackName: string, flavour: string, price: string, imageUrl: string }): Promise<{ id: string }> {
        const response = await fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });

        return await response.json();
    }

    private async updateProductInAPI(id: string, product: { snackName: string, flavour: string, price: string, imageUrl: string }): Promise<void> {
        await fetch(`http://localhost:3000/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product),
        });
    }

    private async deleteProductFromAPI(id: string): Promise<void> {
        await fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE',
        });
    }

    private async loadProductsFromAPI(): Promise<void> {
        const response = await fetch('http://localhost:3000/products');
        const products = await response.json();

        products.forEach((product: { id: string, snackName: string, flavour: string, price: string, imageUrl: string }) => {
            const snackCard = this.createCard(product.id, product.snackName, product.flavour, product.price, product.imageUrl);
            this.productsList.appendChild(snackCard);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnackCentre();
});
