import Transaction from './Transaction.js';

export default class ImportExportService {
    constructor(wallet) {
        this.wallet = wallet;
    }

    export() {
        const dataExport = new Date().toISOString().substring(0, 10);

        const transactionsExport = {
            schemaVersion: "1.0",
            exportedAt: dataExport,
            app: "dashboard-financer",
            transactions: this.wallet.transactions
        }

        const blob = new Blob([JSON.stringify(transactionsExport)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-${dataExport}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async import(file) {
        if(!file) {
            return { imported: 0, ignored: 0, error: 'missing_file' };
        }

        if(file.size > 5_000_000) {
            return { imported: 0, ignored: 0, error: 'file_too_large' };
        }

        let rawText;
        try {
            rawText = await file.text();
        } catch {
            return { imported: 0, ignored: 0, error: 'read_failed' };
        }

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch {
            return { imported: 0, ignored: 0, error: 'invalid_json' };
        }

        const transactions = Array.isArray(parsed) ? parsed : parsed?.transactions;
        if(!Array.isArray(transactions)) {
            return { imported: 0, ignored: 0, error: 'invalid_structure' };
        }

        let imported = 0;
        let ignored = 0;

        for(const item of transactions) {
            const description = typeof item?.description === 'string' ? item.description.trim() : '';
            const category = typeof item?.category === 'string' ? item.category.trim() : '';
            const date = typeof item?.date === 'string' ? item.date.trim() : '';
            const type = item?.type;
            const price = typeof item?.price === 'number' ? item.price : Number(item?.price);

            const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
            const isValidType = type === 'income' || type === 'expense';
            const isValidPrice = Number.isFinite(price) && price !== 0;

            if(!description || !category || !isValidDate || !isValidType || !isValidPrice) {
                ignored += 1;
                continue;
            }

            this.wallet.transactions.push(new Transaction(description, Math.abs(price), date, category, type));
            imported += 1;
        }

        this.wallet.save();
        return { imported, ignored };
    }
}
