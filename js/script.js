/***************
 * * VECTOR *
 ******/

class Vector {
    constructor(x=0, y=0) {
        this.x =x;
        this.y =y;
    };

    get mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set mag(value) {
        const f = value / this.mag;
        this.x *= f;
        this.y *= f;
    }
};

/***************
 * *  COURT *
 *******/
 class Court{
    /**
     * 
     * @param {id of canvas div in html} canvas_id 
     */
    constructor(canvas_id) {
        this.canvas_id = canvas_id;
        this.canvas = null;
        this.context = null;
        this.unit = null;
    }

    init(){
        //sets body width and hight to 100% of viewport dimensions
        // and makes margin and padding 0px
        $('body').css('width', '100vw');
        $('body').css('height', '100vh');
        $('body').css('margin', '0px');
        $('body').css('padding', '0px');

        //gets canvas object for later use and enanbles multiscreen functionality
        this.canvas = document.getElementById(this.canvas_id);
        this.context = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.unit = this.canvas.height*.05;
    };

    resize(){
        $('body').css('width', '100vw');
        $('body').css('height', '100vh');
        $('body').css('margin', '0px');
        $('body').css('padding', '0px');

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    };

    width(){
        return this.canvas.width;
    };

    height(){
        return this.canvas.height;
    };

    drawCourt(){

        //drawing top and bttm border
        this.context.fillStyle = 'antiquewhite';
        this.context.fillRect(0, 0, this.canvas.width, this.unit);
        this.context.fillRect(0, this.canvas.height - this.unit, this.canvas.width, this.unit);

        //draw net
        for (let i = this.unit; i < this.canvas.height - this.unit; i += this.unit * 2) {
            this.context.fillRect(this.canvas.width / 2 - this.unit / 2, i, this.unit, this.unit);
          }
    };
};

/***************
 * * PAD*DLE * *
 **************/

class Paddle {
    /**
     * 
     * @param {the html id} id 
     * @param {first or second player} position 
     * @param {movement speed} dy 
     * @param {the court/canvas the paddle will be drawn onto} court
     * @param {it's what it says on the tin} initial_score
     */
    constructor(position, court, initial_score) { 
        this.court = court;
        this.position=position;
        this.y=0;
        this.x= 0;
        this.h = 0;
        this.w = 0;
        this.initial_score = initial_score;
        this.score = initial_score;
        this.delta_y = 0;
        this.last_y=0;
        this.wins = 0;
    }

    init() {
        //procedurally generates paddle
        //dynamiclly set width so that window can be resized
        //and accounts for variability in displays
        this.h = this.court.height()*.25;
        this.w = this.court.width()*.03;

        this.y=this.court.height()/2-this.h/2; //centres paddle vertically
        this.x= this.position == 1 ? this.w : this.court.width() - (this.w*2);
        //this.score = this.initial_score;
    }
    
    reset() {
        this.y=this.court.height()/2-this.h/2
        this.score = this.initial_score;
    }

    draw() {
        this.court.context.fillStyle='antiquewhite';
        this.court.context.fillRect(this.x, this.y, this.w, this.h);
    }
    
    move(delta_t){
        this.y += this.delta_y*delta_t;
    };

    update(delta_t){
        this.delta_y = (this.y - this.last_y) / delta_t;
        this.last_y = this.y;
    }
};

/****************
 * * * BALL * * *
 ***************/

class Ball{
    //cnt = centre point 
    //dx - displacement x
    //dy - displacement y
    //w - width
    //h - height
    //doesn't technically need w x h,
    //but to standardise it
    constructor(court) {
        this.court = court;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.v = new Vector; //velocity
        
    }

    init(){
        let size = this.court.height()*.05;
        this.w = size;
        this.h = size;
        this.x = this.court.width()/2 - size/2;
        this.y = this.court.height()/2 - size/2;
    }


    reset(){
        this.init();
    }

    draw() {
        this.court.context.fillStyle='antiquewhite';
        this.court.context.fillRect(this.x, this.y, this.w, this.h);
    }
};

/***************
 *  CONTROLLER *
 **************/
class Controller {

    constructor(court) {
        this.court = court;
        this.ball = new Ball(court);
        this.players = [
            new Paddle(1, court, 10),
            new Paddle(2, court, 10),
        ]

        this.accumulated_time = 0;
        //length of one frame if running at 60 fps
        this.step = 1/60;

        this.court.init();
        this.ball.init();
        this.players.forEach(player => player.init());
        
        //credit: Meth Meth Method - Youtube
        let lastTime = null;
        this._frameCallback = (millis) => {
            if (lastTime != null) {
                this.update((millis - lastTime)/1000);
                this.renderFrame();
            }
            lastTime = millis;
            requestAnimationFrame(this._frameCallback);
        };

        this.CHAR_PIXEL = this.court.unit/2;
        this.CHARS = [
            '111101101101111', //0
            '110010010010111', //1
            '111001111100111',//2
            '111001111001111',//3
            '101101111001001',//4
            '111100111001111',//5
            '111100111101111',//6
            '111001001001001',//7
            '111101111101111',//8
            '111101111001111',//9
        ].map(str => {
            const canvas = document.createElement('canvas');
            const s = this.CHAR_PIXEL;
            canvas.height = s * 5;
            canvas.width = s * 3;
            const context = canvas.getContext('2d');
            context.fillStyle = 'antiquewhite';
            str.split('').forEach((fill, i) => {
                if (fill === '1') {
                    context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
                }
            });
            return canvas;
        });

        //loads bounce sounds
        this.audio = [
            new Audio("../rsc/bounce_chi.mp3"),
            new Audio("../rsc/bounce_german.mp3"),
            new Audio("../rsc/bounce_grk.mp3"),
            new Audio("../rsc/bounce_nor.mp3"),
            new Audio("../rsc/bounce_rus.mp3"),
        ];

        this.reset();
    };

    init(){
        let paddle_speed = 600;
        /*
        * METHODOLOGY:
        * Adding and subtracting emulates potentiometric analog stick
        * on binary keys.
        * 
        * Also prevents stuttering or motion cancelling when switching keys too fast.
        */
        document.addEventListener("keydown", event => {
            if (event.key=="w") {
                this.players[0].delta_y += -paddle_speed;
                if (this.players[0].delta_y < -paddle_speed){
                    this.players[0].delta_y = -paddle_speed
                }
            } else 
            if(event.key=="s") {
                this.players[0].delta_y += paddle_speed;
                if (this.players[0].delta_y > paddle_speed){
                    this.players[0].delta_y = paddle_speed
                }          
            }
            
        });
        
        document.addEventListener('keyup', (event) => {
            if (event.key=="w") {
                this.players[0].delta_y += paddle_speed;
                console.log(event.key.toString());
            } else if (event.key=="s") this.players[0].delta_y += -paddle_speed;

            if (event.key=="ArrowDown"|| event.key=="VK_DOWN" || event.key=="kVK_DownArrow") {
                    this.players[1].delta_y += -paddle_speed;
            } else if (event.key=="ArrowUp"|| event.key=="VK_UP" || event.key=="kVK_UpArrow") this.players[1].delta_y += paddle_speed;
        });

        document.addEventListener('mousemove', event => {
            const scale = event.offsetY / event.target.getBoundingClientRect().height;
            this.players[0].y = this.court.height() * scale - this.players[0].h/2;
        });
    };

    //start and stop animations
    start() {
        requestAnimationFrame(this._frameCallback);
    };

    stop() {
        cancelAnimationFrame(this._frameCallback);
    }

    //only called on mouse click. essentially a serve/kick off
    play() {
        if(this.ball.v.x == 0 && this.ball.v.y == 0) {
            this.ball.v.x = 200 * (Math.random() > .5 ? 1 : -1);
            this.ball.v.y = 200 * (Math.random() * 2 - 1);
            this.ball.v.mag = 350;
        }
    };

    //resets game pieces to original position after winner
    newGame() {
        this.ball.reset();
        this.players.forEach(player => player.reset());
    };

    //gameloop
    simulate(delta_t)
    {
        this.ball.x += this.ball.v.x * delta_t;
        this.ball.y += this.ball.v.y * delta_t;

        this.validate_score();

        //floor/ceiling collisions
        if (this.ball.v.y < 0 && this.ball.y < this.court.unit ||
            this.ball.v.y > 0 && this.ball.y + this.ball.h > this.court.height()-this.court.unit) {
            this.audio[Math.floor(Math.random()*5)].play();
            this.ball.v.y = -this.ball.v.y;
            this.ball.v.x = this.ball.v.x*1.01; //excudes rare, although not impossible, chance of completely vertical movements that stall game;
        }                                       //avoids forced restart

        //move paddles
       
        //cpu "AI"
        if (this.players[1].y < this.ball.y-this.court.unit && this.ball.x > 3*this.court.width()/8) {
            this.players[1].y += 350*delta_t;
        } else if (this.players[1].y > this.ball.y+this.court.unit && this.ball.x > 3*this.court.width()/8) {
            this.players[1].y -= 350*delta_t;
        }
        
        this.players.forEach(player => {
            player.update(delta_t);
            if (player.y < this.court.unit) {
                player.y = this.court.unit;
            } else if (player.y+player.h > this.court.height() - this.court.unit) {
                player.y = this.court.height() - (player.h+this.court.unit);
            }
            this.collide(player, this.ball);
        });

        //this.renderFrame();
    };

    //uses delta t to calculate changes over an amount of accumulated time
    //compensates for skipped frames/variability in computer performance
    update(delta_t) {
        this.accumulated_time += delta_t;
        while(this.accumulated_time > this.step) {
            this.simulate(this.step);
            this.accumulated_time -= this.step
        }
    };

    //puts ball in center, unmoving
    reset(){
        this.ball.v.x = 0;
        this.ball.v.y = 0;
        this.ball.x = this.court.width() / 2 - this.ball.w/2;
        this.ball.y = this.court.height() / 2 ;
    };


    clearFrame(){
        this.court.context.fillStyle = '#000';
        this.court.context.fillRect(0, 0, this.court.width(), this.court.height());
    };

    renderFrame() {
        this.clearFrame();

        this.ball.draw();
        this.players.forEach(player => player.draw());

        this.court.drawCourt();
        this.drawScore();
    };

    drawScore()
    {
        //parses binary maps made in constructor to 3*5 characters
        //1 = white
        //0 = black
        const align = this.court.width() / 3;
        const cw = this.CHAR_PIXEL * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + this.CHAR_PIXEL / 2;
            chars.forEach((char, pos) => {
                this.court.context.drawImage(this.CHARS[char|0], offset + pos * cw, this.court.unit*1.5);
            });
        });
    }

    /********************
     * * LOGIC METHODS
     ********/

    collide(player, ball)
    {
        if ( player.x < ball.x+ball.w && player.x + player.w > ball.x&&
            player.y < ball.y+ball.h && player.y+player.h > ball.y) {
            this.audio[Math.floor(Math.random()*5)].play();
            ball.v.x = -ball.v.x * 1.1;
            const magnitude = ball.v.mag;
            ball.v.y += player.delta_y * .21;
            ball.v.mag = magnitude;
        }
    };

    validate_score() {
        if (this.ball.x < 0 || this.ball.x+this.ball.w > this.court.width()) {
            --this.players[this.ball.v.x > 0 | 0].score;
            this.players.forEach(player => console.log(player.score.toString()))
            if(this.players[0].score< 0) {
                this.players[1].wins+=1;
                gameOver('computer');
                this.reset();
            } else if(this.players[1].score<0){
                this.players[0].wins+=1;
                gameOver('player');
                this.reset();
            } else {
                this.reset();
            }
        }
    }    
};

var paddle_speed = 300;
var ball_speed = 400;
let pong_controller;
let resourcesToLoad = 0;

function startGame(){
    $('#start_screen').css('display', 'none');
    $('#game').css('display', 'block');
    $('#end_screen').css('display', 'none');

    pong_controller = new Controller(new Court('game'));
    pong_controller.init();
    pong_controller.court.canvas.addEventListener('click', () => pong_controller.play());

    pong_controller.start();
};

function replay(){
    $('#start_screen').css('display', 'none');
    $('#game').css('display', 'block');
    $('#end_screen').css('display', 'none');

    pong_controller.players.forEach(player => player.reset());
    pong_controller.start();
}

function gameOver(winner) {
    //pong_controller.clearFrame();
    pong_controller.stop();

    $('#start_screen').css('display', 'none');
    $('#game').css('display', 'none');
    $('#end_screen').css('display', 'block');

    $('#end_screen').css('background-color', 'black');
    $('#end_screen').css('width', `${window.innerWidth}`);
    $('#end_screen').css('height', `${window.innerHeight}`);

    $('#winner').text(` ${winner} wins.`);
    $('#p1_record').text(`player wins: ${pong_controller.players[0].wins.toString()}`);
    $('#p2_record').text(`computer wins: ${pong_controller.players[1].wins.toString()}`);
    $('#end_screen').css('color', 'antiquewhite');
};

window.onload = function() {

    //format start screen
    $('body').css('width', '100vw');
    $('body').css('height', '100vh');
    $('body').css('margin', '0px');
    $('body').css('padding', '0px');

    $('#start_screen').css('display', 'block');
    $('#start_screen').css('background-color', 'black');
    $('#start_screen').css('width', `${window.innerWidth}`);
    $('#start_screen').css('height', `${window.innerHeight}`);
    $('#start_screen').css('color', 'antiquewhite');
     
    $('#start_screen').css('align-items', 'center');

    $('a').css('border', '2px double antiquewhite');
    $('a').css('color', 'antiquewhite');
    $('a').css('margin-left', 'auto');
    $('a').css('margin-right', 'auto');
    $('a').css('margin-top', '5%');
    $('a').css('margin-bottom', '5%');
    $('a').css('padding', '5%');
    $('a').css('text-decoration', 'none');

    $('h1').css('margin', 'auto');
    $('h2').css('margin', 'auto');
    $('p').css('margin', 'auto');
    //window.addEventListener()
};

window.onresize = function() {
    pong_controller.court.resize();

    pong_controller.ball.init();
    pong_controller.players.forEach(player => player.init());
    pong_controller.renderFrame();

    pong_controller.court.drawCourt();
    //pong_controller.init();
};

// start the game
//requestAnimationFrame(gameloop);