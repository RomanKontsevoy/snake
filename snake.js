var canvas = document.getElementById("canv"),
    ctx = canvas.getContext("2d"),
    // объект для обработки нажатия клавиш управления
    directions = {
        38: "up",
        39: "right",
        40: "down",
        37: "left",
    },
    width = canvas.width = 500,
    height = canvas.height = 500,
    // объект для цветов
    colors = [
        "green",
        "red",
        "brown",
        "blue",
        "violet",
    ],
    blockWidth = 10,
    score = 0,
    speed = 120;

canvas.style.margin = "0 auto";
canvas.style.display = "block";

// функция, рисующуя кружочек
function circle(x, y, r, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    fillCircle ? ctx.fill() : ctx.stroke();
};

// функция, рисующая стенки игрового поля
function drawBorders() {
    ctx.fillStyle = "violet";
    ctx.fillRect(0, 0, width, blockWidth);
    ctx.fillRect(0, 0, blockWidth, height);
    ctx.fillRect(width - blockWidth, 0, blockWidth, height);
    ctx.fillRect(0, height - blockWidth, width, height);
};

// функция, выводящая текст с текущим счетом
function printScore() {
    ctx.fillStyle = "brown";
    ctx.font = "14px Verdana";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Текущий счет: " + score, blockWidth + 2, blockWidth - 2);
}

function printSpeed() {
    ctx.fillStyle = "blueviolet";
    ctx.font = "14px Verdana";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("Текущая скорость: " + Math.round(((1000/speed)*100)/100) + " клеток в секунду", (width - blockWidth - 2), blockWidth - 2);
    ctx.beginPath();
    ctx.font = "12px Verdana";
    ctx.fillText("(Клавиши 'i'/'d')", (width - blockWidth - 2), blockWidth*2 + 10);

}

// функция, выводящая сообщение об окончании игры при столкновении змейки со стенкой или с самой собой
function gameOver() {
    ctx.fillStyle = "red";
    ctx.font = "70px Verdana";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game over!", width / 2, height / 2);
}

drawBorders();

// конструктор для создания блоков
var Block = function (col, row) {
    this.col = col;
    this.row = row;
    this.color = colors[Math.floor(Math.random() * colors.length)];
};

// метод для рисования блока в виде квадратика
Block.prototype.drawSquare = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.col * blockWidth, this.row * blockWidth, blockWidth, blockWidth);
};

// метод для рисования блока в виде крожочка
Block.prototype.drawCircle = function () {
    ctx.fillStyle = this.color;
    circle(this.col*blockWidth+(blockWidth/2), this.row*blockWidth+(blockWidth/2), blockWidth/2, true);
};

// метод для проверки совпадения двух различных блоков
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};

// конструктор для создания яблока
var Apple = function () {
    this.position = new Block(Math.random()*(width/blockWidth-2)+1,Math.random()*(height/blockWidth-2)+1);
};

// метод для рисования яблока
Apple.prototype.draw = function () {
    this.position.drawCircle();
};

// метод для случайного выбора новых координат яблока
Apple.prototype.move = function () {
    var randomCol = Math.floor(Math.random()*(width/blockWidth-2)+1),
        randomRow = Math.floor(Math.random()*(height/blockWidth-2)+1);
    this.position = new Block(randomCol, randomRow);
};

// конструктор для создания змейки
var Snake = function () {
    this.segments = [
        new Block(7, 10),
        new Block(6, 10),
        new Block(5, 10)
    ];
    this.direction = "right";
    this.nextDirection = "right";
};

// метод для прорисовки змейки на холсте
Snake.prototype.draw = function () {
    for (var i = 0; i < this.segments.length; i++) {
        this.segments[i].drawSquare();
    }
};

// метод для проверки столкновения змейки со стенкой или с самой собой
Snake.prototype.checkCollision = function (head) {
    var topCollision = (head.row === 0),
        rightCollision = (head.col === width / blockWidth - 1),
        bottomCollision = (head.row === height / blockWidth - 1),
        leftCollision = (head.col === 0),
        wallCollision = topCollision || rightCollision || bottomCollision || leftCollision,
        selfCollision = false;

    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }
    return wallCollision || selfCollision;
};

// метод для передвижения змейки
Snake.prototype.move = function () {
    var head = this.segments[0];
    var newHead;
    this.direction = this.nextDirection;
    switch (this.direction) {
        case "up":
            newHead = new Block(head.col, head.row-1);
            break;
        case "right":
            newHead = new Block(head.col+1, head.row);
            break;
        case "down":
            newHead = new Block(head.col, head.row+1);
            break;
        case "left":
            newHead = new Block(head.col-1, head.row);
            break;
    }
    if (this.checkCollision(newHead)) {
        gameOver();
        return;
    }

    this.segments.unshift(newHead);
    if (newHead.equal(apple.position)) {
        score++;
        apple.move();
    } else {
        this.segments.pop();
    }
};

// метод установки направления движения змейки с блокировкой возможности смены направления на 180 градусов
Snake.prototype.setDirection = function (newDirection) {
    switch (this.direction + newDirection) {
        case "up" + "down":
            return;
            break;
        case "right" + "left":
            return;
            break;
        case "down" + "up":
            return;
            break;
        case "left" + "right":
            return;
            break;
    }

    this.nextDirection = newDirection;

};

// создание яблока и змейки
var apple = new Apple();
apple.move();
var snake = new Snake();

function gameInit () {
    ctx.clearRect(blockWidth, blockWidth, width-blockWidth*2, height-blockWidth*2);
    snake.draw();
    snake.move();
    apple.draw();
    printScore();
    printSpeed();
}

function animateGame () {
    gameInit();
    setTimeout(animateGame, speed)
}

animateGame();

// обработчик события нажатия клавиши с вызовом метода setDirection()
document.documentElement.addEventListener("keydown", function (e) {
    var newDirection = directions[e.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
    console.log(e.keyCode);
    if (e.keyCode === 73) {
        speed -= 10;
    } else if (e.keyCode === 68) {
        speed += 10;
    }
});

