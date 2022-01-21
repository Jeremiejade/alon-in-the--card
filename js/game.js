import {printer} from './printer';
import CardsPile from './cardsPile';
import Column from './column';
import Pill from './pill';
import {createCards, shuffleArray} from './utils';

export default class Game {
  constructor() {
    this.cards = [];
    this.deck = [];
    this.drawnCards = new CardsPile();
    this.column1 = new Column();
    this.column2 = new Column();
    this.column3 = new Column();
    this.column4 = new Column();
    this.column5 = new Column();
    this.column6 = new Column();
    this.column7 = new Column();

    this.pill1 = new Pill();
    this.pill2 = new Pill();
    this.pill3 = new Pill();
    this.pill4 = new Pill();

    this._init();
  }

  _init() {
    const cards = createCards();
    this.cards = cards;
    this.deck = shuffleArray(cards);
    this.column1.fill(this.initColumnPill(1));
    this.column2.fill(this.initColumnPill(2));
    this.column3.fill(this.initColumnPill(3));
    this.column4.fill(this.initColumnPill(4));
    this.column5.fill(this.initColumnPill(5));
    this.column6.fill(this.initColumnPill(6));
    this.column7.fill(this.initColumnPill(7));
    printer(this);
  }

  initColumnPill(number) {
    const cards = this.deck.slice(0, number);
    const cardsId = cards.map(card => card.id);
    this.deck = this.deck.filter(card => {
      return !cardsId.includes(card.id);
    });
    return cards;
  }

  drawCardFromDeck() {
    const card = this.deck.shift();
    card.turnToFront();
    this.drawnCards.addCards([card]);
  }

  returnDeck() {
    this.deck = [...this.drawnCards.column];
    this.deck.forEach(card => card.turnToBack());
    this.drawnCards.column = [];
  }

  resultDrop(cardIds, dropZone, dragZone) {
    const cards = this.getCardsFromIds(cardIds);
    const isDropped = this[dropZone].addCards(cards);
    if (isDropped) {
      this[dragZone].removeCards(cardIds);
      return true;
    }
    return false;
  }

  getCardsFromIds(ids) {
    return this.cards
      .filter(card => ids.includes(card.id))
      .sort((a, b) => {
        return b.value - a.value;
      });
  }

}
