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

export function shuffleArray(array) {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }
  return newArray;
}

export function getColorSide(color) {
  if(BLACK_COLOR.includes(color)){
    return 'black';
  }
  return 'red';
}
