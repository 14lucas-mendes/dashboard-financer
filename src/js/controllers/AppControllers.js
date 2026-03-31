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
        this.cardContentDate = {
            month: 'long',
            day: '2-digit',
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

        const lastEntryPeriod = filteredTransactions.filter((transaction) => transaction.type === 'income');
        const lastOutPeriod = filteredTransactions.filter((transaction) => transaction.type === 'expense');
    
        if(lastEntryPeriod.length > 0) {
            const latestEntry = lastEntryPeriod.reduce((acc, transaction) => {
                const accTime = new Date(acc.date).getTime();
                const currentTime = new Date(transaction.date).getTime();
                return currentTime > accTime ? transaction : acc;
            });
            const latestEntryDate = new Date(latestEntry.date);
            this.textIncome = Number.isNaN(latestEntryDate.getTime())
                ? 'Sem valores de entrada no período'
                : `Última entrada: ${latestEntryDate.toLocaleDateString('pt-BR', this.cardContentDate)}`;
        } else {
            this.textIncome = 'Sem valores de entrada no período';
        }

        if(lastOutPeriod.length > 0) {
            const latestOut = lastOutPeriod.reduce((acc, transaction) => {
                const accTime = new Date(acc.date).getTime();
                const currentTime = new Date(transaction.date).getTime();
                return currentTime > accTime ? transaction : acc;
            });
            const latestOutDate = new Date(latestOut.date);
            this.textExpense = Number.isNaN(latestOutDate.getTime())
                ? 'Sem valores de saída no período'
                : `Última saída: ${latestOutDate.toLocaleDateString('pt-BR', this.cardContentDate)}`;
        } else {
            this.textExpense = 'Sem valores de saída no período';
        }


        if(filteredTransactions.length === 0) {
            this.textTotal = 'Saldo Zerado';
            this.view.updateCards(this.currencyFormat(0), this.currencyFormat(0), this.currencyFormat(0), this.textIncome, this.textExpense, this.textTotal, this.textTotal);
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

        const balance = totals.income - totals.expense;
       
        if(balance > 0) {
            this.textTotal = 'Saldo Positivo';
        } else if (balance === 0) {
            this.textTotal = 'Saldo Zerado';
        } else {
            this.textTotal = 'Saldo Negativo';
        }

        const contentCards = {
            income: {
                text: this.textIncome,
                value: this.currencyFormat(totals.income),
                status: this.textTotal,
            },
            expense: {
                text: this.textExpense,
                value: this.currencyFormat(totals.expense),
                status: this.textTotal,
            },
            total: {
                text: this.textTotal,
                value: this.currencyFormat(totals.income - totals.expense),
                status: this.textTotal,
            }
        }
        
        this.view.updateCards(contentCards.income.value, contentCards.expense.value, contentCards.total.value, contentCards.income.text, contentCards.expense.text, contentCards.total.text, contentCards.total.status);
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
