
const params = new URLSearchParams(window.location.search).get('id');
const url = `http://localhost:3000/api/products/${params}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log(data);

        
        let imgElement = document.createElement('img');
        imgElement.src = data.imageUrl;
        imgElement.alt = data.altTxt;

       
        document.querySelector(".item__img").appendChild(imgElement);

      
        document.getElementById("title").innerHTML = data.name;
        document.getElementById("price").innerHTML = data.price;
        document.getElementById("description").innerHTML = data.description;

    
        const colorsDropdown = document.getElementById("colors");
        data.colors.forEach(color => {
            const option = document.createElement("option");
            option.value = color.toLowerCase();
            option.textContent = color;
            colorsDropdown.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });

// Ajoutez un gestionnaire d'événements pour le bouton "Ajouter au panier"
const addToCartButton = document.getElementById('addToCart');
addToCartButton.addEventListener('click', addToCart);

function addToCart() {
    const id = params;
    const color = document.getElementById('colors').value;
    const quantity = document.getElementById('quantity').value;

    // Vérifiez que l'utilisateur a sélectionné une couleur et une quantité valides
    if (!color || !quantity || quantity < 1 || quantity > 100) {
        alert('Veuillez sélectionner une couleur et une quantité valides.');
        return;
    }

    // Créez un objet pour le produit sélectionné
    const product = { id, color, quantity };

    // Récupérez le panier depuis localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Vérifiez si le produit est déjà dans le panier
    const existingProduct = cart.find(item => item.id === id && item.color === color);

    if (existingProduct) {
        // Si le produit est déjà dans le panier, mettez à jour la quantité
        existingProduct.quantity = parseInt(existingProduct.quantity) + parseInt(quantity);
    } else {
        // Sinon, ajoutez le produit au panier
        cart.push(product);
    }

    // Stockez le panier mis à jour dans localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Redirigez l'utilisateur vers la page Panier
    window.location.href = 'cart.html';
}
