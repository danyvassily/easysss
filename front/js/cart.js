// recuperation localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sélectionnez l'élément parent pour les articles du panier
const cartItems = document.getElementById('cart__items');

// fonction qui crée un élement dans ke panier en utilisant les données de l'article et crée  un élément 'article avec des classes et attributs spécifique 
// pour identidentifier l'article et sa couleur, ensuite  ajoute  l'image,  les descriptif, le nom, , le priix. 
// la fonction ajoute tous ces élements le  "cartitems" (le panier) et le gestionnaires d'événement gère le changement de de quantité de quantité et supression de l'aticle.
const createCartItem = (data, item) => {
  const cartItem = document.createElement('article');
  cartItem.classList.add('cart__item');
  cartItem.setAttribute('data-id', item.id);
  cartItem.setAttribute('data-color', item.color);

  const imgElement = document.createElement('img');
  imgElement.src = data.imageUrl;
  imgElement.alt = data.altTxt;
  imgElement.classList.add('cart__item__img');
  const imgContainer = document.createElement('div');
  imgContainer.classList.add('cart__item__img');
  imgContainer.appendChild(imgElement);
  cartItem.appendChild(imgContainer);

  const content = document.createElement('div');
  content.classList.add('cart__item__content');

  const description = document.createElement('div');
  description.classList.add('cart__item__content__description');
  const name = document.createElement('h2');
  name.textContent = data.name;
  const color = document.createElement('p');
  color.textContent = item.color;
  const price = document.createElement('p');
  price.textContent = `${data.price} €`;
  description.appendChild(name);
  description.appendChild(color);
  description.appendChild(price);
  content.appendChild(description);

  const settings = document.createElement('div');
  settings.classList.add('cart__item__content__settings');
  const quantity = document.createElement('div');
  quantity.classList.add('cart__item__content__settings__quantity');
  const quantityLabel = document.createElement('p');
  quantityLabel.textContent = 'Qté : ';
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.classList.add('itemQuantity');
  quantityInput.name = 'itemQuantity';
  quantityInput.min = '1';
  quantityInput.max = '100';
  quantityInput.value = item.quantity;
  quantity.appendChild(quantityLabel);
  quantity.appendChild(quantityInput);
  settings.appendChild(quantity);

  const deleteButton = document.createElement('div');
  deleteButton.classList.add('cart__item__content__settings__delete');
  const deleteLink = document.createElement('p');
  deleteLink.classList.add('deleteItem');
  deleteLink.textContent = 'Supprimer';
  deleteButton.appendChild(deleteLink);
  settings.appendChild(deleteButton);

  content.appendChild(settings);
  cartItem.appendChild(content);

  cartItems.appendChild(cartItem);

  // Ajouter les gestionnaires d'événements
  quantityInput.addEventListener('change', handleQuantityChange);
  deleteLink.addEventListener('click', handleDeleteItem);
};

// la fonction 'handleQauntitychange' est un gestionnaire d'evenements qui met à jour ka quantité d'un element dans le panie. Elle identifie l'élement calcule les prix et la quantité et met à jour dans le localstorage
// dans la partien panier, et les erreurs lors de la récupération des détails du produit.

const handleQuantityChange = event => {
const quantity = event.target.value;
 const cartItem = event.target.closest('.cart__item');
  const id = cartItem.dataset.id;
  const color = cartItem.dataset.color;

  const product = cart.find(item => item.id === id && item.color === color);
  const previousQuantity = product.quantity;
  product.quantity = quantity;

  localStorage.setItem('cart', JSON.stringify(cart));

  fetch(`http://localhost:3000/api/products/${id}`)
    .then(res => res.json())
    .then(data => {
      const priceChange = data.price * (quantity - previousQuantity);
      const quantityChange = quantity - previousQuantity;
      updateCartTotal(priceChange, quantityChange);
    })
    .catch(error => {
      console.error('Error fetching product details:', error);
    });
};

// handleDeleteItem est concue pour gérer le changement de quantité d'un element du panie, en identifient l'element et supprime en fonction de l'événement. 
// la fonction trouve dans l'index de l'element  deans le tableau et met à jour la quantité, puis supprime du panier et met à jour le local storage et retire l'element du DOM.
/// et met pour mettre à jour le total du panier prix et quantité.
const handleDeleteItem = event => {
  const cartItem = event.target.closest('.cart__item');
  const id = cartItem.dataset.id;
  const color = cartItem.dataset.color;

  const index = cart.findIndex(item => item.id === id && item.color === color);
  const quantity = cart[index].quantity;
  cart.splice(index, 1);

  localStorage.setItem('cart', JSON.stringify(cart));
  cartItem.remove();

  fetch(`http://localhost:3000/api/products/${id}`)
    .then(res => res.json())
    .then(data => {
      const priceChange = -data.price * quantity;
      const quantityChange = -quantity;
      updateCartTotal(priceChange, quantityChange);
    })
    .catch(error => {
      console.error('Error fetching product details:', error);
    });
};

// Fonction pour mettre à jour le prix total et le nombre total d'articles dans la page Panier
const updateCartTotal = (priceChange, quantityChange) => {
  let totalPrice = parseFloat(document.getElementById('totalPrice').textContent) || 0;
  let totalQuantity = parseInt(document.getElementById('totalQuantity').textContent) || 0;

  totalPrice += priceChange;
  totalQuantity += quantityChange;

  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
  document.getElementById('totalQuantity').textContent = totalQuantity;
};

// Calculer le total initial des prix et quantités ave deux variables 'totalprice' et 'totalQuantity', pour stocker le prix total et la quantité total des articles.
// ensuite  le fetch 'fetchProductDetails' prend un obket 'item' pour le representer dans  le panier.
// le code utilise ensuite la méthode Promise.all pour exécuter la fonction fetchProductDetails pour chaque article dans le panier, cela renvoie une promesse qui une fois résolues,
// le code met à jour ke contenu des élements HTML avec id totalPrice et totalQuantity pour afficher le prix total et la quantité totale des articles dans le panier.
let totalPrice = 0;
let totalQuantity = 0;

const fetchProductDetails = item => {
  return fetch(`http://localhost:3000/api/products/${item.id}`)
    .then(res => res.json())
    .then(data => {
      createCartItem(data, item);
      totalPrice += data.price * item.quantity;
      totalQuantity += parseInt(item.quantity);
      return { price: data.price * item.quantity, quantity: item.quantity };
    })
    .catch(error => {
      console.error('Error fetching product details:', error);
    });
};

Promise.all(cart.map(fetchProductDetails)).then(() => {
  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
  document.getElementById('totalQuantity').textContent = totalQuantity;
});

// Ajoutez un gestionnaire d'événements pour le formulaire de commande
document.querySelector('.cart__order__form').addEventListener('submit', event => {
  event.preventDefault();

  const contact = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    email: document.getElementById('email').value
  };

  if (!validateForm(contact)) return;

  const products = cart.map(item => item.id);

  fetch('http://localhost:3000/api/products/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contact, products })
  })
    .then(res => res.json())
    .then(data => {
      window.location.href = `confirmation.html?orderId=${data.orderId}`;
    })
    .catch(error => {
      console.error('Error confirming order:', error);
    });
});

// créetion d'un fcontion 'valider Formulaire' pour valider les entrées du formulaire, 
// la fonction comprend 5 arguments et pour valider les élements la fonction utilise 'regex'. 
// Si une entrée est invalide, la fonction affiche une alerte à l'utilisateur et retourne false. Si toutes les entrées sont valides, la fonction retourne true.
const validateForm = ({ firstName, lastName, address, city, email }) => {
  const firstNameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/;
  const lastNameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ]+$/;
  const addressRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ\s,'-]+$/;
  const cityRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s-]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!firstNameRegex.test(firstName)) {
    alert('Veuillez entrer un prénom valide.');
    return false;
  }
  if (!lastNameRegex.test(lastName)) {
    alert('Veuillez entrer un nom valide.');
    return false;
  }
  if (!addressRegex.test(address)) {
    alert('Veuillez entrer une adresse valide.');
    return false;
  }
  if (!cityRegex.test(city)) {
    alert('Veuillez entrer une ville valide.');
    return false;
  }
  if (!emailRegex.test(email)) {
    alert('Veuillez entrer une adresse e-mail valide.');
    return false;
  }
  return true;
};
