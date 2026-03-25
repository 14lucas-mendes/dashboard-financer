import Wallet from '../models/Wallet.js';
import DashboardView from '../views/DashboardViews.js';

export default class AppController {
    constructor() {
        this.view = new DashboardView();
        this.wallet = new Wallet();
        this.options = {
            month: 'long',
            year: 'numeric'
        }
    }
    
    init() {
        this.render();
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
            this.view.updateCards(0, 0, 0);
            return;
        }

        filteredTransactions.forEach(transaction => {
            this.view.addTransaction(transaction);
        });

        const totals = filteredTransactions.reduce((acc, transaction) => {
            if(transaction.type === 'income') {
                acc.income += transaction.price;
            } else {
                acc.expense += transaction.price;
            }
            return acc;
        }, { income: 0, expense: 0 });
        
        this.view.updateCards(totals.income, totals.expense, totals.income - totals.expense);
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
