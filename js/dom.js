// js/dom.js
import { sanitizeString, formatPriceEuro } from './utils.js';

// Fonction de création d'un article qui contient les données du produit
export function createProductCard(item, wishlist) {
	//console.log(wishlist);
	const article = document.createElement('article');
	article.className = 'product-card';
	article.dataset.id = item.id;

	const img = document.createElement('img');
	img.src = item.image || 'https://via.placeholder.com/150?text=No+Image';
	img.alt = sanitizeString(item.title || 'Produit');

	const title = document.createElement('h2');
	title.className = 'product-title h6 text-center';
	title.textContent = item.title || 'Sans nom';

	const price = document.createElement('p');
	price.className = 'product-price';
	price.textContent = formatPriceEuro(item.price || 0);

	const desc = document.createElement('div');
	desc.className = 'small';
	desc.textContent = (item.description || '').slice(0, 120);

	const actions = document.createElement('div');
	actions.className = 'card-actions d-flex justify-content-center';

	const viewBtn = document.createElement('button');
	viewBtn.className = 'btn btn-light';
	viewBtn.textContent = 'Voir';
	viewBtn.type = 'button';
	viewBtn.dataset.action = 'view';

	const editBtn = document.createElement('button');
	editBtn.className = 'btn btn-primary';
	editBtn.textContent = 'Modifier';
	editBtn.type = 'button';
	editBtn.dataset.action = 'edit';

	const delBtn = document.createElement('button');
	delBtn.className = 'btn btn-danger';
	delBtn.textContent = 'Supprimer';
	delBtn.type = 'button';
	delBtn.dataset.action = 'delete';

	// Le produit est-il dans la liste des favoris ?
	// Il faut convertir l'identifiant en String, sinon on reçoit toujours la valeur -1 à cause des conversions effectuées pour le stockage en localStorage
	const index = wishlist.indexOf(String(item.id));
	//console.log(`L'index de ${item.id} vaut ${index}`);
	const favoriteBtn = document.createElement('button');
	favoriteBtn.className = 'btn btn-light';
	if (index === -1) {
		favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
	}
	else {
		favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
	}
	favoriteBtn.type = 'button';
	favoriteBtn.dataset.action = 'favorite';

	actions.append(viewBtn, editBtn, delBtn, favoriteBtn);

	article.append(title, img, price, desc, actions);
	return article;
}

export function renderList(container, items, wishlist) {
	container.innerHTML = '';
	if (!items.length) {
		const p = document.createElement('p');
		p.className = 'small';
		p.textContent = 'Aucun produit à afficher.';
		container.appendChild(p);
		return;
	}
	const fragment = document.createDocumentFragment();
	items.forEach(item => fragment.appendChild(createProductCard(item, wishlist)));
	container.appendChild(fragment);
}

export function showMessage(el, text, type = 'info', timeout = 5000) {
	el.textContent = text;
	el.className = 'message ' + (type === 'error' ? 'alert alert-danger' : 'alert alert-success');
	if (timeout) setTimeout(() => {
		if (el) {
			el.textContent = '';
			el.className = '';
		}
	}, timeout);
}

export function fillFormWith(item) {
	document.getElementById('productId').value = item.id ?? '';
	document.getElementById('name').value = item.title ?? '';
	document.getElementById('price').value = item.price ?? '';
	document.getElementById('description').value = item.description ?? '';
	document.getElementById('image').value = item.image ?? '';
}

export function manageWishlist(article, wishlist) {
	//console.log('add/remove from favorite');
	//console.log(article);
	const icon = article.querySelector(".fa-heart");
	//console.log(icon);
	// Le produit est-il déjà dans la liste ?
	const index = wishlist.indexOf(article.dataset.id);
	//console.log(index);
	// Produit non trouvé => ajout
	// Sinon suppression de la liste
	if (index === -1) {
		wishlist.push(article.dataset.id);
	}
	else {
		wishlist.splice(index, 1);
	}
	// Modification de l'icône à l'aide de 2 toggle
	icon.classList.toggle("fa-solid");
	icon.classList.toggle("fa-regular");
	//console.table(wishlist);
	// Mettre à jour le local storage
	localStorage.setItem("favorites", JSON.stringify(wishlist));
	return wishlist;
}