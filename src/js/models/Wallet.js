import Transaction from './Transaction.js';

export default class Wallet{
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('dashboard-financer:transactions')) || [];
        this.currentDate = new Date();
        this.date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
      
    }

    save() {
        localStorage.setItem('dashboard-financer:transactions', JSON.stringify(this.transactions));
    }

   add(description, price, date, category, type) {
        const transaction = new Transaction(description, price, date, category, type);
        this.transactions.push(transaction);
        this.save();
        return transaction;
   }

   remove(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.save();
   }

   update(id, description, price, date, category, type) {
        const transaction = this.transactions.find(t => t.id === id);
        if(!transaction) return null;

        transaction.description = description;
        transaction.price = price;
        transaction.date = date;
        transaction.category = category;
        transaction.type = type;

        this.save();
        return transaction;
   }

   filterMonth() {
        return this.transactions.filter(transaction => {
            return transaction.date.getMonth() === this.date.getMonth() && transaction.date.getFullYear() === this.date.getFullYear();
        })
   }

   getIncome() {
        const entry = this.transactions.reduce((total, transaction) => {
        if(transaction.type === 'income') {
            return total + transaction.price;
        } else {
            return total;
        }
    }, 0)

    return entry;
   }

   getExpense() {
        const expense = this.transactions.reduce((total, transaction) => {
            if(transaction.type === 'expense') {
            return total + transaction.price;
            } else {
            return total;
            }
    }, 0)

        return expense;
   }

   getTotal() {
        return this.getIncome() - this.getExpense();
   }

   nextMonth() {
       this.date.setMonth(this.date.getMonth() + 1);
       this.date.setDate(1);
   }

   prevMonth() {
       this.date.setMonth(this.date.getMonth() - 1);
       this.date.setDate(1);
   }
}