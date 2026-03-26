import Wallet from '../models/Wallet.js';
import DashboardView from '../views/DashboardViews.js';

export default class AppController {
    constructor() {
        this.view = new DashboardView();
        this.wallet = new Wallet();
        this.textIncome = 'entrada';
        this.textExpense = 'saida';
        this.textTotal = 'saldo';
        this.formatCurrency = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
        this.options = {
            month: 'long',
            year: 'numeric'
        }
    }
    
    init() {
        this.render();
    }

    currencyFormat(price) {
        return this.formatCurrency.format(price);
    }

    addTransaction(description, price, date, category, type) {
        const newTransaction = this.wallet.add(description, price, date, category, type)
        this.render();

        return newTransaction;
    }

    updateTransaction(id, description, price, date, category, type) {
        const updatedTransaction = this.wallet.update(id, description, price, date, category, type);
        if(!updatedTransaction) return null;

        this.render();
        return updatedTransaction;
    }

    removeTransaction(id) {
        this.wallet.remove(id);
        this.render();
    }

    render() {
        this.view.updateHeader(this.wallet.date.toLocaleDateString('pt-BR', this.options));
        this.view.clearTransactions();
        
        const filteredTransactions = this.wallet.filterTransactions();

        if(filteredTransactions.length === 0) {
            this.view.updateCards(this.currencyFormat(0), this.currencyFormat(0), this.currencyFormat(0));
            return;
        }

        filteredTransactions.forEach(transaction => {
            this.view.addTransaction({
                ...transaction,
                price: this.currencyFormat(transaction.price),
            });
        });

        const totals = filteredTransactions.reduce((acc, transaction) => {
            if(transaction.type === 'income') {
                acc.income += transaction.price;
            } else {
                acc.expense += transaction.price;
            }
            return acc;
        }, { income: 0, expense: 0 });

        const contentCards = {
            income: {
                text: this.textIncome,
                value: this.currencyFormat(totals.income),
                status: 'Saldo Positivo',
            },
            expense: {
                text: this.textExpense,
                value: this.currencyFormat(totals.expense),
                status: 'Saldo Negativo',
            },
            total: {
                text: this.textTotal,
                value: this.currencyFormat(totals.income - totals.expense),
                status: 'Saldo Total',
            }
        }
        
        this.view.updateCards(contentCards.income.value, contentCards.expense.value, contentCards.total.value);
    }

    moveNext() {
        this.wallet.nextMonth();
        this.render();
    }
    
    movePrevious() {
        this.wallet.prevMonth();
        this.render();
    }
}
