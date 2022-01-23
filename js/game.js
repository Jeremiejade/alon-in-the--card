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

  get pills() {
    return [this.pill1, this.pill2, this.pill3, this.pill4];
  }

  get columns() {
    return [this.column1, this.column2, this.column3, this.column4, this.column5, this.column6, this.column7];
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
    const isDropped = this[dropZone]?.addCards(cards);
    if (isDropped) {
      this[dragZone].removeCards(cardIds);
      return true;
    }
    return false;
  }

  smartAction(cardId, fromZone) {
    const cards = this.getCardsFromIds([cardId]);
    let isSmartPlaced = false;
    this.pills.forEach((pill)=> {
      if(!isSmartPlaced) {
        isSmartPlaced = pill.addCards(cards);
      }
    });
    if(isSmartPlaced) {
      this[fromZone].removeCards([cardId]);
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

  isEndGame() {
    return this.deck.length === 0
    && this.drawnCards.isEmpty()
    && this.column1.isEmpty()
    && this.column2.isEmpty()
    && this.column3.isEmpty()
    && this.column4.isEmpty()
    && this.column5.isEmpty()
    && this.column6.isEmpty()
    && this.column7.isEmpty();
  }

  isFinish() {
    return this.pill1.isFullFilled()
    && this.pill2.isFullFilled()
    && this.pill3.isFullFilled()
    && this.pill4.isFullFilled();
  }
}
