//board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
  "XXXXXXXXXXXXXXXXXXX",
  "X    X     X     X X",
  "X                 X",
  "X   X   XXX   X   X",
  "X                 X",
  "X X   X     X   X X",
  "X                 X",
  "X   X   X X   X   X",
  "X                 X",
  "X   X    obpr     X  X", // 👈 Ghost
  "X                 X",
  "X   X         X   X",
  "X       XXX       X",
  "X   X         X   X",
  "X  X     P     X  X", // 👈 Pac-Man
  "X                 X",
  "X   X   XXX   X   X",
  "X                 X",
  "X X           X X X",
  "XXXXXXXXXXXXXXXXXXX",
];


const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

const directions = ["U", "D", "L", "R"]; //up down left right
let score = 0;
let lives = 3;
let gameOver = false;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  loadImages();
  loadMap();
  // console.log(walls.size)
  // console.log(foods.size)
  // console.log(ghosts.size)
  for (let ghost of ghosts.values()) {
    const newDirection = directions[Math.floor(Math.random() * 4)];
    ghost.updateDirection(newDirection);
  }
  update();
  document.addEventListener("keyup", movePacman);
};

function loadImages() {
  wallImage = new Image();
  wallImage.src = "./wall.png";

  blueGhostImage = new Image();
  blueGhostImage.src = "./blueGhost.png";
  orangeGhostImage = new Image();
  orangeGhostImage.src = "./orangeGhost.png";
  pinkGhostImage = new Image();
  pinkGhostImage.src = "./pinkGhost.png";
  redGhostImage = new Image();
  redGhostImage.src = "./redGhost.png";

  pacmanUpImage = new Image();
  pacmanUpImage.src = "./pacmanUp.png";
  pacmanDownImage = new Image();
  pacmanDownImage.src = "./pacmanDown.png";
  pacmanLeftImage = new Image();
  pacmanLeftImage.src = "./pacmanLeft.png";
  pacmanRightImage = new Image();
  pacmanRightImage.src = "./pacmanRight.png";
}

function loadMap() {
  walls.clear();
  foods.clear();
  ghosts.clear();

  for (let r = 0; r < tileMap.length; r++) {
    for (let c = 0; c < tileMap[r].length; c++) {
      const tileMapChar = tileMap[r][c];

      const x = c * tileSize;
      const y = r * tileSize;

      if (tileMapChar === "X") {
        const wall = new Block(wallImage, x, y, tileSize, tileSize);
        walls.add(wall);
      } else if (tileMapChar === "b") {
        const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "o") {
        const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "p") {
        const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "r") {
        const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
        ghosts.add(ghost);
      } else if (tileMapChar === "P") {
        pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
      } else if (tileMapChar === " ") {
        const food = new Block(null, x + 14, y + 14, 4, 4);
        foods.add(food);
      }
    }
  }
}

function update() {
  if (gameOver) {
    return;
  }
  move();
  draw();
  //   updateGhost(ghosts)
  setTimeout(update, 50); //1000/50 = 20 FPS
}

function draw() {
  context.clearRect(0, 0, board.width, board.height);
  context.drawImage(
    pacman.image,
    pacman.x,
    pacman.y,
    pacman.width,
    pacman.height
  );
  for (let ghost of ghosts.values()) {
    context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
  }

  for (let wall of walls.values()) {
    context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
  }

  context.fillStyle = "white";
  for (let food of foods.values()) {
    context.fillRect(food.x, food.y, food.width, food.height);
  }

  //score
  context.fillStyle = "white";
  context.font = "14px sans-serif";
  if (gameOver) {
    context.fillText("Game Over: " + String(score), tileSize / 2, tileSize / 2);
  } else {
    context.fillText(
      "x" + String(lives) + " " + String(score),
      tileSize / 2,
      tileSize / 2
    );
  }
}
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function updateGhost(ghost) {
  const ghostCenter = {
    x: ghost.x + ghost.width / 2,
    y: ghost.y + ghost.height / 2,
  };

  const pacmanCenter = {
    x: pacman.x + pacman.width / 2,
    y: pacman.y + pacman.height / 2,
  };

  const dist = distance(ghostCenter, pacmanCenter);
  const visionRadius = tileSize * 5; // Adjust as needed

  if (dist < visionRadius) {
    // Move towards Pac-Man
    const dx = pacmanCenter.x - ghostCenter.x;
    const dy = pacmanCenter.y - ghostCenter.y;
    const length = Math.hypot(dx, dy);

    ghost.x += (dx / length) * ghostSpeed;
    ghost.y += (dy / length) * ghostSpeed;
  } else {
    // Normal random or idle movement
    wander(ghost);
  }
}

function move() {
  pacman.x += pacman.velocityX;
  pacman.y += pacman.velocityY;

  //check wall collisions
  for (let wall of walls.values()) {
    if (collision(pacman, wall)) {
      pacman.x -= pacman.velocityX;
      pacman.y -= pacman.velocityY;
      break;
    }
  }

  //check ghosts collision
  for (let ghost of ghosts.values()) {
    // Check if ghost collided with Pac-Man
    if (collision(ghost, pacman)) {
      lives -= 1;
      if (lives == 0) {
        gameOver = true;
        return;
      }
      resetPositions();
    }

    // Calculate distance between ghost and Pac-Man
    const dx = pacman.x - ghost.x;
    const dy = pacman.y - ghost.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If within chase radius
    if (distance < 150) {
      ghost.chaseCooldown = (ghost.chaseCooldown || 0) + 1;

      if (ghost.chaseCooldown % 10 === 0) {
        // change direction every 10 frames
        let targetDirection;
        if (Math.abs(dx) > Math.abs(dy)) {
          targetDirection = dx > 0 ? "R" : "L";
        } else {
          targetDirection = dy > 0 ? "D" : "U";
        }

        if (ghost.direction !== targetDirection) {
          ghost.updateDirection(targetDirection);
        }
      }
    } else {
      ghost.chaseCooldown = 0;
    }
    // Move ghost
    ghost.x += ghost.velocityX;
    ghost.y += ghost.velocityY;

    // Wall collision check
    for (let wall of walls.values()) {
      if (
        collision(ghost, wall) ||
        ghost.x <= 0 ||
        ghost.x + ghost.width >= boardWidth
      ) {
        ghost.x -= ghost.velocityX;
        ghost.y -= ghost.velocityY;

        // Random direction if hit wall
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
      }
    }
  }

  //check food collision
  let foodEaten = null;
  for (let food of foods.values()) {
    if (collision(pacman, food)) {
      foodEaten = food;
      score += 10;
      break;
    }
  }
  foods.delete(foodEaten);

  //next level
  if (foods.size == 0) {
    loadMap();
    resetPositions();
  }
}

function movePacman(e) {
  if (gameOver) {
    loadMap();
    resetPositions();
    lives = 3;
    score = 0;
    gameOver = false;
    update(); //restart game loop
    return;
  }

  if (e.code == "ArrowUp" || e.code == "KeyW") {
    pacman.updateDirection("U");
  } else if (e.code == "ArrowDown" || e.code == "KeyS") {
    pacman.updateDirection("D");
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    pacman.updateDirection("L");
  } else if (e.code == "ArrowRight" || e.code == "KeyD") {
    pacman.updateDirection("R");
  }

  //update pacman images
  if (pacman.direction == "U") {
    pacman.image = pacmanUpImage;
  } else if (pacman.direction == "D") {
    pacman.image = pacmanDownImage;
  } else if (pacman.direction == "L") {
    pacman.image = pacmanLeftImage;
  } else if (pacman.direction == "R") {
    pacman.image = pacmanRightImage;
  }
}

function collision(a, b) {
  return (
    a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && //a's top right corner passes b's top left corner
    a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); //a's bottom left corner passes b's top left corner
}

function resetPositions() {
  pacman.reset();
  pacman.velocityX = 0;
  pacman.velocityY = 0;
  for (let ghost of ghosts.values()) {
    ghost.reset();
    const newDirection = directions[Math.floor(Math.random() * 4)];
    ghost.updateDirection(newDirection);
  }
}

class Block {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.startX = x;
    this.startY = y;

    this.direction = "R";
    this.velocityX = 0;
    this.velocityY = 0;
  }

  updateDirection(direction) {
    const prevDirection = this.direction;
    this.direction = direction;
    this.updateVelocity();
    // this.x += this.velocityX;
    // this.y += this.velocityY;

    for (let wall of walls.values()) {
      if (collision(this, wall)) {
        this.x -= this.velocityX;
        this.y -= this.velocityY;
        this.direction = prevDirection;
        this.updateVelocity();
        return;
      }
    }
  }

  updateVelocity() {
    if (this.direction == "U") {
      this.velocityX = 0;
      this.velocityY = -tileSize / 4;
    } else if (this.direction == "D") {
      this.velocityX = 0;
      this.velocityY = tileSize / 4;
    } else if (this.direction == "L") {
      this.velocityX = -tileSize / 4;
      this.velocityY = 0;
    } else if (this.direction == "R") {
      this.velocityX = tileSize / 4;
      this.velocityY = 0;
    }
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
  }
}
