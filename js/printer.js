import interact from 'interactjs';
import { Fireworks } from 'fireworks-js';
import Game from './game';

let deckFront, deckBack, body;

const CARD_MARGIN = 45;

const dropZones = {};
const interactListeners = [];
let fireworks;

export function printer(game, doNotMemories = false) {
  body = document.getElementById('body');
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
  game.memory.addMemoryState(doNotMemories);

  if (game.isEndGame()) {
    printEndButton(game);
  } else {
    printBackButton(game, game.memory.isEmpty());
  }
  if(game.isFinish()){
    launchFireworks();
  }
  printRestartButton();
}

function launchFireworks() {
  body.classList.add('finish');
  const bravo = document.createElement('p');
  bravo.textContent = 'Bravos !!';
  bravo.classList.add('bravo');
  body.appendChild(bravo);
  fireworks = new Fireworks(body, {
    particles: 120,
    trace: 9,
    boundaries: {
      x: 50,
      y: 50,
      width: body.clientWidth,
      height: body.clientHeight
    }
  });
  fireworks.start()
}

function printEndButton(game) {
  const button = document.createElement('button');
  button.textContent = 'Terminer la partie';
  button.classList.add('finish');
  button.addEventListener('click', () => {
    smartFinish(game)
  });
  body.appendChild(button);
}

function printBackButton(game, isEmpty) {
  const button = document.createElement('button');
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.84 0-95.17-15.58-134.2-44.86c-14.12-10.59-16.97-30.66-6.375-44.81c10.59-14.12 30.62-16.94 44.81-6.375c27.84 20.91 61 31.94 95.88 31.94C344.3 415.8 416 344.1 416 256s-71.69-159.8-159.8-159.8c-37.46 0-73.09 13.49-101.3 36.64l45.12 45.14c17.01 17.02 4.955 46.1-19.1 46.1H35.17C24.58 224.1 16 215.5 16 204.9V59.04c0-24.04 29.07-36.08 46.07-19.07l47.6 47.63C149.9 52.71 201.5 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z"/></svg>`;
  button.classList.add('backward');
  if(isEmpty) {
    button.disabled = 'true';
  }
  button.addEventListener('click', () => {
    game.memory.getLastState();
  });
  body.appendChild(button);
}

function printRestartButton() {
  const button = document.createElement('button');
  button.textContent = 'Nouvelle partie';
  button.classList.add('restart');
  button.addEventListener('click', () => {
    resetInteractListeners()
    if(fireworks){
      fireworks.stop();
    }
    new Game();
  });
  body.appendChild(button);
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
  } else {
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
    smartActionOnDblClick(game, drawCard, 'drawnCards');
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
    } else {
      el.style.left = `${-10 + size}px`
    }

    el.style.top = index === 0 ? `${-10 - size}px` : `${CARD_MARGIN - 10}px`;
    containerCache.appendChild(el);
    containerCache = el;
    makeDrawnCardDraggable(game, el, columnId);

    if (index === cards.length - 1) {
      smartActionOnDblClick(game, el, columnId)
    }
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

function smartActionOnDblClick(game, card, fromZone) {
  const target = document.getElementById(card.id);
  target.addEventListener('dblclick', () => {
    const isSmartPlaced = game.smartAction(card.id, fromZone);
    if (isSmartPlaced) {
      printer(game);
    }
  });
}

function getTargetListId(target) {
  let targetIds = [target.id]
  if (target.classList.contains('list')) {
    const nodes = target.querySelectorAll('.list');
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
  const target = event.target;

  let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  if (!(event.rect.right >= body.offsetWidth || event.rect.bottom >= body.offsetHeight)) {
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }
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
  body.innerHTML = `
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

function smartFinish(game) {
  if (game.isFinish()) {
    launchFireworks();
    return
  }
  const matchedCard = findCardMatch(game)
  const target = document.getElementById(matchedCard.card.id);
  magicMooveCard(game, target, matchedCard.dropZoneId, matchedCard.dragZoneId, matchedCard.index)
}

function findCardMatch(game) {
  const pillsCardWithZone = game.pills.map((pill, index) => {
    return {
      card: pill.lastCard,
      zone: `pill${index + 1}`
    };
  });
  const columnsCardWithZone = game.columns.map((column, index) => {
    return {
      ...column.latsCardOfColumnWithPosition,
      zone: `column${index + 1}`
    };
  });
  const matchedCards = [];
  pillsCardWithZone.forEach(pillCardWithZone => {
    const pillCard = pillCardWithZone.card
    columnsCardWithZone.forEach(columnCardWithZone => {
      const columnCard = columnCardWithZone.card
      if (!columnCard) {
        return
      }
      if ((!pillCard && columnCard.value === 1)
        || (pillCard && columnCard.color === pillCard.color && columnCard.value - 1 === pillCard.value)) {
        matchedCards.push({
          dropZoneId: pillCardWithZone.zone,
          dragZoneId: columnCardWithZone.zone,
          card: columnCard,
          index: columnCardWithZone.index
        });
      }
    });
  });

  matchedCards.sort((a, b) => {
    return a.card.value - b.card.value;
  })
  return matchedCards[0];
}

function magicMooveCard(game, target, dropZoneId, dragZoneId, index) {
  const dropZone = dropZones[dropZoneId];
  const dragZone = dropZones[dragZoneId];
  const translateX = dropZone.startX - dragZone.startX;
  const targetTranslateY = index === 1 ? 0 : target.offsetTop * (index - 1);
  const translateY = dropZone.startY - dragZone.startY - targetTranslateY;
  target.style.transition = 'all .8s'
  target.style.transform = `translate(${translateX}px, ${translateY}px)`;
  target.classList.add('dragged');
  target.addEventListener('transitionend', () => {
    target.classList.remove('dragged');
    game.resultDrop([target.id], dropZoneId, dragZoneId);
    printPill(game[dropZoneId].column, document.getElementById(dropZoneId));
    printColumn(game[dragZoneId], document.getElementById(dragZoneId), game, dragZoneId);
    smartFinish(game);
  });
}
