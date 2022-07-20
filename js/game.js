import { utils } from "./utils.js";
// import { getRandomInt } from "./utils.js";

/**
 * Метод requestAnimationFrameпозволяет привязать перерисовку анимации
 * к циклу обновления браузера. Его реализация в разных браузерах 
 * несколько различается, поэтому стоит пользоваться кроссбраузерным 
 * вариантом:
 */
let requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;


var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

var bg = new Image();
var char = new Image();
var spriteGo = new Image();
var spriteImg = new Image();
var foodSprite = new Image();

bg.src = "./img/background.png";
bg.src = "./img/room.png";
char.src = "./img/character/stay_1.png";
spriteGo.src = "./img/character/sprites_go.png";
spriteImg.src = "./img/character/css_sprite.png"
foodSprite.src = "./img/food_sprite.png"

// sizes
const BG_W = cvs.width;
const BG_H = cvs.height;
const CHAR_W = 92; // 230
const CHAR_H = 180; // 450

findSize();
function findSize(){
    const z = 230;
    const z2 = 450;

    var res = 2.5;
    // 640 180
    console.log(z / res + " " + z2 / res);
}

// позиция персонажа
let xPos = 0;
let yPos = BG_H - CHAR_H;
// шаг персонажа
const STEP_H = 20; // увеличение по оси x
let step = STEP_H; // увеличение по оси x
let JUMP_H = CHAR_H / 2 + CHAR_H/10; // высота прыжка
const gravity = 4;

// GENERAL
let isGameStarted = false;
let score = 0;




// ==================SPRITES=====================
// класс для работы со спрайтами
class Sprite {
    isReversed = false;

    constructor(options) {
        this.ctx = options.ctx || canvas.getContext('2d');
        this.image = options.image || char;
        this.width = options.width || CHAR_W;
        this.height = options.height || CHAR_H;
        this.numberOfFrames = options.numberOfFrames || 1;

        // Каждый вызов метода update будет инкрементировать количество 
        // тиков обновления (tickCount). 
        // Если оно достигнет значения tickPerFrame, то будет сброшено, 
        // а индекс активного фрейма изменится
        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = options.ticksPerFrame || 0;

        // this.start();
    }

    flipHorizontally(ctx, img, x, y) {
        // move to x + img's width
        ctx.translate(x + img.width, y);

        // scaleX by -1; this "trick" flips horizontally
        ctx.scale(-1, 1);

        // draw the img
        // no need for x,y since we've already translated
        ctx.drawImage(img, 0, 0);

        // always clean up -- reset transformations to default
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    mirrorImage(ctx, image, x = 0, y = 0, horizontal = false, vertical = false) {
        ctx.save();  // save the current canvas state
        ctx.setTransform(
            horizontal ? -1 : 1, 0, // set the direction of x axis
            0, vertical ? -1 : 1,   // set the direction of y axis
            x + horizontal ? image.width : 0, // set the x origin
            y + vertical ? image.height : 0   // set the y origin
        );
        ctx.drawImage(image, 0, 0);
        ctx.restore(); // restore the state as it was when this function was called
    }

    flip() {
        this.ctx.save();
        this.ctx.translate(CHAR_W, 0);
        this.ctx.scale(-1, 1);
        //this.ctx.drawImage(char, xPos, yPos, 200, 200);
        // this.ctx.drawImage(char, xPos, yPos, 200, 200);
        // context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)        
        this.ctx.drawImage(
            this.image,
            this.frameIndex * this.width,
            0, // todo?
            this.width,
            this.height,
            -xPos, // this is terrible
            yPos,
            CHAR_W,
            CHAR_H
        )

        

        this.ctx.restore();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    render() {
        // !!! очистка todo
        //this.ctx.clearRect(0, 0, this.width / this.numberOfFrames, this.height);
        this.ctx.clearRect(0, 0, BG_W, BG_H);
        ctx.drawImage(bg, 0, 0, BG_W, BG_H);

        if (this.isReversed) {
            this.flip();
        } else {
            // отрисовка
            // context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
            this.ctx.drawImage(
                this.image,
                this.frameIndex * this.width,
                0, // todo?
                this.width,
                this.height,
                xPos,
                yPos,
                CHAR_W,
                CHAR_H
            )
        }
    }

    // метод, который будет обновлять позицию на спрайте, соответствующую активному фрейму
    // frameIndex – индекс активного фрейма;
    // tickCount – количество обновлений, произошедших после первого вывода текущего фрейма;
    // ticksPerFrame – количество обновлений, которые должны произойти до смены фреймов.
    update() {
        this.tickCount++;

        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            // если кончились фреймы:
            if (this.frameIndex < this.numberOfFrames - 1) {
                this.frameIndex++;
            } else {
                this.frameIndex = 0;
            }

        }
    }

    redraw() {
        let loop = () => {
            this.update();
            this.render();
        }
        return loop;
    }
    // requestDrawing;
    start() {
        window.requestAnimationFrame(this.redraw());
    }

    end() {
        window.cancelAnimationFrame(requestDrawing);
        // window.cancelAnimationFrame(requestDrawing);
    }
    goToFirstFrame() {
        this.frameIndex = 0;
    }
}

// Спрайты для анимаций // todo onLoad
const spriteDefault_character = new Sprite({
    ctx: canvas.getContext('2d'),
    image: spriteImg,
    width: 230,
    height: 450,
    numberOfFrames: 2,
    ticksPerFrame: 100,
});
const spriteGoing_character = new Sprite({
    ctx: canvas.getContext('2d'),
    image: spriteGo,
    width: 230,
    height: 450,
    numberOfFrames: 8,
    ticksPerFrame: 15,
});
let currentSprite = spriteDefault_character;
// ==================SPRITES=====================



// ==================food=====================
// вкусняшки
class Food {
    constructor(x, y, spriteId = 1, type = 1) {
        this.x = x;
        this.y = y;
        this.spriteId = spriteId;
        this.type = type; // (1) - good, (-1) - bad
    }
}
let gravityFood = 1; // увеличение по оси x
const FOOD_H_W = 140-90; // размеры
let food = [];
// спрайты еды
const sprite_food = new Sprite({
    ctx: canvas.getContext('2d'),
    image: food,
    width: 175,
    height: 175,
    numberOfFrames: 5,
    ticksPerFrame: 15, // todo
});
// ==================food=====================




// ==================   EVENTS  =====================
// клик на кнопку Начать игру
const btnStart = document.getElementById("btnStartGame"); // todo
btnStart.addEventListener("click", startGame); // todo
document.getElementById("btnEndGame").addEventListener("click", endGame);

var isSoundOn = true;

export function loadGame(){
    loadAudio();
    
    addAudioBtns();
}


export function startGame(){
    if (!isGameStarted){
        console.log("game started");
        isGameStarted = true;
        // char.onload = draw; // Первоначальная загрузка (при загрузке изображения char) // todo
        draw();
    
        // При нажатии на какую-либо кнопку
        document.addEventListener("keydown", onMove);
        document.addEventListener("keyup", animateStaying);
    }
}
//char.onload = draw; // Первоначальная загрузка (при загрузке изображения char) // todo
function writeScore(score){
    document.getElementById("scoreText").textContent = score;
}

export function endGame(){
    if (isGameStarted){
        console.log("game ended");        
        window.cancelAnimationFrame(draw);
        window.cancelAnimationFrame(draw);
        
        //cancelAnimationFrame(idA);
        // очистить весь холст
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// ==================DRAWING=====================
var requestDrawing;
export function draw() {        
    drawFood1();    
    drawCharacter();

    if (isGameStarted) {
        window.requestAnimationFrame(draw);
    }
    

}
function drawFood1() {
    // adding items
    if (food.length <= 6) {
        addRandomFood();
    }

    // drawing items and checks position 
    food.forEach(element => {
        let i = food.indexOf(element);

        // check x        
        if (isInTouch(i)) {
            eatFood(i); // deleting item from array
            if (element.type == 1) {
                score++;
            } else {
                score--;
            }            
        }

        // смещение вниз со скоростью (падение)
        element.y = element.y + gravityFood;

        if (element.y == BG_H) { // todo
            console.log("lose " + score);
            score--;
            removeFood(i);
        }

        // drawing
        ctx.drawImage(
            foodSprite,
            sprite_food.width * element.spriteId, 0,
            sprite_food.width, sprite_food.height,
            element.x, element.y,
            FOOD_H_W, FOOD_H_W
        );
    });
    writeScore(score);
}
function isInTouch(i) {
    const character_posX = xPos; // лево
    const character_posY = yPos; // верх
    const character_posToX = character_posX + CHAR_W;
    const character_posToY = character_posY + CHAR_H; //низ

    const food_posX = food[i].x; // лево
    const food_posY = food[i].y; // верх
    const food_posToX = food_posX + FOOD_H_W; // право
    const food_posToY = food_posY + FOOD_H_W; // низ

    // проверка по оси Х
    const checkCorner_l = character_posX >= food_posX && character_posX <= food_posToX;
    const checkCorner_r = character_posToX >= food_posX && character_posToX <= food_posToX;
    const checkCorner_between = food_posX >= character_posX && food_posToX <= character_posToX;
    const checkInX = checkCorner_l || checkCorner_r || checkCorner_between;

    // по оси У
    const isAbove = food_posY < character_posY;
    const isUnder = food_posY > character_posY;
    const isBetween = !isAbove && !isUnder;

    const inTouchTop = food_posToY >= character_posY && food_posY <= character_posToY;
    const inTouchBottom = food_posY <= character_posToY && food_posY >= character_posY;

    const general = checkInX && (inTouchTop || inTouchBottom || isBetween);
    //console.log("" + checkInX + inTouchTop + inTouchBottom + isBetween);
    return general;
}

function drawCharacter() {
    // рисуем персонажа по спрайту в зависимости от его действий
    currentSprite.start(); // todo    
}
// ==================DRAWING=====================



// ============== actions (use cases) =============
// ============== food ACTIONS============================
function addRandomFood(){
    food.push(new Food(
        utils.getRandomInt(BG_W - sprite_food.width),
        utils.getRandomInt(0),
        utils.getRandomInt(sprite_food.numberOfFrames),  
        //() => {if (this.spriteId == 1) return -1} // todo
    ));
}
function eatFood(i) {
    // убираем этот элемент    
    // const index = food.indexOf(i);
    console.log("eated");
    
    playAudio(eatAudio);
    
    removeFood(i);
}
function removeFood(i){
    const index = i;
    if (index > -1) { // only splice array when item is found
        food.splice(index, 1); // 2nd parameter means remove one item only
    }
}



// ============== character ACTIONS ============================
function move(x, y) {
    // 1 проверка краев полотна      
    if (xPos == 0 && x < 0) { // если дошли до начала и идем влево
        x = 0;
    // } else if (xPos >= (BG_W - CHAR_W) && x > 0) { // если дошли до конца и идем вправо
    } else if (xPos + CHAR_W >= BG_W - step && x > 0) { // если дошли до конца и идем вправо
        x = 0;
        
    } else if (yPos <= (0) && y < 0) { // вверх        
        y = 0;
    } else if (yPos >= (BG_H)) {
        y = 0;
    }

    // перемещение
    xPos += x; // увеличение по оси х 
    yPos = yPos + y; // увеличение по оси y 
}

function jump(x, y) {
    if (yPos < (CHAR_H - 1)) { // если в прыжке
        // ничего нельзя сделать
    } else {
        move(x, y); // подпрыгнули  

        // падаем
        let timer = setInterval(() => {
            move(x, gravity); // todo
            // если приземлились
            if (yPos >= BG_H - CHAR_H ) { 
                clearInterval(timer); 
            }

        }, 10);
    }
}
// ============== character ACTIONS  end============================



// ==================   animation =====================
// character animation
function animateStaying() {
    currentSprite.end();

    // в какую сторону стоит перс
    if (currentSprite.isReversed) {
        spriteDefault_character.isReversed = true;
    } else {
        spriteDefault_character.isReversed = false;
    }

    currentSprite = spriteDefault_character;
    // чтобы после действий персонаж возвращался в начальное состояние:
    currentSprite.goToFirstFrame();
}
function animateGoing() {
    //console.log("anime go");
    currentSprite.end();
    currentSprite = spriteGoing_character;
}
// ==================   animnation =====================






// Вызывается метод идти
function onMove(e) {
    let x = 0;
    let y = 0;

    switch (e.key) {
        case "ArrowLeft":  // если нажата клавиша влево
            x = -STEP_H;
            move(x, y); 
            playAudio(stepAudio);        

            animateGoing();
            currentSprite.isReversed = true;
            break;
        case "ArrowRight":   // если нажата клавиша вправо
            x = STEP_H;
            move(x, y);
            playAudio(stepAudio);        

            animateGoing();
            currentSprite.isReversed = false;
            break;
        case "ArrowUp":   // если нажата клавиша вверх
            y = -JUMP_H;
            if (!yPos < (CHAR_H - 1)) { // если не в прыжке 
                playAudio(jumpAudio);            
                jump(x, y);                 
            }
            // x, y = 0;
            break;
    }
    //console.log(`x=${xPos} y=${yPos}`);
}


// ================= MUSIC ===================
var stepAudio = new Audio();
var eatAudio = new Audio();
var jumpAudio = new Audio();
var endAudio = new Audio();

var clickAudio = new Audio();
var startAudio = new Audio();

function loadAudio(){    
    stepAudio.src = "./audio/step.wav";
    eatAudio.src = "./audio/eat.wav";
    clickAudio.src = "./audio/click.wav";
    startAudio.src = "./audio/start.wav";
    jumpAudio.src = "./audio/jump.wav";
    endAudio.src = "./audio/lose.wav";    

    isSoundOn = true;
}

function soundOff(){
    isSoundOn = false;
}

function playAudio(audio){
    if (isSoundOn) {
        audio.play();
    }
}

function addAudioBtns(){
    // adding audio for btns
    const btnsPixel = document.querySelectorAll(".btnPixel");    
    btnsPixel.forEach(item => {
        item.addEventListener("click", () => { playAudio(startAudio); }, false );
        item.addEventListener("mouseover", () => { playAudio(clickAudio); }, false );
    })
}


