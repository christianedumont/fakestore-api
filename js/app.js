/** POINT D'ENTRÉE DE L'APPLICATION */

import { Api } from './api.js';
import { renderList, showMessage, fillFormWith, manageWishlist } from './dom.js';
import { validateInput, sanitizeString } from './utils.js';

/** Gestion de l'état */
const state = {
	items: [],
	wishlist: [],
	useApi: true // If API unstable, set to false to use local mock
};

/** Zone d'affichage de la liste des produits */
const productList = document.getElementById('productList');
/** Zone de recherche */
const searchInput = document.getElementById('searchInput');
/** Bouton de refresh */
const refreshBtn = document.getElementById('refreshBtn');
/** Bouton pour ajouter un produit */
const addBtn = document.getElementById('addBtn');
/** Fenêtre modale pour ajouter ou modifier un produit */
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');
/** Formulaire édition d'un produit */
const productForm = document.getElementById('productForm');
/** Zone d'affichage des messages */
const messageEl = document.getElementById('message');
/** Zone d'affichage du détail d'un produit */
const productDetail = document.getElementById('productDetail');
/** Fenêtre modale pour afficher le détail d'un produit */
const modalDetail = document.getElementById("detailModal");
const productDetailClose = document.getElementById('closeDetail');

/** Fonction de chargement des produits */
async function loadProducts() {
	try {
		showMessage(messageEl, 'Chargement en cours ...');
		if (state.useApi) {
			const data = await Api.fetchProducts();
			console.log(data);
			state.items = Array.isArray(data) ? data : [];
		} else {
			state.items = mockData();
		}
		// Récupération de la liste d'envies en local storage
		if (typeof localStorage !== 'undefined' && ('favorites' in localStorage)) {
			//console.log('Récupération du local Storage');
			// Récupération des éléments dans la local storage
			state.wishlist = JSON.parse(localStorage.getItem("favorites"));
			//console.table(state.wishlist);
		}
		renderList(productList, state.items, state.wishlist);
		showMessage(messageEl, 'Chargement terminé', 'info', 1500);
	} catch (err) {
		showMessage(messageEl, 'Erreur lors du chargement: ' + sanitizeString(err.message), 'error', 5000);
		// fallback mock
		state.items = mockData();
		renderList(productList, state.items, []);
	}
}

/** Données fictives par défaut si échec du chargement via l'API */
function mockData() {
	return [
		{ id: '1', title: 'Produit local A', price: 9.9, description: 'Produit local A', image: '' },
		{ id: '2', title: 'Produit local B', price: 19.99, description: 'Produit local B', image: '' }
	];
}

/** Ouverture de la fenêtre modale pour ajouter ou modifier un produit */
function openModal(edit = false, item = null) {
	modal.setAttribute('aria-hidden', 'false');
	modal.style.display = 'flex';
	document.getElementById('modalTitle').textContent = edit ? 'Modifier un produit' : 'Ajouter un produit';
	if (edit && item) fillFormWith(item);
	else fillFormWith({ title: '', price: '', description: '', image: '' });
	document.getElementById('name').focus();
}

/** Fermeture de la fenêtre modale */
function closeModal() {
	modal.setAttribute('aria-hidden', 'true');
	modal.style.display = 'none';
	productForm.reset();
	document.getElementById('productId').value = '';
}

/** Ouverture de la fenêtre modale pour voir le détail d'un produit */
function showDetail(item) {
	modalDetail.setAttribute('aria-hidden', 'false');
	modalDetail.style.display = 'flex';
	productDetail.innerHTML = `
    <h3>${sanitizeString(item.title)}</h3>
    <p class="small">${sanitizeString(item.description)}</p>
    <p><strong>Prix :</strong> ${sanitizeString(String(item.price))} €</p>
    <img src="${sanitizeString(item.image || '')}" alt="${sanitizeString(item.title)}">
  `;
}

/** Fermeture de la fenêtre modale de visualisation d'un produit */
function closeDetail() {
	modalDetail.setAttribute('aria-hidden', 'true');
	modalDetail.style.display = 'none';
}

/** Écouteur d'événement sur la liste des produits, en utilisant la délégation */
productList.addEventListener('click', async (e) => {
	const btn = e.target.closest('button');
	if (!btn) return;
	const article = btn.closest('article.product-card');
	const id = article.dataset.id;
	const action = btn.dataset.action;
	const item = state.items.find(i => String(i.id) === String(id));
	if (action === 'view') showDetail(item);
	else if (action === 'edit') openModal(true, item);
	else if (action === 'delete') {
		if (!confirm('Confirmez-vous la suppression ?')) return;
		try {
			//console.log(String(id));
			if (state.useApi && String(id).match(/^\d+$/)) {
				await Api.deleteProduct(id);
			} else {
				// local: filter out
			}
			state.items = state.items.filter(i => String(i.id) !== String(id));
			renderList(productList, state.items, state.wishlist);
			showMessage(messageEl, 'Produit supprimé', 'info', 3000);
		} catch (err) {
			showMessage(messageEl, 'Erreur suppression: ' + sanitizeString(err.message), 'error', 4000);
		}
	}
	else if (action === 'favorite') {
		//console.log('add/remove from favorite');
		state.wishlist = manageWishlist(article, state.wishlist);
	}
});

/* Écouteurs d'événement sur le click des boutons */
addBtn.addEventListener('click', () => openModal(false));
refreshBtn.addEventListener('click', () => loadProducts());
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
productDetailClose.addEventListener('click', closeDetail);
searchInput.addEventListener('input', (e) => {
	const q = e.target.value.trim().toLowerCase();
	const filtered = state.items.filter(i => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
	renderList(productList, filtered, state.wishlist);
});

/* Soumission du formulaire */
productForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const id = document.getElementById('productId').value;
	const name = document.getElementById('name').value;
	const price = document.getElementById('price').value;
	const description = document.getElementById('description').value;
	const image = document.getElementById('image').value;

	const v = validateInput({ name, price });
	if (!v.ok) {
		showMessage(messageEl, v.reason, 'error', 4000);
		return;
	}
	const payload = {
		title: v.data.name,
		price: v.data.price,
		description: sanitizeString(description),
		image: image || ''
	};

	try {
		if (id) {
			// edit
			if (state.useApi && String(id).match(/^\d+$/)) {
				const updated = await Api.updateProduct(id, payload);
				// optimistic: replace
				state.items = state.items.map(it => String(it.id) === String(id) ? { ...it, ...updated } : it);
			} else {
				state.items = state.items.map(it => String(it.id) === String(id) ? { ...it, ...payload } : it);
			}
			showMessage(messageEl, 'Produit mis à jour', 'info', 3000);
		} else {
			// create - local id fallback
			if (state.useApi) {
				const created = await Api.createProduct(payload);
				state.items.unshift(created);
			} else {
				payload.id = 'c' + Date.now();
				state.items.unshift(payload);
			}
			showMessage(messageEl, 'Produit ajouté', 'info', 3000);
		}
		renderList(productList, state.items, state.wishlist);
		closeModal();
	} catch (err) {
		showMessage(messageEl, 'Erreur enregistrement: ' + sanitizeString(err.message), 'error', 5000);
	}
});

/* CODE PRINCIPAL */
window.addEventListener('DOMContentLoaded', () => {
	console.clear();
	//console.log(state);
	// Chargement des produits à partir de l'API
	loadProducts();
});
