//page variables
var btnBegin;
var infoCloudCount;
var infoBirdCount;
var arenaCloudCount;

var mouseX;
var mouseY;
var willyInfo;


// --- SOUNDS
var shootSound, willyDeathSound, birdDeathSound, waveSound, gameOverSound;

// --- INTERVALS
var infoCloudInterval, infoBirdInterval, arenaCloudInterval, instMoveInterval, instAimInterval, instArrowInterval;

// --- CONTAINERS
var cloudContainer, infoBirdContainer;


// ------------------- VISUALS
// --- SPEECH
var isInstructions, instructionContainer,  imgSpeech;



// game variables
var stage = null;
var canvas = null;
var mousePointer;
// Keys
var downKey = false;
var upKey = false;
var leftKey = false;
var rightKey = false;
var key;

// frame rate of game
var frameRate = 30;




// game objects
var assetManager = null;
var arenaBird;
var bird = null;
var birds=[];
var arenaBirdsContainer;
var birdDelay;
var birdTimer;
var birdsShot;
var willy = null;
var cloud;
var arrow = null;
var arrows=[];
var shootInterval;
var isArrowsDepleted;
var arrowsDepletedInterval;
//START SCREEN ASSETS
var arrowPointer;

//arena assets
var livesText;

var killsText;

var enemiesText;
var numEnemiesText;

var waveText;
var numWaveText;
var scoreText;

var arrowsText;
var arrowsNumText;

//------game arena stats
var statsContainer;
var spritesheet;
var imgStatsBar;
var imgWave;
var numWave;
var numLives;
var numKills;
var numEnemies;
var numArrows;
var numArrowsWilly;
// increase this every wave
var targetNumEnemies



//info assets
var accuracy;
var numArrowsShot;
var resumeText;
var restartText;
var startBackground;
var arenaBackground;
var infoBackground;
var instructionsBackground;
var gameTitle;
var infoTitle;
var newGame;
var resumeGame;
var quitGame;
var instructions;
var btnPause;
var btnThanks;
var developerCredits;

var direction;
//Gameplay Booleans
var isGameOver;
//collision detection
collisionMethod = ndgmr.checkPixelCollision;
window.alphaThresh = 0.75;



// ------------------------------------------------------------ event handlers
function onInit() {
    // get reference to canvas
    canvas = document.getElementById("stage");
    // set canvas to as wide/high as the browser window
    canvas.width = 600;
    canvas.height = 600;
    // create stage object
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);

    cloudContainer = new createjs.Container();
    infoBirdContainer = new createjs.Container();
    arenaBirdsContainer = new createjs.Container();

    // construct preloader object to load spritesheet and sound assets
    assetManager = new AssetManager();
    stage.addEventListener("onAssetLoaded", onProgress);
    stage.addEventListener("onAllAssetsLoaded", onReady);
    // load the assets
    assetManager.loadAssets(manifest);
    btnBegin = document.getElementById("btnBegin");
    btnBegin.disabled = true;

    //sounds
    createjs.Sound.registerSound("sounds/pew.ogg", "shootArrow");
    createjs.Sound.registerSound("sounds/willy_dead.ogg", "willyDies");
    createjs.Sound.registerSound("sounds/bird_dead.ogg", "birdDies");
    createjs.Sound.registerSound("sounds/wave_complete.ogg", "waveComplete");
    createjs.Sound.registerSound("sounds/game_over.ogg", "gameOver");

}

function onProgress(e) { console.log("progress: " + assetManager.getProgress());}

function onReady(e) {

    // Adding aimer for the mouse
    mousePointer = assetManager.getSprite("assets");
    mousePointer.gotoAndStop("mousePointer");
    canvas.addEventListener("mouseenter", addMousePointer);
    canvas.addEventListener("mouseout", removeMousePointer);

    //enable the begin button when the game is ready
    btnBegin.disabled = false;
    $('#btnBegin').click(function(){
        //$("div#main").fadeIn(800);
        $('html, body').animate({
            scrollTop: $("#main").offset().top
        }, 750);
        btnBegin.disabled = true;
    });

    //clear stage
    stage.removeAllChildren();
    // kill event listener
    stage.removeEventListener("onAssetLoaded", onProgress);
    stage.removeEventListener("onAllAssetsLoaded", onReady);

    //FIRST TIME VISIT - isInstructions should = true
    isInstructions = true;
    loadStartScreen();

     // setup event listeners for keyboard keys
    document.addEventListener("keydown", onKeyDownStartScreen);
    document.removeEventListener("keydown", onKeyDownGameOverScreen);
    document.removeEventListener("keydown", keyDownMove);
    document.removeEventListener("keyup", keyUpMove);
    // startup the ticker
    createjs.Ticker.setFPS(frameRate);
    createjs.Ticker.addEventListener("tick", onTick);
}
function onNewGame(e) {

    stage.removeAllChildren();
    infoBirdContainer.removeAllChildren();
    cloudContainer.removeAllChildren();

    // remove/setup event listeners for keyboard keys
    document.removeEventListener("keydown", onKeyDownStartScreen);
    document.removeEventListener("keydown", onKeyDownGameOverScreen);
    document.addEventListener("keydown", onKeyDownArenaScreen);

    // RESET Game Variables
    spritesheet = assetManager.getSpriteSheet("assets");
    statsContainer = new createjs.Container();
    stage.addChild(statsContainer);
    isGameOver = false;
    numWave = 1;
    //state game with 10 arrows
    numArrowsWilly = 10;
    //start game with 10 enemies
    targetNumEnemies = 2;
    // decrease numEnemies each kill - at the start of a wave the numEnemies is set to the new targetNumEnemies
    numEnemies = targetNumEnemies;
    //Generate birds right away if the player has restarted
    if(!isInstructions){
        // construct and setup birdTimer to drop birds on displaylist
        birdDelay = 2000;
        birdTimer = window.setInterval(onAddBird, birdDelay);
    }

    loadArenaScreen();

    // --- SHOOTING FUNCTION - Mouse Pointer ----
    //delay shooting ability by half a second - will prevent arrow from being fired when the arena intially loads
    shootInterval = setTimeout(function(){
        stage.addEventListener("click", function(e) {
            mouseX = Math.floor(e.stageX);
            mouseY = Math.floor(e.stageY);
        });
        stage.addEventListener("click", shootProjectile);
        clearTimeout(shootInterval);
    }, 500);
}
function keyDownMove(e){
    key = e.which;
    if(key == "37" || key == "65"){
        //direction = "left";
        leftKey = true;
        e.preventDefault();
    } else if(key == "38" || key == "87"){
        //direction = "up";
        upKey = true;
        e.preventDefault();
    }else if(key == "39" || key == "68"){
        //direction = "right";
        rightKey = true;
        e.preventDefault();
    }else if(key == "40" || key == "83"){
        //direction = "down";
        downKey = true;
        e.preventDefault();
    }
}
function keyUpMove(e){
    key = e.which;
    if(key == "37" || key == "65"){
        //direction = "left";
        leftKey = false;
        e.preventDefault();
    } else if(key == "38" || key == "87"){
        //direction = "up";
        upKey = false;
        e.preventDefault();
    }else if(key == "39" || key == "68"){
        //direction = "right";
        rightKey = false;
        e.preventDefault();
    }else if(key == "40" || key == "83"){
        //direction = "down";
        downKey = false;
        e.preventDefault();
    }
}
function moveWilly(){
    if(leftKey){
        willy.moveLeft();
    } else if(upKey){
        willy.moveUp();
    }else if(rightKey){
        willy.moveRight();
    }else if(downKey){
        willy.moveDown();
    }
}

function onPause(e){

    if(!willy.getIsPaused()){
        //game is paused
        willy.setIsPaused(true);
        clearInterval(birdTimer);
        stage.removeChild(infoTitle);
        infoTitle = assetManager.getSprite("assets");
        infoTitle.gotoAndStop("pauseText");
        infoTitle.x = 200;
        infoTitle.y = 175;
        stage.addChild(infoTitle);
        stage.removeEventListener("click", shootProjectile);
        stage.removeChild(btnPause);
        btnPause = assetManager.getSprite("assets");
        btnPause.x = 500;
        btnPause.y = 515;
        btnPause.gotoAndStop("btnResume");
        // setup event listener to go to pause screen
        btnPause.addEventListener("click", onPause);
        stage.addChild(btnPause);
        addMousePointer();
    }else{
        //game is playing
        willy.setIsPaused(false);
        birdTimer = window.setInterval(onAddBird, birdDelay);
        stage.removeChild(infoTitle);
        stage.removeChild(btnPause);
        btnPause = assetManager.getSprite("assets");
        btnPause.x = 500;
        btnPause.y = 515;
        btnPause.gotoAndStop("btnPause");
        // setup event listener to go to pause screen
        btnPause.addEventListener("click", onPause);
        stage.addChild(btnPause);
        addMousePointer();
        shootInterval = setTimeout(function(){
            stage.addEventListener("click", shootProjectile);
            clearTimeout(shootInterval);
        }, 500);
    }
}
function onQuitGame(e){
    onReady();
}
function onInstructions(e){
    document.removeEventListener("keydown", onKeyDownGameOverScreen);
    document.removeEventListener("keydown", onKeyDownStartScreen);
    instructionsBackground = assetManager.getSprite("assets");
    instructionsBackground.gotoAndStop("instructionsBackground");
    stage.addChild(instructionsBackground);

    btnThanks = assetManager.getSprite("assets");
    btnThanks.x = 210;
    btnThanks.y = 450;
    btnThanks.gotoAndStop("btnThanks");
    stage.addChild(btnThanks);
    btnThanks.addEventListener("click", function(){
        if(!isGameOver){
            document.addEventListener("keydown", onKeyDownGameOverScreen);
        }else{
            document.addEventListener("keydown", onKeyDownStartScreen);
        }
        stage.removeChild(instructionsBackground);
        stage.removeChild(btnThanks);
    });
    addMousePointer();
}
function onPauseHover(e){
    stage.removeChild("btnPause");
}
function addMousePointer(){
    $( "#stage" ).mousemove(function( event ) {
        mousePointer.x = stage.mouseX - 20;
        mousePointer.y = stage.mouseY - 20;
    });
    stage.addChild(mousePointer);
}
function removeMousePointer(){
    stage.removeChild(mousePointer);
}
// --------- LOAD SCREEN ASSETS --------

function loadStartScreen(){

    stage.removeAllChildren();
    infoBirdContainer.removeAllChildren();
    cloudContainer.removeAllChildren();

    //Add in Clear Interval Function and pass it desired interval
    clearInterval(infoCloudInterval);
    clearInterval(infoBirdInterval);
    clearInterval(arenaCloudInterval);

    startBackground = assetManager.getSprite("assets");
    startBackground.gotoAndStop("startBackground");
    stage.addChild(startBackground);

    stage.addChild(cloudContainer);
    stage.addChild(infoBirdContainer);

    imgSpeech = assetManager.getSprite("assetsCharacters");
    imgSpeech.x = 320;
    imgSpeech.y = 425;
    imgSpeech.gotoAndStop("speech_start_screen");
    stage.addChild(imgSpeech);

    willy = new Willy(stage, assetManager);
    willy.resetMe();
    willy.setXPosYPos(295, 490);

    //add clouds and backgrounds
    addBirdsInfoScreen(3);
    addCloudsInfoScreen(4);

    gameTitle = assetManager.getSprite("assets");
    gameTitle.x = 120;
    gameTitle.y = 125;
    gameTitle.gotoAndStop("gameTitleText");
    stage.addChild(gameTitle);

    arrowPointer = assetManager.getSprite("assets");
    arrowPointer.x = 200;
    arrowPointer.y = 339;
    arrowPointer.gotoAndStop("arrowPointer");
    stage.addChild(arrowPointer);

    newGame = assetManager.getSprite("assets");
    newGame.x = 240;
    newGame.y = 325;
    newGame.gotoAndStop("newGameText");
    stage.addChild(newGame);
    // setup event listener to start game
    newGame.addEventListener("click", onNewGame);

    instructions = assetManager.getSprite("assets");
    instructions.x = 240;
    instructions.y = 365;
    instructions.gotoAndStop("instructionsText");
    stage.addChild(instructions);
    // setup event listener to instructions
    instructions.addEventListener("click", onInstructions);

    developerCredits = assetManager.getSprite("assets");
    developerCredits.x = 235;
    developerCredits.y = 575;
    developerCredits.gotoAndStop("developerText");
    stage.addChild(developerCredits);

    addMousePointer();
}
function loadArenaScreen(){
    //remove and reset assets
    stage.removeAllChildren();
    clearInterval(infoCloudInterval);
    clearInterval(infoBirdInterval);

    arenaBackground = assetManager.getSprite("assets");
    arenaBackground.gotoAndStop("arenaBackground");
    stage.addChild(arenaBackground);

    // -- WILLY --
    willy = new Willy(stage, assetManager);
    willy.resetMe();
    willy.setKillCount(0);
    willy.setNumArrows(10);
    willy.setXPosYPos(310, 350);

    //IF NEW GAME
    if(isInstructions){
        instructionContainer = new createjs.Container();
        imgSpeech = assetManager.getSprite("assetsCharacters");
        imgSpeech.x = 100;
        imgSpeech.y = 250;
        imgSpeech.gotoAndStop("instruc_move");
        instructionContainer.addChild(imgSpeech);

        stage.addChild(instructionContainer);

        instMoveInterval = setTimeout(function(){
            instructionContainer.removeChild(imgSpeech);
            imgSpeech = assetManager.getSprite("assetsCharacters");
            imgSpeech.x = 325;
            imgSpeech.y = 250;
            imgSpeech.gotoAndStop("instruc_aim");
            instructionContainer.addChild(imgSpeech);
            clearInterval(instMoveInterval);
        }, 4000);
        instAimInterval = setTimeout(function(){
            instructionContainer.removeChild(imgSpeech);
            imgSpeech = assetManager.getSprite("assetsCharacters");
            imgSpeech.x = 100;
            imgSpeech.y = 250;
            imgSpeech.gotoAndStop("instruc_arrow");
            instructionContainer.addChild(imgSpeech);
            clearInterval(instAimInterval);
        }, 8000);
         instArrowInterval = setTimeout(function(){
            instructionContainer.removeAllChildren();
            clearInterval(instArrowInterval);
            //now start generating birds
            birdDelay = 2000;
            birdTimer = window.setInterval(onAddBird, birdDelay);
            // add pause button
            btnPause = assetManager.getSprite("assets");
            btnPause.x = 500;
            btnPause.y = 515;
            btnPause.gotoAndStop("btnPause");
            stage.addChild(btnPause);
            // setup event listener to go to pause screen
            btnPause.addEventListener("click", onPause);
            //delay willy movement
            document.addEventListener("keydown", keyDownMove);
            document.addEventListener("keyup", keyUpMove);
        }, 12000);
    }else{
        // add pause button right away
        btnPause = assetManager.getSprite("assets");
        btnPause.x = 500;
        btnPause.y = 515;
        btnPause.gotoAndStop("btnPause");
        stage.addChild(btnPause);
        // setup event listener to go to pause screen
        btnPause.addEventListener("click", onPause);
        //let willy move right away
        document.addEventListener("keydown", keyDownMove);
        document.addEventListener("keyup", keyUpMove);
    }

    //add clouds
    stage.addChild(cloudContainer);
    addCloudsArenaScreen(4);

    //add birds container
    arenaBirdsContainer.removeAllChildren();
    stage.addChild(arenaBirdsContainer);

    // -- Stats Assets

    imgStatsBar = assetManager.getSprite("assetsCharacters");
    imgStatsBar.x = 0;
    imgStatsBar.y = 0;
    imgStatsBar.gotoAndStop("stats_bar");
    statsContainer.addChild(imgStatsBar);

    numLives = new createjs.BitmapText(willy.getLives().toString(), spritesheet);
    numLives.x = 115;
    numLives.y = 10;
    statsContainer.addChild(numLives);

    numKills = new createjs.BitmapText(willy.getKillCount().toString(), spritesheet);
    numKills.x = 265;
    numKills.y = 10;
    statsContainer.addChild(numKills);

    numEnemiesText = new createjs.BitmapText(numEnemies.toString(), spritesheet);
    if(numEnemies < 20){
        numEnemies.letterSpacing = 5;
    }
    numEnemiesText.x = 415;
    numEnemiesText.y = 10;
    statsContainer.addChild(numEnemiesText);

    numArrows = new createjs.BitmapText(willy.getNumArrows().toString(), spritesheet);
    numArrows.letterSpacing = 5;
    numArrows.x = 550;
    numArrows.y = 10;
    statsContainer.addChild(numArrows);

    imgWave = assetManager.getSprite("assetsCharacters");
    imgWave.x = 225;
    imgWave.y = 500;
    imgWave.gotoAndStop("stats_wave");
    statsContainer.addChild(imgWave);

    numWaveText = new createjs.BitmapText(numWave.toString(), spritesheet);
    numWaveText.x = 315;
    numWaveText.y = 515;
    statsContainer.addChild(numWaveText);

    stage.addChild(statsContainer);

    stage.addChild(developerCredits);

    addMousePointer();
}
function loadGameOverScreen(){
    //play game over sound
    createjs.Sound.play("gameOver");
    //remove all assets and intervals
    stage.removeAllChildren();
    cloudContainer.removeAllChildren();
    clearInterval(arenaCloudInterval);
    //new background
    infoBackground = assetManager.getSprite("assets");
    infoBackground.gotoAndStop("infoBackground");
    stage.addChild(infoBackground);

    stage.addChild(cloudContainer);
    stage.addChild(infoBirdContainer);
    addCloudsInfoScreen(4);
    addBirdsInfoScreen(4);

    arrowPointer = assetManager.getSprite("assets");
    arrowPointer.x = 200;
    arrowPointer.y = 339;
    arrowPointer.gotoAndStop("arrowPointer");
    stage.addChild(arrowPointer);

    restartText = assetManager.getSprite("assets");
    restartText.x = 240;
    restartText.y = 325;
    restartText.gotoAndStop("restartText");
    stage.addChild(restartText);
    // setup event listener to Quit Game
    restartText.addEventListener("click", onNewGame);

    // Add Instructions Back In
    stage.addChild(instructions);

    quitGame = assetManager.getSprite("assets");
    quitGame.x = 240;
    quitGame.y = 410;
    quitGame.gotoAndStop("quitText");
    stage.addChild(quitGame);
    // setup event listener to Quit Game
    quitGame.addEventListener("click", onQuitGame);

    numWaveText = new createjs.BitmapText(numWave.toString(), spritesheet);
    if(numWave< 20){
        numWave.letterSpacing = 5;
    }
    numWaveText.x = 160;
    numWaveText.y = 260;
    stage.addChild(numWaveText);

    numArrowsShot = new createjs.BitmapText(willy.getArrowCount().toString(), spritesheet);
    if(willy.getArrowCount() < 20){
        numArrowsShot.letterSpacing = 5;
    }
    numArrowsShot.x = 315;
    numArrowsShot.y = 260;
    stage.addChild(numArrowsShot);

    numKills = new createjs.BitmapText(willy.getKillCount().toString(), spritesheet);
    if(willy.getKillCount() < 20){
        numKills.letterSpacing = 5;
    }
    numKills.x = 420;
    numKills.y = 260;
    stage.addChild(numKills);

    accuracy = new createjs.BitmapText(willy.getAccuracy().toString(), spritesheet);
    if(willy.getAccuracy() < 20){
        accuracy.letterSpacing = 5;
    }
    accuracy.x = 560;
    accuracy.y = 259;
    stage.addChild(accuracy);

    // remove/setup event listeners for keyboard keys
    document.removeEventListener("keydown", onKeyDownStartScreen);
    document.addEventListener("keydown", onKeyDownGameOverScreen);
    document.removeEventListener("keydown", onKeyDownArenaScreen);

    stage.addChild(developerCredits);

    addMousePointer();
}
// --------- END LOAD SCREEN ASSETS --------
// --------- SCREEN KEYDOWN FUNCTIONS --------
function onKeyDownStartScreen(e) {
    // keystroke for "P" Button activating the menu screen
    if (e.keyCode == 78) onNewGame();
    if (e.keyCode == 73) onInstructions();
    if(e.keyCode == "38"){
        //direction = "up";
        arrowPointer.y = 339;
        e.preventDefault();
    } else if(e.keyCode == "40"){
        //direction = "down";
        arrowPointer.y = 380;
        e.preventDefault();
    }
    if(e.keyCode == "13" && arrowPointer.y === 339){
        onNewGame();
    }
    if(e.keyCode == "13" && arrowPointer.y === 380){
        onInstructions();
    }
}
function onKeyDownArenaScreen(e) {
    // keystroke for "P" Button activating the menu screen
    if (e.keyCode == 80) onPause();
}
function onKeyDownGameOverScreen(e) {

    if(e.keyCode == "38"){
        //direction = "up";
        switch(arrowPointer.y){
            case 425:
                arrowPointer.y = 380;
                break;
            case 380:
                arrowPointer.y = 339;
                break;
            default:
                break;
        }
        e.preventDefault();
    } else if(e.keyCode == "40"){
        //direction = "down";
        switch(arrowPointer.y){
            case 339:
                arrowPointer.y = 380;
                break;
            case 380:
                arrowPointer.y = 425;
                break;
            default:
                break;
        }
        e.preventDefault();
    }
    if(e.keyCode == "13" && arrowPointer.y === 339){
        onNewGame();
    }
    if(e.keyCode == "13" && arrowPointer.y === 380){
        onInstructions();
    }
    if(e.keyCode == "13" && arrowPointer.y === 425){
        onNewGame();
    }
}
// --------- END KEYDOWN FUNCTIONS --------
// --------- WAVE --------
function increaseWave(){
            //play wave complete sound
            createjs.Sound.play("waveComplete");
            willy.setIsWaveComplete(true);
            clearInterval(isArrowsDepleted);
            clearInterval(arrowsDepletedInterval);
            //remove the birds in the array from the stage
                downKey = false;
                upKey = false;
                leftKey = false;
                rightKey = false;
                infoTitle = assetManager.getSprite("assets");
                infoTitle.gotoAndStop("waveComplete");
                infoTitle.x = 225;
                infoTitle.y = 175;
                stage.addChild(infoTitle);
                 //increase number of arrows willy has at his disposal
                 numArrowsWilly = numArrowsWilly + 5;
                 willy.setNumArrows(numArrowsWilly);
                statsContainer.removeChild(numArrows);
                numArrows = new createjs.BitmapText(willy.getNumArrows().toString(), spritesheet);
                if(willy.getNumArrows() < 20){
                    numArrows.letterSpacing = 5;
                }
                numArrows.x = 550;
                numArrows.y = 10;
                statsContainer.addChild(numArrows);
                //increase numWave
                statsContainer.removeChild(numWaveText);
                numWaveText = new createjs.BitmapText((numWave+=1).toString(), spritesheet);
                numWaveText.x = 315;
                numWaveText.y = 515;
                statsContainer.addChild(numWaveText);
                //increase number of enemies for wave
                targetNumEnemies +=3;
                numEnemies = targetNumEnemies;
                //stop adding birds to the screen
                clearInterval(birdTimer);
                waveInterval = setTimeout(function(){
                    birds = [];
                    arenaBirdsContainer.removeAllChildren();
                    stage.removeChild(arenaBirdsContainer);
                    stage.removeChild(infoTitle);
                    willy.setIsWaveComplete(false);
                    stage.addChild(arenaBirdsContainer);
                    stage.addEventListener("click", shootProjectile);
                    //increase bird generation
                    birdDelay -= 100;
                    birdTimer = window.setInterval(onAddBird, birdDelay);
                    clearTimeout(waveInterval);
                }, 3000);

}

// --------- END WAVE --------
// --------- CLOUDS --------

function addCloudsInfoScreen(numClouds){
    infoCloudCount = 1;
    // set interval
    infoCloudInterval = setInterval(addInfoCloud, 6000);
    function addInfoCloud() {
        if(infoCloudCount <= numClouds){
            var cloud = new Cloud(stage, cloudContainer, assetManager);
            cloud.getInfoScreenClouds();
            infoCloudCount ++;
        }else{
            clearInterval(infoCloudInterval);
        }
    }
};
function addCloudsArenaScreen(numClouds){
    arenaCloudCount = 1;
    // set interval
    arenaCloudInterval = setInterval(addArenaCloud, 5000);
    function addArenaCloud() {
        if(arenaCloudCount <= numClouds){
            var cloud = new Cloud(stage, cloudContainer, assetManager);
            cloud.getArenaClouds();
            arenaCloudCount ++;
        }else{
            clearInterval(arenaCloudInterval);
        }
    }
};
// --------- END CLOUDS --------

// --------- BIRDS --------
function addBirdsInfoScreen(numBirds){
    infoBirdCount = 1;
    // set interval
    infoBirdInterval = setInterval(addInfoBird, 4000);
    function addInfoBird() {
        if(infoBirdCount <= numBirds){
            var bird = new Bird(stage, infoBirdContainer, arenaBirdsContainer, assetManager, willy);
            bird.getInfoScreenBirds();
            infoBirdCount ++;
        }else{
            clearInterval(infoBirdInterval);
        }
    }
}
function onAddBird(e) {
    arenaBird = new Bird(stage, infoBirdContainer, arenaBirdsContainer, assetManager, willy, arrows);
    arenaBird.setupMe();
    birds.push(arenaBird);
}
// --------- END BIRDS --------
// --------- WILLY --------
function shootProjectile(){
        //play sound
        createjs.Sound.play("shootArrow");

        willy.decreaseNumArrows();
        statsContainer.removeChild(numArrows);
        numArrows = new createjs.BitmapText(willy.getNumArrows().toString(), spritesheet);
        if(willy.getNumArrows() < 20){
            numArrows.letterSpacing = 5;
        }
        numArrows.x = 550;
        numArrows.y = 10;
        statsContainer.addChild(numArrows);
        // add arrow on mouse click to the stage
        arrow = new Projectile(stage, assetManager);
        arrow.setupMe(mouseX, mouseY, willy.getWillyX(), willy.getWillyY());
        arrows.push(arrow);
        willy.increaseArrowCount();
        //check for depleted arrows
    if (willy.getNumArrows() === 0){
        // Willy has no more arrows
        stage.removeEventListener("click", shootProjectile);
        //allow time for last arrow shot to play out
        isArrowsDepleted = setTimeout(function(){
            infoTitle = assetManager.getSprite("assets");
            infoTitle.gotoAndStop("arrowsDepleted");
            infoTitle.x = 125;
            infoTitle.y = 150;
            stage.addChild(infoTitle);
            clearInterval(birdTimer);
            arenaBirdsContainer.removeAllChildren();
            clearTimeout(isArrowsDepleted);
        }, 3000);
        arrowsDepletedInterval = setTimeout(function(){
            stage.removeChild(infoTitle);
            isGameOver = true;
            onPause();
            clearTimeout(arrowsDepletedInterval);
        }, 6000);
    }
}
// --------- END WILLY --------
// --------- TICK --------

function onTick(e) {
    // TESTING FPS
    document.getElementById("fps").innerHTML = createjs.Ticker.getMeasuredFPS();

    if(willy.getIsBirdKilled()){
        //play bird dies sound
         createjs.Sound.play("birdDies");
        statsContainer.removeChild(numKills);
        numKills = new createjs.BitmapText(willy.getKillCount().toString(), spritesheet);
        if(willy.getKillCount() < 20){
            numKills.letterSpacing = 5;
        }
        numKills.x = 265;
        numKills.y = 10;
        statsContainer.addChild(numKills);
        numEnemies -= 1;
        if(numEnemies === 0){
            increaseWave();
        }
        statsContainer.removeChild(numEnemiesText);
        numEnemiesText = new createjs.BitmapText(numEnemies.toString(), spritesheet);
        if(numEnemies < 20){
            numEnemies.letterSpacing = 5;
        }
        numEnemiesText.x = 415;
        numEnemiesText.y = 10;
        statsContainer.addChild(numEnemiesText);
        willy.setIsBirdKilled(false);
    }else if(willy.getIsWillyKilled()){
        createjs.Sound.play("willyDies");
        willy.decreaseLivesCount();
        statsContainer.removeChild(numLives);
        numLives = new createjs.BitmapText(willy.getLives().toString(), spritesheet);
        numLives.x = 115;
        numLives.y = 10;
        statsContainer.addChild(numLives);
        willy.setIsWillyKilled(false);
        if(willy.getLives() === 0 ){
            isGameOver = true;
            onPause();
            willy.setLives(3);
        }
    }else if(!willy.getIsPaused()){
        moveWilly();
    }else if(isGameOver){
        loadGameOverScreen();
        isGameOver = false;
        isInstructions = false;
    }
    // update the stage!
    stage.update();
}

