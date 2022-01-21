const STATE = ['back', 'front']

export default class Card {
  constructor(color, value) {
    this.id = `${color}_${value}`;
    this.color = color;
    this.value = value;
    this.state = STATE[0];
  }

  turnToFront() {
    this.state = STATE[1];
  }

  turnToBack() {
    this.state = STATE[0];
  }

}
