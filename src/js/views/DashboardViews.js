export default class DashboardView {
    constructor() {
        this.transactionsContainer = document.querySelector('.transactions-table tbody');
        this.entriesDisplay = document.querySelector('.income-card .card-amount');
        this.expensesDisplay = document.querySelector('.expense-card .card-amount');
        this.totalDisplay = document.querySelector('.total-card .card-amount');
        this.displayHeader = document.querySelector('.current-date');
    }

    updateCards(income, expense, total) {
        this.entriesDisplay.innerText = income;
        this.expensesDisplay.innerText = expense;
        this.totalDisplay.innerText = total;
    }

    updateHeader(date) {
        this.displayHeader.innerText = date;
    }
    
    addTransaction(transaction) {
        const tr = document.createElement('tr')
        const dataFormatada = new Date(transaction.date).toLocaleDateString('pt-BR')
        const precoFormatado = transaction.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        let badge;
        let value;


        if(transaction.type === 'income') {
           badge = 'income';
           value = 'positive';
        } else {
            badge = 'expense';
            value = 'negative';
        }

        const sinal = value === 'positive' ? '' : '-';

        tr.setAttribute('data-transaction-id', transaction.id);

        tr.innerHTML = `
            <td class="td-description">${transaction.description}</td>
            <td><span class="badge ${badge}">${transaction.category}</span></td>
            <td>${dataFormatada}</td>
            <td class="amount ${value}">${sinal}${precoFormatado}</td>
            <td class="td-actions">
                <button class="action-btn edit" aria-label="Editar" type="button">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                    </svg>
                </button>
                <button class="action-btn delete" aria-label="Excluir" type="button">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                        <path d="M10 11v6"></path>
                        <path d="M14 11v6"></path>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                    </svg>
                </button>
            </td>
        `
        this.transactionsContainer.appendChild(tr);

        return tr;
    }

    clearTransactions() {
        this.transactionsContainer.innerHTML = '';
    }
}