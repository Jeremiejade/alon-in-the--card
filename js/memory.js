import { printer } from './printer';
export default class Memory {
  constructor(Game) {
   this.memory = [];
   this.game = Game;
  }

  get length() {
    return this.memory.length;
  }

  isEmpty() {
    return this.memory.length <= 1
  }

  addMemoryState(doNotMemories) {
    if(doNotMemories) {
      return;
    }
    const gameState = {};
    const gameColumns = this.game.columns;
    const gamePills = this.game.pills;
    gameColumns.forEach((gameColumn, index) => {
      const {column, pill} = gameColumn.getState()
      gameState[`column${index + 1}`] = { column: [...column],  pill: [...pill]};
    });
    gamePills.forEach((gamePill, index) => {
      const column = gamePill.getState();
      gameState[`pill${index + 1}`] = [...column];
    });
    const deck = this.game.deck
    const drawnCards = this.game.drawnCards.getState();
    gameState.deck = [...deck];
    gameState.drawnCards = [...drawnCards];
    this.memory.push(gameState);
  }

  getLastState() {
    if( this.length > 1 ) {
      this.memory.pop();
    }
    const gameState = this.memory[this.memory.length -1];
    const gameColumns = this.game.columns;
    const gamePills = this.game.pills;
    gameColumns.forEach((gameColumns, index) => {
      const { column, pill } = gameState[`column${index + 1}`];
      gameColumns.resetColumnAndPill(column, pill)
    });
    gamePills.forEach((gamePill, index) => {
      const column = gameState[`pill${index + 1}`];
      gamePill.resetColumn(column)
    });
    this.game.deck = [...gameState.deck];
    this.game.drawnCards.resetColumn(gameState.drawnCards);
    printer(this.game, true);
  }
}
