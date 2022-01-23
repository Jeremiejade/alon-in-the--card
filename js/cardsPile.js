export default class CardsPile {
  constructor() {
    this.column = [];
  }

  get lastCard() {
    if (this.column.length === 0) {
      return null;
    }
    return this.column[this.column.length - 1];
  }

  addCards([card]) {
    this.column.push(card);
  }

  removeCards([cardId]) {
    this.column = this.column.filter(card => cardId !== card.id);
  }

  isEmpty() {
    return this.column.length === 0;
  }
}
