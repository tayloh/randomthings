document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("keydown", keyDownHandler, false);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var lifebutton = document.getElementById('lifebutton');
var speedbutton = document.getElementById('speedbutton');
var shieldbutton = document.getElementById('shieldbutton');
var multiplybutton = document.getElementById('multiplybutton');

var running; //used to keep track of gameLoop() setInterval
var gameover = false;
var score = 500;
var scoreMult = 1;
var lives = 100;
var slowMotion = 1; //all slowmotion functions are out of date
var time = 0; //tracks the time of the game in seconds
var timeTick; //used to keep track of gameTime() setInterval
var scoreSaved = false; //prevent player from saving twice

var leftPressed = false;
var rightPressed = false;
var xPressed = false; //pause
var zPressed = false; //shield
var sPressed = false; //startgame

var shieldMeter = 100;
var shieldMax = 100;
var shielded = false;

var speedCost = 200;
var shieldMeterCost = 150;
var multiplierCost = 400;
var lifeCost = 500;

var groundHeight = 3;
var groundWidth = canvas.width;

var playerSide = 25;
var playerColor = "#5dc454";
var playerX = canvas.width/2 - (playerSide/2);
var playerY = canvas.height - playerSide; //consider adding y movement
var playerSpeed = 3;

var difficulty = 100;
var counter = 0; //used primarily in the gameLoop()
var endgame = false;
var colossusY = 0; //final boss

var obstArr = []; //all obstacles gets stored in here
var scoreObjectArr = []; //stores all values in the scoreboard
var levelArray = [];

//variables that change depending on level
var background = "#3b3f3d";
canvas.style.background = background;
var color = "white";
var level = 1;

//all game levels 1-10
levelArray[0] = new LevelObject(1, "#3b3f3d", "#a00606"); //boring
levelArray[1] = new LevelObject(2, "#a7c7e8", "#edf2f7"); //snow
levelArray[2] = new LevelObject(3, "#108223", "#824110"); //jungle
levelArray[3] = new LevelObject(4, "#c4c2c0", "#161616"); //city
levelArray[4] = new LevelObject(5, "#590800", "#fc6400"); //magma
levelArray[5] = new LevelObject(6, "#ffd400", "#fff0aa"); //desert
levelArray[6] = new LevelObject(7, "#fffef9", "#9b400f"); //thundra
levelArray[7] = new LevelObject(8, "#000000", "#969696"); //space
levelArray[8] = new LevelObject(9, "#003187", "#7797d1"); //water
levelArray[9] = new LevelObject(10, "#000000", "#111111"); //darkness
levelArray[10] = new LevelObject(11, "url(img/endgame.png)", "#0095DD"); //endgame

//EVENT HANDLERS--------------->

function keyDownHandler(e) {
  console.log(e.keyCode);
  if (e.keyCode == 39){
    rightPressed = true;
  }else if (e.keyCode == 37) {
    leftPressed = true;
  }

  if(e.keyCode == 90){
    zPressed = true;
  }

  if (e.keyCode == 88 && xPressed == false  && sPressed){
    xPressed = true;
    if(!gameover){
        pause();
    }
  }else if (e.keyCode == 88 && xPressed == true && sPressed){
    xPressed = false;
    if(!gameover){
        unpause();
    }
  }

  if(e.keyCode == 83){
    sPressed = true;
  }


}

function keyUpHandler(e) {
  if(e.keyCode == 39){
    rightPressed = false;
  }else if (e.keyCode == 37) {
    leftPressed = false;
  }

  if(e.keyCode == 90){
    zPressed = false;
  }
  //slowmotion
  if(e.keyCode == 67){
    //slowMotionHandler(); //not yet implementet correctly
  }
}

//DRAW FUNCTIONS-------------->

function drawGround() {
  ctx.beginPath();
  ctx.rect(0, canvas.height-groundHeight, groundWidth, groundHeight);
  ctx.fillStyle = "#9dc4b2";
  ctx.fill();
  ctx.closePath();
}

function drawPlayer() {
  ctx.beginPath();
  ctx.rect(playerX, canvas.height-(playerSide+groundHeight), playerSide, playerSide);
  ctx.fillStyle = playerColor;
  ctx.fill();
  ctx.closePath();
}

function drawShieldMeter() {
  ctx.beginPath();
  ctx.rect(canvas.width-15, canvas.height-shieldMeter-10, 10, shieldMeter);
  ctx.fillStyle = "rgba(0, 149, 221, 0.4)";
  ctx.fill();
  ctx.closePath();
}

function shieldHandler() {
  if(shieldMeter > 0){
    shielded = true;
    playerColor = "#eee";
    shieldMeter--;
  }else {
    shielded = false;
    playerColor = "#5dc454";
  }
}


//Falling obstacle objects are used to keep track of every falling object
function Obstacle(x, y, dx, dy, width, height, id) {
  this.x = x;
  this.y = y;
  this.dy = dy;
  this.dx = dx; // only used in level 11.
  this.width = width;
  this.height = height;
}

function addObstacle() {
  obstArr.push(new Obstacle(Math.random()*canvas.width, 2, 0, slowMotion*(2+Math.random()*4), 10 + Math.random()*15, 10 + Math.random()*15, 0));
}


function drawObstacles() {
  for(var i = 0; i < obstArr.length; i++){
    var o = obstArr[i];
    ctx.beginPath();
    ctx.rect(o.x, o.y, o.width, o.height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }
}

function colissionDetection() {
  for(var i = 0; i < obstArr.length; i++){
    var o = obstArr[i];
    if(o.x + o.width > playerX && o.x < playerX + playerSide && o.y >= canvas.height-(playerSide+2.5*o.dy)){
      if(!shielded && level == 10 && o.id != 1){ //id, så att den bara kan ta minus en gång.
        o.id = 1;
        scoreMult--;
      }
      if(!shielded) lives-=5;
      if(!shielded && lives <= 0) gameOver();
    }
  }
}

function drawColossus() {
  if(colossusY < canvas.height/2) colossusY += 0.1;
  ctx.beginPath();
  ctx.arc(canvas.width/2, colossusY, 70, 0, 2*Math.PI);
  ctx.fillStyle = "#111111";
  ctx.fill();
  ctx.closePath();
}

function addColossusObstacle() {
  for(var i = -5; i < 5; i++){
    obstArr.push(new Obstacle(canvas.width/2, colossusY, i*Math.random(), 4, 20, 20, 0));
  }
}

//ALL DRAW TEXT FUNCTIONS--------------->

function drawScore() {
  ctx.font = "35px Arial";
  ctx.fillStyle = "#eee";
  score += "";
  scoreMult+="";
  ctx.fillText("(" + scoreMult + "x) " + score, canvas.width-score.length*20-75-(scoreMult.length*15), 30);
  score*=1;
  scoreMult*=1;
}

function drawLives() {
  ctx.beginPath();
  ctx.rect(canvas.width-35, canvas.height-lives-10, 10, lives);
  ctx.fillStyle = "rgba(224, 20, 37, 0.4)";
  ctx.fill();
  ctx.closePath();
}

function drawTime() {
  ctx.font = "35px Arial";
  ctx.fillStyle = "#eee";
  ctx.fillText(time,(time+"").length*5, 30);
}

function drawLevelText() {
  ctx.font = "35px Arial";
  ctx.fillStyle = "#eee";
  ctx.fillText("Lv " + level, canvas.width/2-50, 30);
}

function drawEndGameText() {
  ctx.font = "35px Arial";
  ctx.fillStyle = "#eee";
  ctx.fillText("Endgame", canvas.width/2-50, 30);
}

function drawPreGameScreen() {
  ctx.font = "60px Arial";
  ctx.fillStyle = "#eee";
  ctx.fillText("PRESS S TO START", canvas.width/2-280, canvas.height/2);
}

//PAUSE UNPAUSE AND GAMEOVER FUNCTIONS ---------->

function pause() {

  clearInterval(running);
  clearInterval(timeTick);

  ctx.font = "60px Arial";
  ctx.fillStyle = "#eee";
  var text = "PAUSED";
  ctx.fillText(text, canvas.width/2 - (20*text.length), canvas.height/2-100);
}

function unpause() {
  running = setInterval(gameLoop, 10);
  timeTick = setInterval(gameTime, 1000);
}

function gameOver() {
  clearInterval(running);
  clearInterval(timeTick);
  gameover = true;
  //GAMEOVER TEXT
  ctx.font = "60px Arial";
  ctx.fillStyle = "#eee";
  var text = "GAME OVER";
  ctx.fillText(text, canvas.width/2 - (20*text.length), canvas.height/2-100);
  //SCORE TEXT
  ctx.font = "30px Arial";
  ctx.fillText("Final Score: " + score, canvas.width/2 - (5.5*("Final Score: " + score).length), 400);

  //CREATE ELEMENT FOR USER INPUT
  var userinput = document.createElement("INPUT");
  userinput.id = "username";
  userinput.autocomplete = "off";
  userinput.placeholder = "ENTER USERNAME";
  document.body.appendChild(userinput);

  //CREATE BUTTON FOR SAVING SCORE
  var savescore = document.createElement("H1");
  savescore.id = "save";
  savescore.onclick = saveScore;
  savescore.appendChild(document.createTextNode("SAVE SCORE"));
  document.body.appendChild(savescore);
}

function saveScore() {
  //if username exists && score is not already saved
  if(!scoreSaved && document.getElementById('username') && document.getElementById('username').value.length != 0){
    var user = document.getElementById('username');
    var tempUser = new ScoreObject(level, score, user.value);
    scoreSaved = true;
    sortScoreBoard(tempUser);
  }
}

function ScoreObject(level, score, name) {
  this.level = level;
  this.score = score;
  this.name = name;
}

function sortScoreBoard(item) {
  //sort 2 times
  scoreObjectArr.push(item);
  //sort by score first
  scoreObjectArr = scoreObjectArr.sort(function (a, b) {
    return a.score - b.score;
  });
  //sort by level
  scoreObjectArr = scoreObjectArr.sort(function (a, b) {
    return a.level - b.level;
  });
  scoreObjectArr = scoreObjectArr.reverse();
  //rearrangeas the current scoreboard and draws it a-new
  if(document.getElementById("scoreboard")){
    $("#scoreboard li").remove();
  }
  for(var i = 0; i < scoreObjectArr.length; i++){
    var listItem = document.createElement("li");
    listItem.appendChild(document.createTextNode(scoreObjectArr[i].name + " Lv " + scoreObjectArr[i].level + " Score " + scoreObjectArr[i].score));
    document.getElementById('scoreboard').appendChild(listItem);
  }
  console.log(document.getElementById('scoreboard'));
}

function newGame() {
  if(document.getElementById('username')){
    $("#username").remove();
    $("#save").remove();
  }
  playerX = canvas.width/2 - (playerSide/2);
  playerSpeed = 3;
  difficulty = 100;
  scoreSaved = false;
  gameover = false;
  lives = 100;
  time = 0;
  counter = 0;
  score = 500;
  scoreMult = 1;
  speedCost = 200;
  shieldMax = 100;
  shieldMeter = 100;
  shieldMeterCost = 150;
  multiplierCost = 400;
  lifeCost = 500;
  endgame = false;
  obstArr = []; //clears all falling objects
  lifebutton.innerHTML = "+Life - " + lifeCost;
  speedbutton.innerHTML = "+Speed - " + speedCost;
  shieldbutton.innerHTML = "+Shield - " + shieldMeterCost;
  multiplybutton.innerHTML = "+Score Multiplier - " + multiplierCost;
  clearInterval(running);
  clearInterval(timeTick);
  xPressed = false;
  sPressed = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  running = setInterval(gameLoop, 10);
  timeTick = setInterval(gameTime, 1000);
}

//PURCHASEABLE GAME FEAUTURES -------------------->
function increasePlayerSpeed() {
  if(!gameover){
    if(score >= speedCost && playerSpeed < 10){
        playerSpeed+=1;
        score-=speedCost;
        speedCost+=200;
        if(playerSpeed == 10){
          speedbutton.innerHTML = "MAX";
        }else {
          speedbutton.innerHTML = "+Speed - " + speedCost;
        }
        gameLoop(); //Updates the game when something is bought, which results in UI changes being applied
        pauseText();
      }
    }
}

function increaseShieldMeter() {
  if(!gameover){
    if(score >= shieldMeterCost && shieldMax < 300){
      shieldMax = shieldMax+25;
      if(shieldMax > 300){
        shieldMax = 300;
      }
      shieldMeter = shieldMax;
      score-=shieldMeterCost;
      shieldMeterCost+=100;
      if(shieldMax == 300){
        shieldbutton.innerHTML = "MAX";
      }else {
        shieldbutton.innerHTML = "+Shield - " + shieldMeterCost;
      }
      gameLoop();
      pauseText();
    }
  }
}

function increaseScoreMultiplier() {
  if(!gameover){
    if(score >= multiplierCost){
      scoreMult+=1;
      score-=multiplierCost;
      multiplierCost = parseInt(multiplierCost*1.2);
      multiplybutton.innerHTML = "+Score Multiplier - " + multiplierCost;
      gameLoop();
      pauseText();
    }
  }
}

function increaseLives() {
  if(!gameover){
    if(score >= lifeCost && lives < 300){
      lives+=50;
      if(lives > 300){
        lives == 300;
      }
      score-=lifeCost;
      lifeCost+=100;
      if(level >= 8){
        lifeCost = parseInt(lifeCost*1.2);
      }
      lifebutton.innerHTML = "+Life - " + lifeCost;
      console.log(lives);
      gameLoop();
      pauseText();
    }
  }

}

function pauseText() { //Keeps the PAUSED text applied to the screen even after looping the game for UI changes
  if(xPressed){
    ctx.font = "60px Arial";
    ctx.fillStyle = "#eee";
    var text = "PAUSED";
    ctx.fillText(text, canvas.width/2 - (20*text.length), canvas.height/2-100);
  }
}

//This function is not used at the moment
function slowMotionHandler() {
  counter = 100;
  for(var i = 0; i < obstArr.length; i++){
    obstArr[i].dy*=0.5;
    slowMotion = 0.5;
  }
}


//GAMETIME FUNCTION DECIDES WHAT LEVEL IS LOADED AND SETS THE DIFFICULTY-CONSTANT

function gameTime() {
  if(sPressed){
    time++;
  }
  if (time == 1) {
    loadLevel(levelArray, 0);
  }else if(time == 15){
    loadLevel(levelArray, 1);
    difficulty = 40;
  }else if (time == 45) {
    loadLevel(levelArray, 2);
    difficulty = 20;
  }else if (time == 90) {
    loadLevel(levelArray, 3);
    difficulty = 15;
  }else if (time == 120) {
    loadLevel(levelArray, 4);
    difficulty = 6;
  }else if (time == 150) {
    loadLevel(levelArray, 5);
    difficulty = 7;
  }else if (time == 230) {
    loadLevel(levelArray, 6);
    difficulty = 6;
  }else if (time == 310) {
    loadLevel(levelArray, 7);
    difficulty = 5;
  }else if (time == 400) {
    loadLevel(levelArray, 8);
    difficulty = 4;
  }else if (time == 460) {
    loadLevel(levelArray, 9);
    difficulty = 3;
  }else if (time == 500) {
    loadLevel(levelArray, 10);
    difficulty = 30;
    endgame = true;
    obstArr = [];
    counter = -100;
  }
}


function LevelObject(level, background, color) {
  this.level = level;
  this.background = background;
  this.color = color;
}

function loadLevel(arr, i) {
  background = arr[i].background;
  color = arr[i].color;
  level = arr[i].level;

  canvas.style.background = background;
}

//THE GAMELOOP ----------------->

function gameLoop() {
  if(sPressed){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //ALL DRAW FUNCTIONS ARE CALLED HERE
  drawGround();
  drawPlayer();

  if(counter % difficulty == 0 && counter > 100 && !endgame){ //Adds an object to the obstacle array. Lower DIFFICULTY-CONSTANT results in more objects
    addObstacle();
    score = score + 1*scoreMult;
  }else if(counter % difficulty == 0 && counter > 100 && endgame) {
    addColossusObstacle();
    score = score + 5*scoreMult;
  }

  if(!endgame){
    drawLevelText();
  }else { //if endgame == true
    drawEndGameText();
    drawColossus();
  }

  drawObstacles();
  colissionDetection();
  drawScore();
  drawShieldMeter();
  drawLives();
  drawTime();

  //Handles shield
  if(zPressed){
    shieldHandler();
  }else if(shieldMeter < shieldMax){
    shielded = false;
    shieldMeter+=0.5;
    playerColor = "#5dc454";
  }

  //Move all obstacles if the game is NOT paused, this if statement is needed when bying in the paused screen
  if(!xPressed && obstArr.length !=0){
  for(var i = 0; i < obstArr.length; i++){
    var o = obstArr[i];
    o.y += o.dy;
    o.x += o.dx;
  }
}

  //Checks if obstacles are out of canvas and if they are: removes them
  if(obstArr.length != 0){
  for(var i = 0; i < obstArr.length; i++){
    var o = obstArr[i];
    if(o.y+2*o.dy > canvas.height-groundHeight){
      obstArr.splice(i, 1);
    }
  }
}

  //Checks for player movement
  if(rightPressed && playerX < canvas.width-playerSide){
    playerX += playerSpeed;
  }else if (leftPressed && playerX > 0) {
    playerX -= playerSpeed;
  }

  //Supposed to remove slowmotion, logic is faulty /* DISABLED */
  if(counter%1000 == 0){
    for(var i = 0; i < obstArr.length; i++){
      slowMotion = 1;
    }
  }

  counter++;
}else {
  drawPreGameScreen();
}
}

function startGame() {
  console.log("Startgame called!");
  timeTick = setInterval(gameTime, 1000);
  running = setInterval(gameLoop, 10);
}


startGame();
