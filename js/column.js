import CardsPile from './cardsPile';
import {getColorSide} from './utils';


export default class Column extends CardsPile{
  constructor() {
    super()
    this.pill = [];
  }

  fill(cards) {
    this.pill = [...cards];
    this.turnCardToFront();
  }

  turnCardToFront() {
    const firstCard = this.pill.shift();
    firstCard.turnToFront();
    this.column.push(firstCard);
  }

  get color() {
    return getColorSide(this.lastCard.color);
  }

  addCards(cards) {
    const card = cards[0];
    if (this.column.length === 0) {
      if (card.value === 13) {
        this.column = [...this.column, ...cards];
        return true;
      }
      return false;
    }
    if (this.color !== getColorSide(card.color)
      && this.lastCard.value - 1 === card.value) {
      this.column = [...this.column, ...cards];
      return true;
    }
    return false;
  }

  removeCards(cardIds) {
    this.column = this.column.filter(card => !cardIds.includes(card.id));
    if(this.column.length === 0 && this.pill.length > 0){
      this.turnCardToFront();
    }
  }

}
