export default class Transaction {
   constructor(description, price, date, category, type) {
        this.id = crypto.randomUUID();
        this.description = description;
        this.price = price;
        this.date = date;
        this.category = category;
        this.type = type;
   }
}