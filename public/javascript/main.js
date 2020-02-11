class Webshop {
    constructor () {
        this.itemsDisplay = document.querySelector("#display-items");
        this.storage = window.localStorage.getItem("webshop");

        this.init();
    }

    init() {
        if(this.storage == null){
            window.localStorage.setItem("webshop", JSON.stringify({"products": []}));
            this.storage = window.localStorage.getItem("webshop");
        }

        console.log(this.storage);
    }

    insertProduct(data){
        let newProduct = {"id": getUniqueId(), "name": data.name, "amount": data.amount};
        this.storage.products.push(JSON.stringify(newProduct));
        return this.storage;
    }


    getProduct(data){
        return this.storage.getItem(data);
    }

    removeProduct(data){
        this.getProduct(data.item);
    }

    displayProducts() {
        this.storage.products.forEach((product) => {
            let newDisplayItem = document.createElement('div');
            newDisplayItem.classList.add('display-item');
            newDisplayItem.setAttribute('productId', product.id);

            let newDisplayItemId = document.createElement('div');
            newDisplayItem.classList.add('item-id');
            newDisplayItem.setAttribute('productId', product.id);
            
            let newDisplayItemName = document.createElement('div');
            newDisplayItem.classList.add('item-name');
            newDisplayItem.setAttribute('productName', product.name);
            
            let newDisplayItemPrice = document.createElement('div');
            newDisplayItem.classList.add('item-price');
            newDisplayItem.setAttribute('productPrice', product.price);
            
            let newDisplayItemAmount = document.createElement('div');
            newDisplayItem.classList.add('item-amount');
            newDisplayItem.setAttribute('productAmount', product.amount);
            
            let newDisplayItemDescription = document.createElement('div');
            newDisplayItem.classList.add('item-description');
            newDisplayItem.setAttribute('productDescription', product.description);

            let newDisplayItemImage = document.createElement('div');
            newDisplayItem.classList.add('display-image');
            newDisplayItem.setAttribute('productImage', product.image);

            let newItemImage = new Image();
            newItemImage.src = product.image;

            newDisplayItemImage.appendChild(newItemImage);

            this.itemsDisplay.appendChild(newDisplayItem);
        });

        this.itemsDisplay.appendChild();
    }
    
    imageToDataURL(file) {
        let fr = new FileReader();

        fr.onloadend = () => {
            console.log(fr.result);
        };

        return fr.readAsDataURL(file);
    }

    getUniqueId() {
        let newUniqueId = getRandomChar(5);

        this.storage.products.forEach((product) => {
            if(product.id == newUniqueId) {
                newUniqueId = this.getUniqueId();
            }
        });

        return newUniqueId;
    }

    getRandomChars(amount) {
        let rndChars = "";
        let chars = "abcdefghijklmnopqrstuvwxyz1234567890";

        for(let i = 0; i < amount; i++) {
            rndChars += chars[Math.floor(Math.random() * chars.length - 1)];
        }

        return rndChars;
    }
}


window.onload = () => {
    this.webshop = new Webshop();
};