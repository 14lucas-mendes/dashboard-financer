import AppController from './controllers/AppControllers.js';
import ThemeController from './controllers/ThemeController.js';
import ImportExportService from './models/ImportExportService.js';


//instancia o controlador da aplicação
const app = new AppController();
const theme = new ThemeController();
const service = new ImportExportService(app.wallet);

//inicializa a aplicação
app.init();

//capturando elementos do DOM
const form = document.querySelector('.modal-form');
const appContainer = document.querySelector('.app-container');
const transactionModal = document.getElementById('transactionModal');
const deleteTransactionModal = document.getElementById('deleteTransactionModal');
const transactionModalTitle = document.getElementById('transactionModalTitle');
const saveButton = form.querySelector('.btn-save');
const headerNav = document.querySelector('.header-center');
const btnTheme = document.getElementById('theme-toggle');
const formError = form.querySelector('.form-error');
const btnExport = document.getElementById('export-transactions');
const btnImport = document.getElementById('import-transactions');
const importFileInput = document.getElementById('import-file');
const messageModal = document.getElementById('messageModal');
const messageBody = document.getElementById('messageBody');
const messageOk = document.getElementById('messageOk');
const messageContent = document.querySelector('#messageModal .message-content');

const setFormError = (message) => {
    if(!formError) return;
    formError.textContent = message;
    formError.classList.toggle('visible', Boolean(message));
};

const showMessageModal = (message, variant) => {
    if(!messageModal || !messageBody) return;
    messageBody.textContent = message;
    if(messageContent) {
        messageContent.classList.remove('success', 'error');
        if(variant) messageContent.classList.add(variant);
    }
    messageModal.classList.add('active');
};

if(btnTheme) theme.syncToggleButton(btnTheme);
document.addEventListener('dashboard-financer:theme-change', () => {
    if(!btnTheme) return;
    theme.syncToggleButton(btnTheme);
});


//variável para armazenar o ID da transação pendente de exclusão
let pendingDeleteId = null;


//função para definir o modo do modal de transação (criar ou editar)
const setTransactionModalMode = (mode) => {
    if(mode === 'edit') {
        if(transactionModalTitle) transactionModalTitle.textContent = 'Editar Transação';
        if(saveButton) saveButton.textContent = 'Atualizar';
        return;
    }

    if(transactionModalTitle) transactionModalTitle.textContent = 'Nova Transação';
    if(saveButton) saveButton.textContent = 'Salvar';
};


//função para fechar o modal de transação
const closeTransactionModal = () => {
    transactionModal?.classList.remove('active');
    delete form.dataset.editingId;
    form.reset();
    setTransactionModalMode('create');
};


//função para lidar com o envio do formulário de transação
form.addEventListener('submit', (event) => {
    event.preventDefault();

    setFormError('');
    if(!form.reportValidity()) return;

    const description = document.querySelector('#description').value.trim();
    const rawPrice = parseFloat(document.querySelector('#amount').value);
    const date = document.querySelector('#date').value;
    const category = document.querySelector('#category').value;
    const typeInput = document.querySelector('input[name="type"]:checked');
    if(!typeInput) {
        setFormError('Selecione o tipo de transação.');
        return;
    }

    if(Number.isNaN(rawPrice) || !Number.isFinite(rawPrice) || rawPrice === 0) {
        setFormError('Informe um valor válido.');
        return;
    }

    const price = Math.abs(rawPrice);
    const type = typeInput.value;

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

//função para lidar com o clique no container da aplicação
appContainer.addEventListener('click', (event) => {
    //verifica se o alvo do clique é um elemento DOM
    if(!(event.target instanceof Element)) return;

    //verifica se o alvo do clique é o botão de adicionar transação
    const fab = event.target.closest('.fab');
    if(fab) {
        setTransactionModalMode('create');
        delete form.dataset.editingId;
        form.reset();
        transactionModal?.classList.add('active');
        return;
    }

    //verifica se o alvo do clique é o botão de fechar ou cancelar o modal de transação
    const closeTransactionModalButton = event.target.closest('#transactionModal .close-modal');
    const cancelTransactionModal = event.target.closest('#transactionModal .btn-cancel');
    if(closeTransactionModalButton || cancelTransactionModal) {
        closeTransactionModal();
        return;
    }

    //verifica se o alvo do clique é o botão de excluir transação no modal de confirmação
    if(transactionModal && event.target === transactionModal) {
        closeTransactionModal();
        return;
    }

    if(messageModal && event.target === messageModal) {
        messageModal.classList.remove('active');
        return;
    }

    //verifica se o alvo do clique é o botão de fechar ou cancelar o modal de confirmação de exclusão
    if(deleteTransactionModal && event.target === deleteTransactionModal) {
        deleteTransactionModal.classList.remove('active');
        pendingDeleteId = null;
        return;
    }

    //verifica se o alvo do clique é o botão de fechar ou cancelar o modal de confirmação de exclusão
    const closeDeleteModal = event.target.closest('#deleteTransactionModal .close-modal');
    const cancelDelete = event.target.closest('#deleteTransactionModal .btn-cancel');
    if(closeDeleteModal || cancelDelete) {
        deleteTransactionModal?.classList.remove('active');
        pendingDeleteId = null;
        return;
    }

    const closeMessageModal = event.target.closest('#messageModal .close-modal');
    if(closeMessageModal) {
        messageModal?.classList.remove('active');
        return;
    }

    const confirmMessage = event.target.closest('#messageOk');
    if(confirmMessage) {
        messageModal?.classList.remove('active');
        return;
    }

    //verifica se o alvo do clique é o botão de confirmar a exclusão
    const confirmDelete = event.target.closest('#deleteTransactionModal .btn-delete');
    if(confirmDelete) {
        if(pendingDeleteId) app.removeTransaction(pendingDeleteId);
        deleteTransactionModal?.classList.remove('active');
        pendingDeleteId = null;
        return;
    }

    //verifica se o alvo do clique é o botão de editar transação
    const deleteButton = event.target.closest('.transactions-table .action-btn.delete');
    if(deleteButton) {
        const row = deleteButton.closest('tr');
        const id = row?.dataset.transactionId;
        if(!id) return;

        pendingDeleteId = id;
        deleteTransactionModal?.classList.add('active');
        return;
    }

    //verifica se o alvo do clique é o botão de editar transação
    const editButton = event.target.closest('.transactions-table .action-btn.edit');
    if(editButton) {
        const row = editButton.closest('tr');
        const id = row?.dataset.transactionId;
        if(!id) return;

        //busca a transação correspondente ao ID na carteira
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

headerNav.addEventListener('click', (event) => {
    //verifica se o alvo do clique é um elemento DOM
    if(!(event.target instanceof Element)) return;

    //verifica se o alvo do clique é o botão de ir para o próximo mês
    const nextMonthButton = event.target.closest('#nextMonth');
    if(nextMonthButton) {
        app.moveNext();
        return;
    }

    //verifica se o alvo do clique é o botão de ir para o mês anterior
    const prevMonthButton = event.target.closest('#prevtMonth');
    if(prevMonthButton) {
        app.movePrevious();
        return;
    }

})

btnTheme?.addEventListener('click', () => {
    theme.toggleTheme();
    theme.syncToggleButton(btnTheme);
})



//exportar arquivo
btnExport?.addEventListener('click', () => {
    const result = service.export();
    if(result?.fileName) {
        showMessageModal(`Exportado: ${result.fileName}`, 'success');
        return;
    }
    showMessageModal('Erro ao exportar arquivo.', 'error');
})

//importar arquivos
btnImport?.addEventListener('click', () => {
    importFileInput?.click();
});

importFileInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if(!file) return;
    const result = await service.import(file);
    if(result?.error) {
        showMessageModal('Erro ao importar arquivo.', 'error');
        importFileInput.value = '';
        return;
    }
    showMessageModal(`Importação concluída: ${result.imported} importadas, ${result.ignored} ignoradas`, 'success');
    importFileInput.value = '';
    app.render();
});
