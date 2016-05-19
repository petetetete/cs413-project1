// Grab html gameport
var gameport = document.getElementById("gameport");

// Declare and initialize some variables for the window size
var width = 800;
var height = 600;
var gridSize = 40;

// Create renderer
var renderer = PIXI.autoDetectRenderer(width, height, {backgroundColor: 0x3B3C4C});
gameport.appendChild(renderer.view);

// Create main stage container
var stage = new PIXI.Container();

// Initially load the textures and store them
var textures = {
	calendar: PIXI.Texture.fromImage("sprites/calendar.png"), 
	floor: PIXI.Texture.fromImage("sprites/floor.png"), 
	gameover: PIXI.Texture.fromImage("sprites/gameover.png"),
	player: PIXI.Texture.fromImage("sprites/player.png"),
	enemies: [PIXI.Texture.fromImage("sprites/enemy.png"), PIXI.Texture.fromImage("sprites/enemy1.png"), PIXI.Texture.fromImage("sprites/enemy2.png")]
}

// Create the background texture
floorPicture = new PIXI.Sprite(textures.floor);
floorPicture.position.x = 0;
floorPicture.position.y = 0;
stage.addChild(floorPicture);

// Create the player sprite and determine his spawn
var player = new PIXI.Sprite(textures.player);
playerSpawn = getSpawnCoords();
player.position.x = playerSpawn[0];
player.position.y = playerSpawn[1];
stage.addChild(player);

// Create the enemies container
var enemies = new PIXI.Container();
enemies.position.x = 0;
enemies.position.y = 0;
stage.addChild(enemies);

// Create the game over screen and hide it from view
// Game over is a seperate container so that future features could be added
var gameOver = new PIXI.Container();
gameOverPic = new PIXI.Sprite(textures.gameover);
gameOverPic.position.x = 0;
gameOverPic.position.y = 0;
gameOver.visible = false;
gameOver.addChild(gameOverPic);
stage.addChild(gameOver);

// Create and add score counter
var score = 0;
var scoreText = new PIXI.Text("Score: 0", {font: "30px Impact", fill: "#ac3232", strokeThickness: 5});
scoreText.position.x = 5;
scoreText.position.y = 1;
stage.addChild(scoreText);

// Create the intro screen with the calendar
var calendar = new PIXI.Sprite(textures.calendar);
enemies.position.x = 0;
enemies.position.y = 0;
stage.addChild(calendar);

// Create the instructional text on intro
var startText = new PIXI.Text("Click any key to start.", {font: "30px Impact", fill: "#ac3232", strokeThickness: 5});
startText.position.x = width - 275;
startText.position.y = height - 40;
stage.addChild(startText);

// Add the event listener for keypresses and mouse press
document.addEventListener("keydown", onKeyDown);
gameport.addEventListener("click", onKeyDown);

// Function used to handle key presses and movement in game
function onKeyDown(key) {

	// If the game has just begun, remove the intro screen on any action
	if (calendar.visible) {
		calendar.visible = false;
		startText.visible = false;
	}

	// Variable to check if the player actually pressed a valid key to move
	var moved = false;
	
	// Up arrow key or w
    if (key.keyCode === 87 || key.keyCode === 38) {
    	key.preventDefault();
        if (player.position.y > gridSize) {
            player.position.y -= gridSize;
            moved = true;
        }
    }

    // Down arrow key or s
    if (key.keyCode === 83 || key.keyCode === 40) {
    	key.preventDefault();
        if (player.position.y < height - 2 * gridSize) {
            player.position.y += gridSize;
            moved = true;
        }
    }

    // Left arrow key or a
    if (key.keyCode === 65 || key.keyCode === 37) {
    	key.preventDefault();
        if (player.position.x > gridSize) {
            player.position.x -= gridSize;
            moved = true;
        }
    }

    // Right arrow key or d
    if (key.keyCode === 68 || key.keyCode === 39) {
    	key.preventDefault();
        if (player.position.x != width - 2 * gridSize) {
            player.position.x += gridSize;
            moved = true
        }
    }

    // If the user did press a valid key
    // Order of operations is ipmortant here, newly spawned enemies don't move in the same tick
    // Score is always incremented regardless of whether you die in this frame or not, you still clicked the button
    if (moved) {
    	updateScore();
    	moveEnemies();

    	if (hitEnemy()) {
    		gameOver.visible = true;
    		document.removeEventListener('keydown', onKeyDown);
    	}
    	else {
    		if ((score) % 10 === 0 || score === 1) spawnEnemy();	// Spawn an enemy every 10 moves and the starting move
    	}
    }
}

// Function used to move every enemy
function moveEnemies() {

	// Get all enemies and info about their moving habits
	baddies = enemies.children;
	probMoveTowards = .75;

	// Get the players current position
	px = player.position.x;
	py = player.position.y;

	// Iterate through all enemies
	for (var i = 0; i < baddies.length; i++) {

		// Temporarily store the current baddies location
		bx = baddies[i].position.x;
		by = baddies[i].position.y;

		// Determine where the ai will move him
		// probMoveTowards represents the percent of the time the enemy will favor walking towards you
		if (Math.random() <= probMoveTowards) {
			(Math.round(Math.random())) ? bx += Math.sign(px-bx) * gridSize : by += Math.sign(py-by) * gridSize; // Randomly chose to move in either the x or y direction towards you
		}
		else {
			(Math.round(Math.random())) ? bx += Math.round(Math.random()) * Math.sign(bx-px) * gridSize : by += Math.round(Math.random()) * Math.sign(by-py) * gridSize; // May or may not move
		}

		// From here on is validation that the enemy can in fact move to the position
		// Ensure there isn't another enemy on the location
		validSpot = true;
		for (var j = 0; j < baddies.length; j++) {
			if (baddies[j].position.x === bx && baddies[j].position.y === by) validSpot = false;
		}

		// Ensure that the spot-to-move is in bounds
		if (by >= gridSize && by <= height - 2 * gridSize && bx >= gridSize && bx <= width - 2 * gridSize && validSpot) {
			baddies[i].position.x = bx;
			baddies[i].position.y = by;
		}
	}
}

// Function used to check if the player has collided with any enemy
function hitEnemy() {
	baddies = enemies.children;
	for (var i = 0; i < baddies.length; i++) {
		if (baddies[i].position.x === player.position.x && baddies[i].position.y === player.position.y) return true;
	}
	return false;
}

// Helper function used to get random spawn coords within the grid
function getSpawnCoords() {
	x = Math.round((Math.random()*(width-3*gridSize)+gridSize)/gridSize)*gridSize;
	y = Math.round((Math.random()*(height-3*gridSize)+gridSize)/gridSize)*gridSize;
	return [x, y];
}

// Function used to spawn a new enemy
function spawnEnemy() {
	enemy = new PIXI.Sprite(textures.enemies[Math.floor(Math.random()*textures.enemies.length)]);

	// Ensure that the enemy cannot spawn on top of the player
	do {
		spawnCoords = getSpawnCoords();
	}
	while(spawnCoords[0] === player.position.x && spawnCoords[1] === player.position.y)

	enemy.position.x = spawnCoords[0];
	enemy.position.y = spawnCoords[1];
	enemies.addChildAt(enemy, 0);
}

// Function used to simply update the current score, or turns the player has been alive
function updateScore() {
	scoreText.text = "Score: " + ++score;
}

// Function to run the game
function animate(timestamp) {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

// Kick it off!
animate();