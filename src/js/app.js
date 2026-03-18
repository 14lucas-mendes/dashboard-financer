import AppController from './controllers/AppControllers.js';

const app = new AppController();
app.init();


//capturando data atual
const data = new Date();
const options = { year: 'numeric', month: 'long' };
const dataFormatada = data.toLocaleDateString('pt-BR', options);


const form = document.querySelector('.modal-form');
const appContainer = document.querySelector('.app-container');
const transactionModal = document.getElementById('transactionModal');
const deleteTransactionModal = document.getElementById('deleteTransactionModal');
const transactionModalTitle = document.getElementById('transactionModalTitle');
const saveButton = form.querySelector('.btn-save');
const nextMonth = document.querySelector('#nextMonth');
const prevMonth = document.querySelector('#prevtMonth');
const dataAtual = document.querySelector('.current-date span');

let pendingDeleteId = null;

const setTransactionModalMode = (mode) => {
    if(mode === 'edit') {
        if(transactionModalTitle) transactionModalTitle.textContent = 'Editar Transação';
        if(saveButton) saveButton.textContent = 'Atualizar';
        return;
    }

    if(transactionModalTitle) transactionModalTitle.textContent = 'Nova Transação';
    if(saveButton) saveButton.textContent = 'Salvar';
};

const closeTransactionModal = () => {
    transactionModal?.classList.remove('active');
    delete form.dataset.editingId;
    form.reset();
    setTransactionModalMode('create');
};

form.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Formulario enviado');

    const description = document.querySelector('#description').value;
    const price = parseFloat(document.querySelector('#amount').value);  
    const date = document.querySelector('#date').value;
    const category = document.querySelector('#category').value;
    const type = document.querySelector('input[name="type"]:checked').value;

    const editingId = form.dataset.editingId;
    if(editingId) {
        app.updateTransaction(editingId, description, price, date, category, type);
        delete form.dataset.editingId;
    } else {
        app.addTransaction(description, price, date, category, type);
    }
    form.reset();
    transactionModal?.classList.remove('active');
    setTransactionModalMode('create');
});

appContainer.addEventListener('click', (event) => {
    if(!(event.target instanceof Element)) return;

    const fab = event.target.closest('.fab');
    if(fab) {
        setTransactionModalMode('create');
        delete form.dataset.editingId;
        form.reset();
        transactionModal?.classList.add('active');
        return;
    }

    const closeTransactionModalButton = event.target.closest('#transactionModal .close-modal');
    const cancelTransactionModal = event.target.closest('#transactionModal .btn-cancel');
    if(closeTransactionModalButton || cancelTransactionModal) {
        closeTransactionModal();
        return;
    }

    if(transactionModal && event.target === transactionModal) {
        closeTransactionModal();
        return;
    }

    if(deleteTransactionModal && event.target === deleteTransactionModal) {
        deleteTransactionModal.classList.remove('active');
        pendingDeleteId = null;
        return;
    }

    const closeDeleteModal = event.target.closest('#deleteTransactionModal .close-modal');
    const cancelDelete = event.target.closest('#deleteTransactionModal .btn-cancel');
    if(closeDeleteModal || cancelDelete) {
        deleteTransactionModal?.classList.remove('active');
        pendingDeleteId = null;
        return;
    }

    const confirmDelete = event.target.closest('#deleteTransactionModal .btn-delete');
    if(confirmDelete) {
        if(pendingDeleteId) app.removeTransaction(pendingDeleteId);
        deleteTransactionModal?.classList.remove('active');
        pendingDeleteId = null;
        return;
    }

    const deleteButton = event.target.closest('.transactions-table .action-btn.delete');
    if(deleteButton) {
        const row = deleteButton.closest('tr');
        const id = row?.dataset.transactionId;
        if(!id) return;

        pendingDeleteId = id;
        deleteTransactionModal?.classList.add('active');
        return;
    }

    const editButton = event.target.closest('.transactions-table .action-btn.edit');
    if(editButton) {
        const row = editButton.closest('tr');
        const id = row?.dataset.transactionId;
        if(!id) return;

        const transaction = app.wallet.transactions.find((t) => t.id === id);
        if(!transaction) return;

        form.dataset.editingId = id;
        document.querySelector('#description').value = transaction.description;
        document.querySelector('#amount').value = transaction.price;
        document.querySelector('#date').value = transaction.date;
        document.querySelector('#category').value = transaction.category;
        const selectedType = document.querySelector(`input[name="type"][value="${transaction.type}"]`);
        if(selectedType) selectedType.checked = true;

        setTransactionModalMode('edit');
        transactionModal?.classList.add('active');
        return;
    }
});


nextMonth.addEventListener('click', () => {
    app.wallet.nextMonth();
    app.render();
});

prevMonth.addEventListener('click', () => {
    app.wallet.prevMonth();
    app.render();
});