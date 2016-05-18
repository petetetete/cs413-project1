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

// Create the background texture
floorPicture = new PIXI.Sprite(PIXI.Texture.fromImage("sprites/floor.png"));
floorPicture.position.x = 0;
floorPicture.position.y = 0;
stage.addChild(floorPicture);

// Create the enemies container
var enemies = new PIXI.Container();
enemies.position.x = 0;
enemies.position.y = 0;
stage.addChild(enemies);

// Create the player sprite and determine his spawn
var player = new PIXI.Sprite(PIXI.Texture.fromImage("sprites/player.png"));
playerSpawn = getSpawnCoords();
player.position.x = playerSpawn[0];
player.position.y = playerSpawn[1];
stage.addChild(player);

// Create the game over screen and hide it from view
var gameOver = new PIXI.Container();
gameOverPicture = new PIXI.Sprite(PIXI.Texture.fromImage("sprites/gameover.png"));
gameOverPicture.position.x = 0;
gameOverPicture.position.y = 0;
gameOver.visible = false;
gameOver.addChild(gameOverPicture);
stage.addChild(gameOver);

// Create and add score counter
var score = 0;
var text = new PIXI.Text("Score: 0", {font: "20px Desyrel", fill: "red"});
stage.addChild(text);

// Add the event listener for keypresses
document.addEventListener('keydown', onKeyDown);

// Function used to handle key presses and movement in game
function onKeyDown(key) {

	// Variable to check if the player actually pressed a valid key to move
	var moved = false;
	
	// Up key or w
    if (key.keyCode === 87 || key.keyCode === 38) {
    	key.preventDefault();
        if (player.position.y > gridSize) {
            player.position.y -= gridSize;
            moved = true;
        }
    }

    // Down key or s
    if (key.keyCode === 83 || key.keyCode === 40) {
    	key.preventDefault();
        if (player.position.y < height - 2 * gridSize) {
            player.position.y += gridSize;
            moved = true;
        }
    }

    // Left key or a
    if (key.keyCode === 65 || key.keyCode === 37) {
    	key.preventDefault();
        if (player.position.x > gridSize) {
            player.position.x -= gridSize;
            moved = true;
        }
    }

    // Right key or d
    if (key.keyCode === 68 || key.keyCode === 39) {
    	key.preventDefault();
        if (player.position.x != width - 2 * gridSize) {
            player.position.x += gridSize;
            moved = true
        }
    }

    // If the user did press a valid key
    // Order of operations is ipmortant here, newly spawned enemies don't move in the same tick
    if (moved) {
    	updateScore();
    	moveEnemies();

    	if(hitEnemy()) {
    		gameOver.visible = true;
    		document.removeEventListener('keydown', onKeyDown);
    	}
    	else {
    		if ((score) % 10 === 0 || score === 1) spawnEnemy();	// Spawn an enemy every 10 waves and the starting wave
    	}
    }
}

// Function used to move every enemy
function moveEnemies() {

	// Get all enemies and info about their moving habits
	baddies = enemies.children;
	probMoveTowards = .75;

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

// Function used to simply update the current score, or turns the player has been alive
function updateScore() {
	text.text = "Score: " + ++score;
}


// Function used to spawn a new enemy
function spawnEnemy() {
	enemy = new PIXI.Sprite(PIXI.Texture.fromImage("sprites/enemy.png"));

	// Ensure that the enemy cannot spawn on top of the player
	do {
		spawnCoords = getSpawnCoords();
	}
	while(spawnCoords[0] === player.position.x && spawnCoords[1] === player.position.y)

	enemy.position.x = spawnCoords[0];
	enemy.position.y = spawnCoords[1];
	enemies.addChildAt(enemy, 0);
}

// Function to run the game
function animate(timestamp) {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

// Kick it off!
animate();