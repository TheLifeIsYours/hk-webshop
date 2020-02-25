class IndexedDBClient {
    constructor(_databaseName, _version) {
        this.IDB = window.indexedDB;
        this.dbName = _databaseName;
        this.dbVersion = _version;
        this.db = null;
        this.objectStore = null;

        this.initIDB();
    }

    initIDB(){
        let request = this.open(this.dbName, this.dbVersion);

        request.onerror = (_event) => {
            this.error("request error", _event);
        };

        request.onsuccess = (_event) => {
            this.success("request success", _event);

            this.db = _event.target.result;
            
            this.db.onerror = (_event) => {
                this.error("db error", _event);
            };

            this.db.onsuccess = (_event) => {
                this.success("db success", _event);
            };
        };

        request.onupgradeneeded = (_event) => {
            this.db = _event.target.result;
        };
    }

    open(_databaseName, _version) {
        return this.IDB.open(_databaseName, _version || 1);
    }

    createStore(storeName, storePath) {
        let objectStore = this.db.createObjectStore(storeName, {keyPath: storePath});
        objectStore.transaction.oncomplete = (_event) => {
            this.success("object store success", _event);
        };
    }

    createIndex(indexName, data) {
        this.objectStore.createIndex(indexName, indexName, data);
    }

    getStore(_transactionName, _storeName) {
        return this.db.transaction(_transactionName).objectStore(_storeName);
    }

    fetchAll(_objectStore) {
        _objectStore.getAll().onsuccess = (_event) => {
            this.success("got all from object store", _event);
            return _event.target.result;
        };
    }

    fetchIndex(_objectStore, _index, _indexName) {
        let index = _objectStore.index(_index).get(_indexName);

        index.onsuccess = (_event) => {
            this.success("fetched index successfully", _event);
            return _event.target.result;
        };

        index.onerror = () => {
            this.error("error fetching index", _event);
        };
    }

    error(_message, _event) {
        console.error("IDB:", _message, _event);
    }

    success(_message, _event) {
        console.log("IDB:", _message, _event);
    }


}

class Webshop {
    constructor() {
        //this.indexClient = new IndexedDBClient('webshop', 1);

        this.form = document.querySelector("#webshop-insert-form");
        this.itemsDisplay = document.querySelector("#display-items");
        this.storage = JSON.parse(window.localStorage.getItem("webshop"));

        this._404Image = "./public/images/404_200x200.png";

        this.init();
    }

    init() {
        //this.indexClient.getStore();

        if(this.storage == null){
            window.localStorage.setItem("webshop", JSON.stringify({"products": []}));
            this.storage = JSON.parse(window.localStorage.getItem("webshop"));
        }

        this.form.addEventListener('submit', (_event) => {
            _event.preventDefault();
            this.submitForm(_event.target.elements);
        });

        window.addEventListener('storage', () => {
            this.displayProducts();
        });

        this.displayProducts();
    }

    submitForm(elements){
        let data = {};

        for(let element of elements){
            if(element.type == "submit") break;
            
            if(element.type == "file") {
                data[element.name] = element.files;
            } else {
                data[element.name] = element.value;
            }
        }

        this.insertProduct(data);

        this.displayProducts();
    }

    async insertProduct(data){
        console.log(data);

        let newProduct = {
            "id": this.getUniqueId(),
            "name": data.name,
            "price": data.price,
            "amount": data.amount,
            "description": data.description,
            "image": await this.imageToDataURL(data.image)
        };

        console.log(newProduct);

        this.storage.products.push(JSON.stringify(newProduct));
        window.localStorage.setItem("webshop", JSON.stringify(this.storage));
    }


    getProduct(data){
        return this.storage.getItem(data);
    }

    removeProduct(data){
        this.getProduct(data.item);
    }

    displayProducts() {
        console.log("display products");

        while(this.itemsDisplay.firstChild){
            this.itemsDisplay.firstChild.remove();
        }

        this.storage.products.forEach((product) => {
            product = JSON.parse(product);

            let newDisplayItem = document.createElement('div');
            newDisplayItem.classList.add('display-item');
            newDisplayItem.setAttribute('productId', product.id);

            let newDisplayItemId = document.createElement('div');
            newDisplayItemId.classList.add('item-id');
            newDisplayItemId.setAttribute('productId', product.id);
            newDisplayItemId.innerText = product.id;
            
            let newDisplayItemName = document.createElement('div');
            newDisplayItemName.classList.add('item-name');
            newDisplayItemName.setAttribute('productName', product.name);
            newDisplayItemName.innerText = product.name;
            
            let newDisplayItemPrice = document.createElement('div');
            newDisplayItemPrice.classList.add('item-price');
            newDisplayItemPrice.setAttribute('productPrice', product.price);
            newDisplayItemPrice.innerText = product.price;
            
            let newDisplayItemAmount = document.createElement('div');
            newDisplayItemAmount.classList.add('item-amount');
            newDisplayItemAmount.setAttribute('productAmount', product.amount);
            newDisplayItemAmount.innerText = product.amount;
            
            let newDisplayItemDescription = document.createElement('div');
            newDisplayItemDescription.classList.add('item-description');
            newDisplayItemDescription.setAttribute('productDescription', product.description);
            newDisplayItemDescription.innerText = product.description;

            let newDisplayItemImage = document.createElement('div');
            newDisplayItemImage.classList.add('display-image');
            newDisplayItemImage.setAttribute('productImage', product.image);

            let newItemImage = new Image();
            newItemImage.src = product.image != undefined ? product.image : this._404Image;
            newDisplayItemImage.appendChild(newItemImage);

            newDisplayItem.appendChild(newDisplayItemId);
            newDisplayItem.appendChild(newDisplayItemName);
            newDisplayItem.appendChild(newDisplayItemPrice);
            newDisplayItem.appendChild(newDisplayItemAmount);
            newDisplayItem.appendChild(newDisplayItemDescription);
            newDisplayItem.appendChild(newItemImage);

            this.itemsDisplay.appendChild(newDisplayItem);
        });
    }
    
    async imageToDataURL(files) {
        if(files.length <= 0) return null;

        return new Promise((resolve, reject) => {
            let fr = new FileReader();

            fr.addEventListener('load', (event) => {
                return resolve(event.target.result);
            });

            fr.addEventListener('error', () => {
                return reject();
            })

            fr.readAsDataURL(files[0]);
        }).catch(err => console.error(err));
    }

    getUniqueId() {
        let newUniqueId = this.getRandomChars(5);

        if(this.storage.products == undefined) return newUniqueId;

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
            rndChars += chars[Math.floor(Math.random() * chars.length)];
        }

        return rndChars;
    }
}

window.onload = () => {
    this.webshop = new Webshop();
};