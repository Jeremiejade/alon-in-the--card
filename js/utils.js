import Card from './card';

const BLACK_COLOR = ['club', 'spade'];
const RED_COLOR = ['heart', 'diamond'];

export function createCards() {
  const cards = [];
  [...BLACK_COLOR, ...RED_COLOR].forEach(color => {
    for (let i = 1; i <= 13; i++) {
      cards.push(new Card(color, i));
    }
  });
  return cards;
}

export function shuffleArray(array, random = Math.random) {
  return [...array].sort(() => 0.5 - random());
}

export function getColorSide(color) {
  if(BLACK_COLOR.includes(color)){
    return 'black';
  }
  return 'red';
}
