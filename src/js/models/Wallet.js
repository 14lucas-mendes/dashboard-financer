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

   filterTransactions() {
        const month = this.date.getMonth() + 1;
        const year = this.date.getFullYear();

        const dateTransactions = this.transactions.filter(transaction => {
            //verfica se data existe
            if(!transaction.date) return false;

            //verifica se data é uma string
            if(typeof transaction.date !== 'string') return false;

            //verifica se data é no formato 'yyyy-mm-dd'
            if(!transaction.date.includes('-')) return false;
           const [transactionYear, transactionMonth, transactionDay] = transaction.date.split('-');

            if(!transactionMonth || !transactionYear || !transactionDay) return false;

            if(transactionMonth.length !== 2 || transactionYear.length !== 4 || transactionDay.length !== 2) return false;
            if(transactionMonth === '00' || transactionYear === '0000' || transactionDay === '00') return false;

            //verifica se data é um número
            const checkNumberMonth = Number(transactionMonth);
            const checkNumberYear = Number(transactionYear);

            //verifica se mês é válido
            if(checkNumberMonth < 1 || checkNumberMonth > 12) return false;

            //verifica se ano é mês são números válidos
            if(isNaN(checkNumberMonth) || isNaN(checkNumberYear)) return false;

            return checkNumberMonth === month && checkNumberYear === year;
        
        });

        return dateTransactions;        
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