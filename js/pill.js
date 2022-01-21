import CardsPile from './cardsPile';

export default class Pill extends CardsPile{
  constructor() {
    super();
  }

  addCards(cards) {
    if(cards.length > 1) {
      return false;
    }
    const card = cards[0];
    if (this.column.length === 0) {
      if (card.value === 1) {
        this.column.push(card);
        return true;
      }
      return false;
    }
    if (this.lastCard.color === card.color
      && this.lastCard.value + 1 === card.value) {
      this.column.push(card);
      return true;
    }
    return false;
  }
}
