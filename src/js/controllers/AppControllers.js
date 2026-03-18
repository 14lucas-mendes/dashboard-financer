import Wallet from '../models/Wallet.js';
import DashboardView from '../views/DashboardViews.js';

export default class AppController {
    constructor() {
        this.view = new DashboardView();
        this.wallet = new Wallet();
    }

    addTransaction(description, price, date, category, type) {
        const newTransaction = this.wallet.add(description, price, date, category, type);
        this.view.addTransaction(newTransaction);
        this.view.updateCards(this.wallet.getIncome(), this.wallet.getExpense(), this.wallet.getTotal());

        return newTransaction;
    }

    removeTransaction(id) {
        this.wallet.remove(id);
        this.render();
    }


    updateTransaction(id, description, price, date, category, type) {
        const updatedTransaction = this.wallet.update(id, description, price, date, category, type);
        if(!updatedTransaction) return null;

        this.render();
        return updatedTransaction;
    }
    
    render() {

        this.view.clearTransactions();

        if(this.wallet.transactions.length === 0) {
            this.view.updateCards(0, 0, 0);
            return;
        }

        this.wallet.transactions.forEach(transaction => {
            this.view.addTransaction(transaction);
        })
        this.view.updateCards(this.wallet.getIncome(), this.wallet.getExpense(), this.wallet.getTotal());
        
    }
    
    init() {
        this.render();
    }
    
}
