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
        this.view.addTransaction(newTransaction);
        this.view.updateCards(this.wallet.getIncome(), this.wallet.getExpense(), this.wallet.getTotal());

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
        
        const filteredTransactions = this.wallet.filterMonth();

        if(filteredTransactions.length === 0) {
            this.view.updateCards(0, 0, 0);
            return;
        }

        filteredTransactions.forEach(transaction => {
            this.view.addTransaction(transaction);
        })

        this.view.updateCards(this.wallet.getIncome(), this.wallet.getExpense(), this.wallet.getTotal());
        
    }

    moveNext() {
        this.wallet.nextMonth();
        this.render();
        return this.view.updateHeader(this.wallet.date.toLocaleDateString('pt-BR', this.options));
    
    }
    
    movePrevious() {
        this.wallet.prevMonth();
        this.render();
        return this.view.updateHeader(this.wallet.date.toLocaleDateString('pt-BR', this.options));
    }
}
