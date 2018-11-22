var canvas = document.getElementById("canv"),
    ctx = canvas.getContext("2d"),

    // объект для обработки нажатия клавиш управления
    directions = {
        38: "up",
        39: "right",
        40: "down",
        37: "left",
    };
var width = canvas.width = 500;
canvas.height = 500;
var height = 350,
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
    speed = 300,
    gameOverState = false,
    pause = false;

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
    ctx.fillStyle = "darkslateblue";
    ctx.fillRect(0, 0, width, blockWidth);
    ctx.fillRect(0, 0, blockWidth, canvas.height);
    ctx.fillRect(width - blockWidth, 0, blockWidth, canvas.height);
    ctx.fillRect(0, height - blockWidth, width, blockWidth);
    ctx.fillRect(0, canvas.height - blockWidth, width, blockWidth);
    ctx.fillStyle = 'yellowgreen';
    ctx.fillRect(blockWidth, height, width - blockWidth * 2, canvas.height - blockWidth - height);
};

// функция, выводящая текст с текущим счетом
function printScore() {
    ctx.fillStyle = "brown";
    ctx.font = "14px Verdana";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Текущий счет: " + score, blockWidth + 4, height);
}

function printSpeed() {
    ctx.fillStyle = "blueviolet";
    ctx.font = "14px Verdana";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("Текущая скорость: каждые " + (speed * .1).toFixed(1) + " мс", (width - blockWidth - 4), height);
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.font = "12px Verdana";
    ctx.fillText("Управление стрелочками на клавиатуре", (width - blockWidth - 4), height + 30);
    ctx.fillText("Клавиши I/D для ускорения/замедления", (width - blockWidth - 4), height + 50);
    ctx.fillText("Пробел для паузы", (width - blockWidth - 4), height + 70);
}

var Stat = function (time, score) {
    this.time = time;
    this.score = score;
};

var statArray = [];

function addScoreToStatistics() {
    var options = {
        hour: 'numeric',
        minute: 'numeric',
        second: "numeric"
    };
    var now = new Date().toLocaleString("ru", options);
    var newStatElem = new Stat(now, score);
    statArray.push(newStatElem);
    console.log(statArray);
}

// Функция сравнения
function compareScore(statA, statB) {
    return statA.score - statB.score;
}

// Функция рисования статистики
function drawStat() {
    ctx.strokeStyle = "green";
    ctx.strokeRect(blockWidth + 4, height + 30, 200, 105);
    ctx.font = "24px Verdana";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.strokeText("Статистика:", blockWidth + 30, height + 30);
    if (statArray.length) {
        statArray.sort(compareScore);
        var number = 1;
        for (let i = statArray.length - 1; i >= 0 && i > statArray.length - 6; i--) {
            ctx.beginPath();
            ctx.fillStyle = "green";
            ctx.font = "12px Verdana";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(number + ": " + statArray[i].time + " - " + statArray[i].score, blockWidth + 20, height + 40 + (15 * number));
            number++;
        }
    }
}

// функция, выводящая сообщение об окончании игры при столкновении змейки со стенкой или с самой собой
function gameOver() {
    ctx.clearRect(blockWidth, blockWidth, width - blockWidth * 2, height - blockWidth * 2);
    ctx.fillStyle = "red";
    ctx.font = "70px Verdana";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Конец игры!", width / 2, height / 2);
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.font = "30px Verdana";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Ваш счёт: " + score + " очков!", width / 2, height / 2 + 40);
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.font = "16px Verdana";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Нажмите пробел, чтобы попробовать ещё раз!", width / 2, height / 2 + 80)
    addScoreToStatistics();
}


// конструктор для создания блоков
var Block = function (col, row, color) {
    this.col = col;
    this.row = row;
    this.color = color ? color : colors[Math.floor(Math.random() * colors.length)];
};

// метод для рисования блока в виде квадратика
Block.prototype.drawSquare = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.col * blockWidth, this.row * blockWidth, blockWidth, blockWidth);
};

// метод для рисования блока в виде крожочка
Block.prototype.drawCircle = function () {
    ctx.fillStyle = this.color;
    circle(this.col * blockWidth + (blockWidth / 2), this.row * blockWidth + (blockWidth / 2), blockWidth / 2, true);
};

// метод для проверки совпадения двух различных блоков
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};

Block.prototype.setColor = function (color) {
    this.color = color
};

// конструктор для создания яблока
var Apple = function () {
    this.position = new Block(Math.random() * (width / blockWidth - 2) + 1, Math.random() * (height / blockWidth - 2) + 1);
};

// метод для рисования яблока
Apple.prototype.draw = function () {
    this.position.drawCircle(this.position.color);
};

// метод для случайного выбора новых координат яблока
Apple.prototype.move = function () {
    var randomCol = Math.floor(Math.random() * (width / blockWidth - 2) + 1),
        randomRow = Math.floor(Math.random() * (height / blockWidth - 2) + 1);
    this.position = new Block(randomCol, randomRow);
};

Apple.prototype.conflict = function (blocks) {
    for (let i = 0; i < blocks.length; i++) {
        if (this.position.col === blocks[i].col && this.position.row === blocks[i].row) {
            // На змейке
            console.log('На змейке');
            return true;
        }
    }
    // Не на змейке
    console.log('Не на змейке');
    return false;
};

Apple.prototype.beside = function (blocks) {
    var xDistantion = this.position.col - blocks[0].col;
    var yDistantion = this.position.row - blocks[0].row;
    // var hypotenuse = Math.sqrt(Math.pow(xDistantion,2)+Math.pow(yDistantion,2));
    var hypotenuse = Math.sqrt(xDistantion*xDistantion+yDistantion*yDistantion);
    console.log(xDistantion);
    console.log(yDistantion);
    console.log(hypotenuse);

    return hypotenuse;
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

    // выбор места появление новой "головы"
    switch (this.direction) {
        case "up":
            newHead = new Block(head.col, head.row - 1);
            break;
        case "right":
            newHead = new Block(head.col + 1, head.row);
            break;
        case "down":
            newHead = new Block(head.col, head.row + 1);
            break;
        case "left":
            newHead = new Block(head.col - 1, head.row);
            break;
    }

    // если голова сталкивается с стенкой или с туловищем - игра закончена
    if (this.checkCollision(newHead)) {
        gameOverState = true;
        snake.segments = snake.segments.slice(0, 3);
        setTimeout(gameOver, 100);
        return;
    }

    // пустой массив для хранения текущих цветов
    var snakeColors = [];

    // заполнение массива текущих цветов по порядку
    for (var i = 0; i < this.segments.length; i++) {
        snakeColors.push(this.segments[i].color);
    }

    if (newHead.equal(apple.position)) {
        // в случае поглощения яблока его цвет добавляется в начало массива цветов
        snakeColors.unshift(apple.position.color);
        score++;
        if (speed > 250) {
            speed -= 15;
        } else if (speed > 220) {
            speed -= 10;
        } else if (speed > 200) {
            speed -= 8;
        } else if (speed > 180) {
            speed -= 4;
        } else if (speed > 160) {
            speed -= 3;
        } else if (speed > 150) {
            speed -= 2;
        } else {
            speed -= 1;
        }
        console.log(apple.beside(snake.segments));
        if (!apple.conflict(snake.segments)) {
            apple.move();
        } else {
            while (!apple.conflict(snake.segments)) {
                apple.move();
            }
        }

    } else {
        this.segments.pop();
    }


    this.segments.unshift(newHead);

    // всем элементам обновленного массива сегментов змеи добавляется соответствующий цвет из массива цветов
    for (var i = 0; i < this.segments.length; i++) {
        this.segments[i].setColor(snakeColors[i]);
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
var snake = new Snake();

apple.move();

function gameInit() {
    ctx.clearRect(0, 0, width, canvas.height);
    drawBorders();
    drawStat();
    snake.draw();
    snake.move();
    apple.draw();
    printScore();
    printSpeed();
}

var timeoutId;

function animateGame() {
    gameInit();
    if (gameOverState) {
        return;
    }
    timeoutId = setTimeout(animateGame, speed)
}

animateGame();

// обработчик события нажатия клавиши с вызовом метода setDirection()
document.documentElement.addEventListener("keydown", function (e) {
    var newDirection = directions[e.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
    if (e.keyCode === 73) {
        speed -= 10;
    } else if (e.keyCode === 68) {
        speed += 10;
    }

    if (gameOverState && e.keyCode === 32) {
        gameOverState = !gameOverState;
        snake = new Snake;
        animateGame();
        speed = 300;
        score = 0
    } else if (!gameOverState && e.keyCode === 32) {
        if (!pause) {
            clearTimeout(timeoutId);
        } else {
            animateGame();
        }
        pause = !pause;
    }
});

