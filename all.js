
const start = document.querySelector(".btn");
const gamePage = document.querySelector(".gamePage");
const startPage = document.querySelector(".startPage");
const again = document.querySelector(".hirstoryScore .btn");
const hirstoryScore = document.querySelector('.hirstoryScore');
let screen = '';
let x;
let y;

class Snake {
    constructor() {
        this.snakeBody = document.getElementsByClassName('snake-body');
        this.scope = document.querySelector('.scope');
        this.bait = document.getElementsByClassName('bait');
        this.scorePoint = document.querySelector('.score-point');
        this.hirstoryScore = document.querySelector('.hirstoryScore');
        this.result = document.querySelector('.hirstoryScore .title-right');
        this.mp3 = document.querySelector('.mp3');
        this.point = 1000;
        this.snakeBodyPos = [];
        this.body = []
        this.key = 'ArrowLeft';
        this.stop = false;
        this.borderRadius = 0;
    }
    set curDirection(element) {
        this.key = element;
    }
    get curDirection() {
        return this.key
    }
    firstElementTranslate(element, direction) {
        switch (direction) {
            case 'up':
                element.style.borderRadius = '15px 15px 0 0';
                break;
            case 'left':
                element.style.borderRadius = '15px 0 0 15px';
                break;
            case 'right':
                element.style.borderRadius = '0 15px 15px 0';
                break;
            case 'down':
                element.style.borderRadius = '0 0 15px 15px';
                break;
            default:
                break;
        }

    }

    update(topMove, leftMove, direction) {
        for (let i = 0; i < this.snakeBody.length; i++) {
            //結束遊戲繼續更新避免拖拉畫面跑版
            if (this.stop && !direction) {
                this.snakeBody[i].style.top = (this.snakeBody[i].dataset.top * this.snakeBody[0].clientHeight) + 'px';
                this.snakeBody[i].style.left = (this.snakeBody[i].dataset.left * this.snakeBody[0].clientWidth) + 'px';
                this.bait[0].style.top = (this.bait[0].dataset.top * this.bait[0].clientHeight) + 'px';
                this.bait[0].style.left = (this.bait[0].dataset.left * this.bait[0].clientWidth) + 'px';
                continue;
            }
            if (i === 0) {
                this.body[i].top = this.isThroughWall(Number(this.snakeBody[i].dataset.top), 'vertical');
                this.body[i].left = this.isThroughWall(Number(this.snakeBody[i].dataset.left), 'horizontal');
                this.body[i].direction = direction;
                this.snakeBody[i].dataset.top = this.isThroughWall(this.body[i].top + topMove, 'vertical');
                this.snakeBody[i].dataset.left = this.isThroughWall(this.body[i].left + leftMove, 'horizontal');
                this.snakeBody[i].style.top = (this.isThroughWall(this.body[i].top + topMove, 'vertical') * this.snakeBody[0].clientHeight) + 'px';
                this.snakeBody[i].style.left = (this.isThroughWall(this.body[i].left + leftMove, 'horizontal') * this.snakeBody[0].clientWidth) + 'px';
                this.firstElementTranslate(this.snakeBody[i], direction);
                this.isDie();
                if (this.snakeBody[0].dataset.left === this.bait[0].dataset.left &&
                    this.snakeBody[0].dataset.top === this.bait[0].dataset.top) {
                    this.addChildAndAddPoint();
                }
            } else {
                this.body[i].top = Number(this.snakeBody[i].dataset.top);
                this.body[i].left = Number(this.snakeBody[i].dataset.left);
                this.snakeBody[i].dataset.top = this.body[i - 1].top;
                this.snakeBody[i].dataset.left = this.body[i - 1].left;
                this.snakeBody[i].style.top = (this.body[i - 1].top * this.snakeBody[0].clientHeight) + 'px';
                this.snakeBody[i].style.left = (this.body[i - 1].left * this.snakeBody[0].clientWidth) + 'px';
            }
            this.snakeBodyPos[i] = {
                top: this.snakeBody[i].offsetTop / this.snakeBody[0].clientHeight,
                left: this.snakeBody[i].offsetLeft / this.snakeBody[0].clientWidth
            }
        }
        this.bait[0].style.top = (this.bait[0].dataset.top * this.bait[0].clientHeight) + 'px';
        this.bait[0].style.left = (this.bait[0].dataset.left * this.bait[0].clientWidth) + 'px';
    }
    randomArray(num) {
        const arr = new Array(num).fill(undefined);
        while (arr.filter((item) => item === undefined).length) {
            const randomNum = Math.floor(Math.random() * arr.length - 1) + 1;
            if (arr.indexOf(randomNum) === -1) {
                const index = arr.indexOf(undefined);
                arr[index] = randomNum;
            }
        }
        return arr
    }
    baitRandom() {

        const topRandomArr = this.randomArray(Math.floor(this.scope.clientHeight / this.bait[0].clientHeight));
        const leftRandomArr = this.randomArray(Math.floor(this.scope.clientWidth / this.bait[0].clientWidth));
        let noFindPos = true;
        let baitTop;
        let baitLeft;
        while (topRandomArr.length > 0 && noFindPos) {
            let curTop = topRandomArr.shift();
            let snakeSameTop = this.snakeBodyPos.filter((item) => item.top === curTop);
            if (snakeSameTop.length > 0) {
                leftRandomArr.forEach((leftRandom) => {
                    if (!this.snakeBodyPos.some((item) => item.left === leftRandom)) {
                        noFindPos = false;
                        baitLeft = leftRandom;
                        baitTop = curTop;
                    }
                })
            } else {
                baitTop = curTop;
                baitLeft = leftRandomArr[0];
                noFindPos = false;
            }
        }
        if (topRandomArr.length === 0) {
            this.snakeResult('WIN');
            this.removeListener();
            return true
        } else {
            this.bait[0].style.top = (baitTop * this.bait[0].clientHeight) + 'px';
            this.bait[0].style.left = (baitLeft * this.bait[0].clientWidth) + 'px';
            this.bait[0].dataset.top = baitTop;
            this.bait[0].dataset.left = baitLeft;
        }
    }
    removeListener() {
        window.removeEventListener('keydown', direction);
        gamePage.removeEventListener('touchstart', startPhoneDirection);
        gamePage.removeEventListener('touchmove', movePhoneDirection);
    }
    direction(e) {
        if (this.stop) { return this.update(0, 0, '') }

        switch (e) {
            case 'ArrowUp':
                if (this.body[0].direction === 'down') {
                    this.update(1, 0, 'down')
                } else {
                    this.update(-1, 0, 'up')
                }
                this.key = 'ArrowUp';
                break;
            case 'ArrowLeft':
                if (this.body[0].direction === 'right') {
                    this.update(0, 1, 'right')
                } else {
                    this.update(0, -1, 'left')
                }
                this.key = 'ArrowLeft';
                break;
            case 'ArrowRight':
                if (this.body[0].direction === 'left') {
                    this.update(0, -1, 'left')
                } else {
                    this.update(0, 1, 'right')
                }
                this.key = 'ArrowRight';
                break;
            case 'ArrowDown':
                if (this.body[0].direction === 'up') {
                    this.update(-1, 0, 'up')
                } else {
                    this.update(1, 0, 'down')
                }
                this.key = 'ArrowDown';
                break;
            default:
                break;
        }
    }
    addChildAndAddPoint() {
        if (this.baitRandom()) { return }
        this.body.push({
            left: this.body[this.body.length - 1].left + this.bait[0].clientWidth,
            top: this.body[this.body.length - 1].top + this.bait[0].clientWidth,
            direction: this.body[this.body.length - 1].direction
        });
        let div = document.createElement('div');

        div.className = 'snake-body';
        div.style.left = (this.body[this.body.length - 1].left * this.bait[0].clientWidth) + 'px';
        div.style.top = (this.body[this.body.length - 1].top * this.bait[0].clientWidth) + 'px';
        this.scope.append(div);
        this.scorePoint.textContent = Number(this.scorePoint.textContent) + this.point;
    }
    isThroughWall(num, direction) {
        switch (direction) {
            case 'vertical':
                if (num < 0) {
                    return Math.floor(this.scope.clientHeight / this.snakeBody[0].clientHeight - 1);
                } else if (num > Math.floor(this.scope.clientHeight / this.snakeBody[0].clientHeight - 1)) {
                    return 0;
                } else {
                    return num
                }
            case 'horizontal':
                if (num < 0) {
                    return Math.floor(this.scope.clientWidth / this.snakeBody[0].clientWidth - 1);
                } else if (num > Math.floor(this.scope.clientWidth / this.snakeBody[0].clientWidth - 1)) {
                    return 0;
                } else {
                    return num
                }
        }
    }
    appear() {
        this.body.forEach((item) => {
            let div = document.createElement('div');
            div.className = 'snake-body';
            div.style.left = (item.left * getComputedStyle(document.documentElement).getPropertyValue("--snakeBodyWidth").slice(0, -2)) + 'px';
            div.style.top = (item.top * getComputedStyle(document.documentElement).getPropertyValue("--snakeBodyHeight").slice(0, -2)) + 'px';
            div.dataset.top = item.top;
            div.dataset.left = item.left;
            this.scope.append(div);
        })
    }
    isDie() {
        let firstTop = this.snakeBody[0].offsetTop;
        let firstLeft = this.snakeBody[0].offsetLeft;
        for (let i = 0; i < this.snakeBody.length; i++) {
            if (i === 0) { continue }
            if (firstTop === this.snakeBody[i].offsetTop && firstLeft === this.snakeBody[i].offsetLeft) {
                this.snakeResult('LOSE');
                this.removeListener();
            }
        }
    }
    snakeResult(text) {
        this.hirstoryScore.classList.remove('close');
        this.stop = true;
        this.result.textContent = text;
        this.mp3.pause();
    }
    addBait() {
        const bait = document.createElement('div');
        bait.className = 'bait';
        for (let i = 0; i < 6; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            bait.append(dot)
        }
        this.scope.prepend(bait);
    }
    init() {
        this.snakeBodyPos = [];
        this.body = [
            {
                left: Math.ceil(Math.floor(this.scope.clientWidth / this.snakeBody[0].clientWidth) / 2),
                top: Math.ceil(Math.floor(this.scope.clientHeight / this.snakeBody[0].clientHeight) / 2),
                direction: 'left',
            },
            {
                left: Math.ceil(Math.floor(this.scope.clientWidth / this.snakeBody[0].clientWidth) / 2) + 1,
                top: Math.ceil(Math.floor(this.scope.clientHeight / this.snakeBody[0].clientHeight) / 2),
                direction: 'left',
            },
            {
                left: Math.ceil(Math.floor(this.scope.clientWidth / this.snakeBody[0].clientWidth) / 2) + 2,
                top: Math.ceil(Math.floor(this.scope.clientHeight / this.snakeBody[0].clientHeight) / 2),
                direction: 'left',
            }
        ]

        this.key = 'ArrowLeft';
        this.stop = false;
        this.scope.textContent = '';
        this.scorePoint.textContent = 0;
        this.appear();
        this.addBait();
        this.baitRandom();

        this.mp3.load();
        this.mp3.play();
    }
}

startPage.addEventListener('keydown', direction);

let newSnake;

function startGame() {
    let num = 10;
    start.style.pointerEvents = 'none';
    window.addEventListener('keydown', direction);
    gamePage.addEventListener('touchstart', startPhoneDirection);
    gamePage.addEventListener('touchmove', movePhoneDirection);
    const timer = setInterval(() => {
        num--;
        startPage.style.opacity = num / 10;
        if (num <= 0) {
            clearInterval(timer);
            startPage.classList.add('close');
            gamePage.classList.remove('close');

            newSnake = new Snake();
            newSnake.init();
            window.requestAnimationFrame(update)
            window.requestAnimationFrame(bgUpdate)
        }
    }, 120)
}

start.addEventListener("click", function (e) {
    startGame();

});

again.addEventListener("click", function () {
    window.addEventListener('keydown', direction);
    gamePage.addEventListener('touchstart', startPhoneDirection);
    gamePage.addEventListener('touchmove', movePhoneDirection);
    newSnake = new Snake();
    hirstoryScore.classList.add('close')
    newSnake.init();
    window.requestAnimationFrame(update)
    window.requestAnimationFrame(bgUpdate)
});

function direction(e) {
    let key = e.key;
    if (key === 'ArrowUp' || key === 'ArrowLeft'
        || key === 'ArrowDown' || key === 'ArrowRight') {
        newSnake.curDirection = key;
    }
}

function startPhoneDirection(e) {
    x = e.targetTouches[0].clientX;
    y = e.targetTouches[0].clientY;
}

function movePhoneDirection(e) {
    const curX = e.targetTouches[0].clientX;
    const curY = e.targetTouches[0].clientY;
    const moveX = x > curX ? x - curX : curX - x;
    const moveY = y > curY ? y - curY : curY - y;

    if (moveX > moveY) {
        if (moveX < 10) { return }
        if (x > curX) {
            newSnake.curDirection = 'ArrowLeft';
        } else {
            newSnake.curDirection = 'ArrowRight';
        }
    } else {
        if (moveY < 10) { return }
        if (y > curY) {
            newSnake.curDirection = 'ArrowUp';
        } else {
            newSnake.curDirection = 'ArrowDown';
        }
    }
    x = curX;
    y = curY;
}


let color = getComputedStyle(document.documentElement).getPropertyValue("--bgColor");
let bgCount = 0
function bgUpdate() {
    bgCount++
    if (bgCount === 15) {
        if (color >= 480) {
            color = getComputedStyle(document.documentElement).getPropertyValue("--bgColor")
        } else {
            color = color * 1.015;
        }
        bgCount = 0;
    }
    document.querySelector('.gamePage').style.backgroundColor = `hsl(${color}, 20%, 20%)`;
    if (newSnake.stop) {
        bgCount = 0;
        color = getComputedStyle(document.documentElement).getPropertyValue("--bgColor");
        return
    }
    window.requestAnimationFrame(bgUpdate);
}

let count = 0;
function update() {
    count++;
    let snake = document.getElementsByClassName('snake-body');
    if (typeof snake?.[0]?.offsetLeft === 'number' && count === 10) {
        newSnake.direction(newSnake.curDirection);
        count = 0;
    }
    if (newSnake.stop) { return count = 0 }
    timer = window.requestAnimationFrame(update)
}


window.addEventListener('resize', function (e) {
    if (!newSnake) { return }
    if (e.target.innerWidth <= 650 && screen !== 'sm') {
        screen = 'sm';
        newSnake.scope.style.width = '340px';
        newSnake.scope.style.height = '190px'
        newSnake.bait[0].style.width = '15px';
        newSnake.bait[0].style.height = '15px';
        newSnake.snakeBody[0].style.width = '15px';
        newSnake.snakeBody[0].style.height = '15px';
        if (newSnake) { newSnake.direction(newSnake.key) }
    } else if (e.target.innerWidth > 650 && e.target.innerWidth < 1000 && screen !== 'md') {
        screen = 'md';
        newSnake.scope.style.width = '560px';
        newSnake.scope.style.height = '310px';
        newSnake.bait[0].style.width = '25px';
        newSnake.bait[0].style.height = '25px';
        newSnake.snakeBody[0].style.width = '25px';
        newSnake.snakeBody[0].style.height = '25px';
        if (newSnake) { newSnake.direction(newSnake.key) }
    } else if (e.target.innerWidth >= 1000 && screen !== 'lg') {
        screen = 'lg';
        newSnake.scope.style.width = '670px';
        newSnake.scope.style.height = '370px';
        newSnake.bait[0].style.width = '30px';
        newSnake.bait[0].style.height = '30px';
        newSnake.snakeBody[0].style.width = '30px';
        newSnake.snakeBody[0].style.height = '30px';
        if (newSnake) { newSnake.direction(newSnake.key) }
    }
})

