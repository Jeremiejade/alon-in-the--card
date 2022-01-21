import interact from 'interactjs';

let deckFront, deckBack;

const CARD_MARGIN = 45;

const dropZones = {};
const interactListeners = [];

export function printer(game) {
  resetInteractListeners();
  initBody();
  deckFront = document.querySelector('.deck .front');
  deckBack = document.querySelector('.deck .back');
  for (let i = 1; i <= 4; i++) {
    const pillId = `pill${i}`;
    const container = document.getElementById(pillId);
    dropZones[pillId] = {
      startX: container.offsetLeft,
      startY: container.offsetTop,
      endX: container.offsetLeft + container.offsetWidth,
      endY: container.offsetTop + container.offsetHeight
    };
    const card = printPill(game[pillId].column, container);
    if (card) {
      makeDrawnCardDraggable(game, card, pillId)
    }
  }

  for (let i = 1; i <= 7; i++) {
    const columnId = `column${i}`;
    const container = document.getElementById(columnId);
    printColumn(game[columnId], container, game, columnId);
  }

  printDeck(game);
}

function printColumn(column, container, game, columnId) {
  resetContainers([container]);
  printPill(column.pill, container, true);
  printListCard(column.column, container, game, columnId, column.pill.length);
}

function printDeck(game) {
  resetContainers([deckBack, deckFront]);
  let deckCardIdTurn = false;
  let deckCard = printPill(game.deck, deckBack, true);
  if (!deckCard) {
    deckBack.addEventListener('click', () => {
      if (!deckCardIdTurn) {
        game.returnDeck();
        deckCardIdTurn = true;
        printer(game);
      }
    })
  }else{
    deckCard.addEventListener('click', () => {
      if (!deckCardIdTurn) {
        game.drawCardFromDeck();
        deckCardIdTurn = true;
        printer(game);
      }
    })
  }

  const drawCard = printPill(game.drawnCards.column, deckFront, false);
  if (drawCard) {
    makeDrawnCardDraggable(game, drawCard, 'drawnCards');
  }
}

function printPill(cards, container, inverted) {
  let lastElement;
  cards.forEach((card, index) => {
    const el = document.createElement('div');
    el.classList.add('card');
    if (inverted) {
      el.style.left = `${-10 + index}px`
      el.style.top = `${-10 - index}px`
      el.classList.add('inverted');
    }
    el.id = card.id;
    container.appendChild(el);
    lastElement = el;
  });
  return lastElement;
}

function printListCard(cards, container, game, columnId, size) {
  let containerCache = container;
  cards.forEach((card, index) => {
    const el = document.createElement('div');
    el.classList.add('card', 'list', `list__${index}`);
    el.id = card.id;

    if (index > 0) {
      el.style.left = '0';
    }else{
      el.style.left = `${-10 + size}px`

    }
    el.style.top = index === 0 ? `${-10 - size}px`:`${CARD_MARGIN - 10}px`;
    containerCache.appendChild(el);
    containerCache = el;
    makeDrawnCardDraggable(game, el, columnId)
  });
  dropZones[container.id] = {
    startX: container.offsetLeft,
    startY: container.offsetTop,
    endX: container.offsetLeft + container.offsetWidth,
    endY: container.offsetTop + container.offsetHeight + (cards.length * CARD_MARGIN)
  }
}

function resetContainers(containers) {
  containers.forEach(container => {
    container.innerHTML = '';
  })
}

function makeDrawnCardDraggable(game, card, dragZone) {
  interactListeners.push(`#${card.id}`);
  interact(`#${card.id}`).draggable({
    inertia: true,
    /*modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],*/
    autoScroll: true,
    listeners: {
      start(evt) {
        card.classList.add('dragged');
        if (card.classList.contains('list')) {
          updateDraggableClassToParent(card);
        }
      },

      move: dragMoveListener,

      end(evt) {
        const target = evt.target;
        const dropZone = isInDropZone(evt.pageX, evt.pageY);
        if (card.classList.contains('list')) {
          updateDraggableClassToParent(card);
        }
        if (!dropZone) {
          resetDragElement(target);
        }
        const targetIds = getTargetListId(target);
        const isDropped = game.resultDrop(targetIds, dropZone, dragZone);
        if (isDropped) {
          printer(game);
        }

        resetDragElement(target);
      }
    }
  });
}

function getTargetListId(target) {
  let targetIds = [target.id]
  if (target.classList.contains('list')) {
    const nodes =  target.querySelectorAll('.list');
    for (let i = 0; i < nodes.length; i++) {
        targetIds.push(nodes[i].id)
    }
  }
  return targetIds;
}

function updateDraggableClassToParent(node) {
  const parent = node.parentNode;
  if (parent.classList.contains('list')) {
    if (parent.classList.contains('dragged')) {
      parent.classList.remove('dragged');
    } else {
      parent.classList.add('dragged');
    }
    updateDraggableClassToParent(parent)
  }
}

function resetDragElement(target) {
  target.style.transform = 'translate(0,0)';
  target.setAttribute('data-x', '0');
  target.setAttribute('data-y', '0');
  target.classList.remove('dragged');
}

function dragMoveListener(event) {
  const target = event.target
  let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

function isInDropZone(positionX, positionY) {
  const limit = 20;
  let isDroppedInDropZone = null;
  for (const key in dropZones) {
    if (positionX - limit > dropZones[key].startX - limit
      && positionX + limit < dropZones[key].endX + limit
      && positionY - limit > dropZones[key].startY - limit
      && positionY + limit < dropZones[key].endY + limit
    ) {
      isDroppedInDropZone = key;
    }
  }
  return isDroppedInDropZone;
}

function initBody() {
  document.getElementById('body').innerHTML = `
  <div class="top-row">
      <div class="final-pills">
        <div id="pill1" class="pill"></div>
        <div id="pill2" class="pill"></div>
        <div id="pill3" class="pill"></div>
        <div id="pill4" class="pill"></div>
      </div>
      <div class="deck">
        <div class="pill front"></div>
        <div class="pill back"></div>
      </div>
    </div>
    <div class="bottom-row">
      <div id="column1" class="pill column1"></div>
      <div id="column2" class="pill column2"></div>
      <div id="column3" class="pill column3"></div>
      <div id="column4" class="pill column4"></div>
      <div id="column5" class="pill column5"></div>
      <div id="column6" class="pill column6"></div>
      <div id="column7" class="pill column7"></div>
    </div>`;
}

function resetInteractListeners() {
  interactListeners.forEach(nodeId => {
    interact(nodeId).unset();
  });
  interactListeners.length = 0;
}
