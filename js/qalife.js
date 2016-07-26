/**
 *  Logic for a game inspired by 'Papers Please'
 *  that hinges on an in-office joke.
 *
 *  @author  mod_ave
 *  @version 0.1
 */

/* Game objects and state. */

/*
 * Store layout containers information in logical hierarchy
 * (learned from last game that otherwise its gets messy).
 */
var SCENES = {
    // Store information about the main scene.
    MAIN_BOARD : {
        ANIMATIONS : {
            HAND : null
        },
        VECTORS : {
            TEXT_TIMER : new Vector(180, 75),
            TEXT_QUOTA : new Vector(1470, 75),
            IMAGE_TICKETS : {
                1 : new Vector(130, 230),
                2 : new Vector(550, 230),
                3 : new Vector(975, 230),
                4 : new Vector(1400, 230),
                5 : new Vector(130, 600),
                6 : new Vector(550, 600),
                7 : new Vector(975, 600),
                8 : new Vector(1400, 600),
                MIN_POSITION : 1,
                MAX_POSITION : 8
            }
        },
        CONTAINERS : {
            CLOCK : null,
            QUOTA : null
        },
        TIMERS : {
            CLOCK : null
        }
    },
    // Store information about the inspection layout.
    INSPECTION_SCREEN : {
        CONTAINERS : {
            MAIN : null
        },
        VECTORS : {
            IMAGE_BUTTON_BACK : new Vector(72, 865),
            IMAGE_BUTTON_RUN : new Vector(255, 865),
            TEXT_STATUS_RUN : new Vector(647, 912),
            TEXT_STATUS_DONE : new Vector(670, 912),
            IMAGE_BUTTON_ACCEPT : new Vector(996, 865),
            IMAGE_BUTTON_REJECT : new Vector(1445, 865),
            TEXT_INPUT : new Vector(135, 235),
            IMAGE_OUTPUT : new Vector(1020,191)
        }
    },
    INTERIM_SCREEN : {
        CONTAINERS : {
            MAIN : null
        },
        VECTORS : {
            IMAGE_BUTTON_NEXT : new Vector(950, 820),
            IMAGE_BUTTON_RESTART : new Vector(950, 820),
            TEXT_DAY_RESULT : new Vector(190, 320),
            IMAGE_BED : new Vector(880, 205),
            IMAGE_FIRE : new Vector(1010, 160),
            TEXT_DAY : new Vector(880, 65),
            TEXT_TOTAL_SCORE : new Vector(190, 940)
        }
    }
};

/**
 * Store point on the screen to aid dynamic
 * layouts.
 *
 * @param x The x position within the canvas.
 * @param y The y position within the canvas.
 */
function Vector(x, y) {
    // Private fields.
    this.x = x;
    this.y = y;
    // Getters.
    this.getX = function() {
        return this.x;
    };
    this.getY = function() {
        return this.y;
    };
}

// TODO: Un-stringify.
// Used to preload assets.
var LOAD_MANIFEST = [
    {src: "img/accept-button.png", id: "button-accept"},
    {src: "img/board.png", id: "board"},
    {src: "img/bed.png", id: "bed"},
    {src: "img/fire.png", id: "fire"},
    {src: "img/interim.png", id: "interim"},
    {src: "img/next-button.png", id: "button-next"},
    {src: "img/restart-button.png", id: "button-restart"},
    {src: "img/back-button.png", id: "button-back"},
    {src: "img/done.png", id: "text-done"},
    {src: "img/inspection.png", id: "inspection"},
    {src: "img/output-blue.png", id: "output-blue"},
    {src: "img/output-green.png", id: "output-green"},
    {src: "img/output-red.png", id: "output-red"},
    {src: "img/output-black-blue-green.png", id: "output-black-blue-green"},
    {src: "img/output-black-green-red.png", id: "output-black-green-red"},
    {src: "img/output-black-red.png", id: "output-black-red"},
    {src: "img/output-black.png", id: "output-black"},
    {src: "img/output-blue-black.png", id: "output-blue-black"},
    {src: "img/output-blue-green.png", id: "output-blue-green"},
    {src: "img/output-blue-red.png", id: "output-blue-red"},
    {src: "img/output-green-black.png", id: "output-green-black"},
    {src: "img/output-green-red.png", id: "output-green-red"},
    {src: "img/output-red-green-blue.png", id: "output-red-green-blue"},
    {src: "img/output-yellow.png", id: "output-yellow"},
    {src: "img/pin-1.png", id: "pin-1"},
    {src: "img/pin-2.png", id: "pin-2"},
    {src: "img/pin-3.png", id: "pin-3"},
    {src: "img/reject-button.png", id: "button-reject"},
    {src: "img/run-button.png", id: "button-run"},
    {src: "img/ticket-1.png", id: "ticket-1"},
    {src: "img/ticket-2.png", id: "ticket-2"},
    {src: "img/ticket-3.png", id: "ticket-3"},
    {src: "img/ticket-4.png", id: "ticket-4"},
    {src: "img/ticket-5.png", id: "ticket-5"},
    {src: "img/ticket-6.png", id: "ticket-6"},
    {src: "img/ticket-7.png", id: "ticket-7"},
    {src: "img/ticket-8.png", id: "ticket-8"},
    {src: "img/wait.png", id: "text-wait"},
    {src: "img/play-button.png", id: "button-play"},
    {src: "img/spritesheet-hand.png", id: "spritesheet-hand"}
];
var loader;

// The HTML canvas element.
var canvas;
// The Easel element constructed of the canvas.
var stage;

/**
 * Model an in-game support ticket.
 *
 * @param pos       The position of the ticket as an int.
 * @param name      The ticket's name as a string.
 * @param criteria  The ticket's criteria as a string.
 * @param output    The ticket's output as an image.
 * @param solution  The ticket's solution as a boolean.
 * @param runtime   The ticket's runtime in milliseconds.
 * @param runtime   The ticket's deadline for completion.
 */
function Ticket(pos, name, criteria, output, solution, runtime, deadline) {
    // Private fields.
    this.pos = pos;
    this.name = name;
    this.criteria = criteria;
    this.output = output;
    this.solution = solution;
    this.runtime = runtime;
    this.deadline = deadline;
    // Getters.
    this.getPos = function() {
        return this.pos;
    };
    this.getName = function() {
        return this.name;
    };
    this.getCriteria = function() {
        return this.criteria;
    };
    this.getOutput = function() {
        return this.output;
    };
    this.getSolution = function() {
        return this.solution;
    };
    this.getRuntime = function() {
        return this.runtime;
    };
    this.getDeadline = function() {
        return this.deadline;
    };
}

// Keep a lock to prevent interleaving of game logic.
var spawnTicketLock = false;

// TODO: Can be made more concise and stringified.
/**
 * Model output criteria for an in-game program.
 *
 * @param red   If the criteria accepts red (as a boolean).
 * @param green If the criteria accepts green (as a boolean).
 * @param blue  If the criteria accepts blue (as a boolean).
 * @param black If the criteria accepts black (as a boolean).
 */
function Criteria(red, green, blue, black) {
    // Private fields.
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.black = black;
    // Getters.
    this.isRed = function() {
        return this.red;
    };
    this.isGreen = function() {
        return this.green;
    };
    this.isBlue = function() {
        return this.blue;
    };
    this.isBlack = function() {
        return this.black;
    };
    this.toString = function() {
        var criteria = "";
        if(this.red != null) {

            criteria += "Output ";
            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)] + " " : "");

            if(this.red) {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "doesn't not"
                }
                // Not indirected...
                else {
                    criteria += "does"
                }
            }
            else {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "does not not"
                }
                // Not indirected...
                else {
                    criteria += "doesn't"
                }
            }

            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    " " + this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)] : "");

            criteria += " contain the color red.\n"

        }
        if(this.green != null) {

            criteria += "Output ";
            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)] + " " : "");

            if(this.green) {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "doesn't not"
                }
                // Not indirected...
                else {
                    criteria += "does"
                }
            }
            else {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "does not not"
                }
                // Not indirected...
                else {
                    criteria += "doesn't"
                }
            }

            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    " " + this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)]: "");

            criteria += " contain the color green.\n"

        }
        if(this.blue != null) {

            criteria += "Output ";
            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)] + " " : "");

            if(this.blue) {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "doesn't not"
                }
                // Not indirected...
                else {
                    criteria += "does"
                }
            }
            else {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "does not not"
                }
                // Not indirected...
                else {
                    criteria += "doesn't"
                }
            }

            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    " " + this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)] : "");

            criteria += " contain the color blue.\n"

        }
        if(this.black != null) {

            criteria += "Output ";
            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)] + " " : "");

            if(this.black) {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "doesn't not"
                }
                // Not indirected...
                else {
                    criteria += "does"
                }
            }
            else {
                if (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY) {
                    criteria += "does not not"
                }
                // Not indirected...
                else {
                    criteria += "doesn't"
                }
            }

            criteria += (getRandomInt(1, DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY)
                    == DIFFICULTIES[player.difficulty].INDIRECTION_PROPENSITY ?
                    " " + this.FLUFF[getRandomInt(0, this.FLUFF.length - 1)] : "");

            criteria += " contain the color black.\n"

        }
        return criteria.trim();
    };
    this.FLUFF = [
        "definitely",
        "indeed",
        "absolutely"
    ];
}

var NO_CRITERIA_MESSAGE = "No criteria specified.";

/**
 * Model output for an in-game program.
 *
 * @param image The string resource ID for the output image.
 * @param red   If the output contains red (as a boolean).
 * @param green If the output contains green (as a boolean).
 * @param blue  If the output contains blue (as a boolean).
 * @param black If the output contains black (as a boolean).
 */
function Output(image, red, green, blue, black) {
    // Private fields.
    this.image = image;
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.black = black;
    // Getters.
    this.getImage = function() {
        return this.image;
    }
    this.isRed = function() {
        return this.red;
    }
    this.isGreen = function() {
        return this.green;
    }
    this.isBlue = function() {
        return this.blue;
    }
    this.isBlack = function() {
        return this.black;
    }
}

// TODO: Can be automated.
// Store all outputs.
var OUTPUTS = [
    new Output("output-red", true, false, false, false),
    new Output("output-green", false, true, false, false),
    new Output("output-blue", false, false, true, false),
    new Output("output-black", false, false, false, true),
    new Output("output-black-red", true, false, false, true),
    new Output("output-green-red", true, true, false, false),
    new Output("output-blue-red", true, false, true, false),
    new Output("output-blue-black", false, false, true, true),
    new Output("output-blue-green", false, true, true, false),
    new Output("output-green-black", false, true, false, true),
    new Output("output-black-blue-green", false, true, true, true),
    new Output("output-red-green-blue", true, true, true, false),
    new Output("output-black-green-red", true, true, false, true),
    new Output("output-yellow", false, false, false, false)
];

// Group time information.
var timeKeeper = {
    timeElapsed : 0,
    DAY_START : 32400,
    DAY_END : 61200,
    INCREMENT : 60
};

// Group player information.
var player = {
    isMobile : false,
    difficulty : 0,
    day : 0,
    score : 0,
    inPlay : false,
    isInspecting : false,
    quota : null,
    succeeded : 0,
    gain : 0,
    loss : 0,
    bonus : 0
};

var DIFFICULTIES = {
    1 : {
        // Control the frequency of ticket spawns.
        MIN_SPAWNTIME : 3000,
        MAX_SPAWNTIME : 10000,
        MAX_RUNTIME : 3000,
        MIN_DEADLINE : 1800,
        MAX_DEADLINE : 10000,
        BULLSHIT_PROPENSITY : 12,
        QUOTA : 8,
        REGRESSION_PROPENSITY : 2,
        INDIRECTION_PROPENSITY : 20,
        SCORE_INCREMENT : 100,
        SCORE_MULTIPLIER : 1.5
    },
    2 : {
        // Control the frequency of ticket spawns.
        MIN_SPAWNTIME : 3000,
        MAX_SPAWNTIME : 10000,
        MAX_RUNTIME : 4000,
        MIN_DEADLINE : 1600,
        MAX_DEADLINE : 8000,
        BULLSHIT_PROPENSITY : 10,
        QUOTA : 12,
        REGRESSION_PROPENSITY : 3,
        INDIRECTION_PROPENSITY : 10,
        SCORE_INCREMENT : 200,
        SCORE_MULTIPLIER : 1.5
    },
    3 : {
        // Control the frequency of ticket spawns.
        MIN_SPAWNTIME : 3000,
        MAX_SPAWNTIME : 10000,
        MAX_RUNTIME : 5000,
        MIN_DEADLINE : 1400,
        MAX_DEADLINE : 8000,
        BULLSHIT_PROPENSITY : 10,
        QUOTA : 20,
        REGRESSION_PROPENSITY : 4,
        INDIRECTION_PROPENSITY : 4,
        SCORE_INCREMENT : 300,
        SCORE_MULTIPLIER : 2
    }
};

// Store locations of tickets.
var currentTickets = [];

/**
 *  Initialise loading game objects
 *  and introductory splash screen.
 */
function init() {
    
    // Check to see if the user is on mobile.
    if (createjs.BrowserDetect.isIOS || createjs.BrowserDetect.isAndroid || createjs.BrowserDetect.isBlackberry) {
        player.isMobile = true;
	}

    // Get the canvas.
    canvas = document.getElementById("game");

    // Instantiate the stage.
    stage = new createjs.Stage(canvas);
    
    // Display loading screen splash image.
    var splash = new Image();
    splash.src = "img/splash-screen.png";

    splash.onload = function(event) {
        splash = new createjs.Bitmap(splash);
        stage.addChild(splash);
        stage.update();
    };

    loader = new createjs.LoadQueue(false);
    if(!player.isMobile) {
        loader.installPlugin(createjs.Sound);
        createjs.Sound.alternateExtensions = ["wav"];
    }

    loader.addEventListener("complete", onLoadFinish);
    
    loader.loadManifest(LOAD_MANIFEST);
    
}

/**
 *  Allow the user to start
 *  the game.
 */
function onLoadFinish() {
    
    // Log finished loading to console.
    console.log("Finished loading.");
    
    // Add button to start game.
    startGame = new createjs.Bitmap(loader.getResult("button-play"));
    startGame.x = 310;
    startGame.y = 515;
    stage.addChild(startGame);
    stage.update(); 
    
    startGame.on("click", function(event) {
        if(!player.isMobile) {
            // createjs.Sound.play("start");
        }
        watchRestart();
        goFullScreen();
        function goFullScreen(){
            if(canvas.requestFullScreen)
                canvas.requestFullScreen();
            else if(canvas.webkitRequestFullScreen)
                canvas.webkitRequestFullScreen();
            else if(canvas.mozRequestFullScreen)
                canvas.mozRequestFullScreen();
        }
    });

}

/**
 *  Fires when player starts
 *  game; initialises main
 *  game loop and links loaded
 *  assets to game objects.
 */
function watchRestart() {
    
    // Remove loading objects.
    stage.removeAllChildren();
    
    /* Load stage objects. */

    // Background.
    var background = new createjs.Bitmap(loader.getResult("board"));
    stage.addChild(background);

    // Timer.
    SCENES.MAIN_BOARD.CONTAINERS.CLOCK = new createjs.Text("09:00", "bold 80px VT323", "#ffffff");
    SCENES.MAIN_BOARD.CONTAINERS.CLOCK.x = SCENES.MAIN_BOARD.VECTORS.TEXT_TIMER.getX();
    SCENES.MAIN_BOARD.CONTAINERS.CLOCK.y = SCENES.MAIN_BOARD.VECTORS.TEXT_TIMER.getY();
    stage.addChild(SCENES.MAIN_BOARD.CONTAINERS.CLOCK);

    // Quota.
    SCENES.MAIN_BOARD.CONTAINERS.QUOTA = new createjs.Text("QUOTA: 0/10", "bold 80px VT323", "#ffffff");
    SCENES.MAIN_BOARD.CONTAINERS.QUOTA.x = SCENES.MAIN_BOARD.VECTORS.TEXT_QUOTA.getX();
    SCENES.MAIN_BOARD.CONTAINERS.QUOTA.y = SCENES.MAIN_BOARD.VECTORS.TEXT_QUOTA.getY();
    stage.addChild(SCENES.MAIN_BOARD.CONTAINERS.QUOTA);

    // Hand.
    SCENES.MAIN_BOARD.ANIMATIONS.HAND = new createjs.SpriteSheet({
        "images" : [loader.getResult('spritesheet-hand')],
        "frames" : {width: 610, height: 852},
        "animations" : {
            "put" : [0, 7]
        },
        framerate : 5
    });

    // Start timer.
    createjs.Ticker.on("tick", tick);
    
    // Restart (begin) the game.
    restart();
    
}

/**
 *  Reset game loop to
 *  try playing again.
 */
function restart() {
    
    /* Reset player/game objects. */

    // Reset player session values.
    if(player.difficulty < 3) {
        player.difficulty++;
    }
    player.inPlay = true;
    player.isInspecting = false;
    player.succeeded = 0;
    player.gain = 0;
    player.loss = 0;
    player.bonus = 0;
    player.quota = DIFFICULTIES[player.difficulty].QUOTA;
    player.day++;

    // Reset quota.
    updateQuota();

    // Reset timer.
    timeKeeper.timeElapsed = timeKeeper.DAY_START;
    updateTime(false);

    // Remove any tickets that may be pre-existing.
    for(var i = 0; i < currentTickets.length; i++) {
        stage.removeChild(currentTickets[i].container);
    }
    currentTickets = [];

    // Add listeners.

    // Start timers.
    SCENES.MAIN_BOARD.TIMERS.CLOCK = setInterval(function() { updateTime(true); }, 250);

    // Spawn ticket.
    spawnLoop();

}

/**
 *  Update the day timer.
 *
 *  @param increment    Whether to add to it.
 */
function updateTime(increment) {

    // Update the time in the model.
    if(increment != null && increment) {
        timeKeeper.timeElapsed += timeKeeper.INCREMENT;
    }

    // Check for the end of the day.
    if(timeKeeper.timeElapsed >= timeKeeper.DAY_END) {
        // Stop firing on interval.
        clearInterval(SCENES.MAIN_BOARD.TIMERS.CLOCK);
        // Stop spawning of tickets.
        player.inPlay = false;
        // Remove the inspection screen.
        if(player.isInspecting) {
            stage.removeChild(SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN);
        }
        // Calculate bonus if necessary.
        for(var i = player.quota; i < player.succeeded; i++) {
            player.score += DIFFICULTIES[player.difficulty].SCORE_INCREMENT;
            player.bonus += DIFFICULTIES[player.difficulty].SCORE_INCREMENT;
        }
        // Change screens.
        displayInterim();
    }

    SCENES.MAIN_BOARD.CONTAINERS.CLOCK.text = formatTimeFromSeconds(timeKeeper.timeElapsed);

}

/**
 * Return a string in the format 'XX:XXAM'
 * given a number of seconds.
 *
 * @param numSeconds    The number of seconds as an int.
 */
function formatTimeFromSeconds(numSeconds) {

    // Format the time.
    var hours, minutes;

    // Perform maths.
    minutes = Math.floor((numSeconds / 60) % 60);
    hours = Math.floor(numSeconds / 60 / 60) % 24;

    // Perform string formatting.
    var hoursString = hours + "", minutesString = minutes + "";

    if(hoursString.length < 2) {
        hoursString = "0" + hoursString;
    }
    if(minutesString.length < 2) {
        minutesString = "0" + minutesString;
    }

    // Make final string.
    return hoursString + ":" + minutesString;

}

/**
 *  Continuously spawn tickets.
 */
function spawnLoop() {

    // Base case.
    if(!player.inPlay) {
        return;
    }

    spawnTicket();

    setTimeout(spawnLoop, getRandomInt(
        DIFFICULTIES[player.difficulty].MIN_SPAWNTIME,
        DIFFICULTIES[player.difficulty].MAX_SPAWNTIME));

}

/**
 *  Register a new support ticket game object,
 *  add it to the stage with visual flair.
 */
function spawnTicket() {

    // Check to see if the stage is full or busy, if so, return false.
    if(currentTickets.length == 8 || spawnTicketLock) {
        return false;
    }

    spawnTicketLock = true;

    /*
     *  Declare ticket fields; the functions used to
     *  gather these are more suited to this function
     *  as the operations needed to produce them do
     *  not form a necessary part of the object model.
     */
    var ticketLocation,
        ticketName,
        ticketCriteria,
        ticketOutput,
        ticketSolution,
        ticketRuntime,
        ticketDeadline;

    do {
        // TODO: Efficiency can be improved.
        ticketLocation = getRandomInt(
            SCENES.MAIN_BOARD.VECTORS.IMAGE_TICKETS.MIN_POSITION,
            SCENES.MAIN_BOARD.VECTORS.IMAGE_TICKETS.MAX_POSITION);

    } while (!isValidTicketLocation(ticketLocation));

    // Get a valid ticket name.
    ticketName = getRandomTicketName();

    // Get a valid ticket criteria and output set.
    ticketCriteria = getRandomTicketCriteria();
    ticketOutput = getRandomTicketOutput();

    // Get a valid answer.
    ticketSolution = checkTicketSolution(
        ticketCriteria,
        ticketOutput
    );

    // Get a random runtime for the linked program.
    ticketRuntime = getRandomInt(0, DIFFICULTIES[player.difficulty].MAX_RUNTIME);

    // Get a random deadline.
    ticketDeadline = getRandomTicketDeadline();

    // Create a new ticket.
    var ticket = new Ticket(
        ticketLocation,
        ticketName,
        ticketCriteria,
        ticketOutput,
        ticketSolution,
        ticketRuntime,
        ticketDeadline);

    // Start the hand animation.
    var hand = new createjs.Sprite(SCENES.MAIN_BOARD.ANIMATIONS.HAND, "put");

    // Position it.
    var vector = SCENES.MAIN_BOARD.VECTORS.IMAGE_TICKETS[ticketLocation];
    hand.x = vector.getX() - 120;
    hand.y = vector.getY() - 235;

    stage.addChildAt(hand, 2 + currentTickets.length);

    // Add listeners to spawn ticket.
    hand.on("change", function(event) {

        // Mid animation...
        if (event.target.currentFrame == 5) {

            /* Add the new ticket. */

            // Create a container.
            var container = new createjs.Container();

            // Position it.
            container.x = vector.getX();
            container.y = vector.getY();

            // Add the graphic.
            var ticketBG = new createjs.Bitmap(loader.getResult("ticket-" + getRandomInt(1, 8)))
            container.addChild(ticketBG);

            // Add the text.
            var name = new createjs.Text(ticketName, "60px VT323", "#333333");
            name.x = 25;
            name.y = 25;
            name.textWidth = 100;

            var deadline = new createjs.Text(formatTimeFromSeconds(ticketDeadline), "bold 115px VT323", "#333333");
            deadline.x = 65;
            deadline.y = 150;

            // Add the pin.
            var pin = new createjs.Bitmap(loader.getResult("pin-" + getRandomInt(1, 3)));
            pin.x = getRandomInt(65, 200);
            pin.y = getRandomInt(-40, -10);

            // Add the listener.
            ticketBG.on("click", function(event) {
                inspectTicket(ticket);
            });

            // Add the container to the stage.
            stage.addChildAt(container, 2 + currentTickets.length);
            container.addChild(name);
            container.addChild(deadline);
            container.addChild(pin);

            // Add the ticket.
            currentTickets.push({
                container : container,
                ticket : ticket
            });

        }
    });
    hand.on("animationend", function(event) {
        stage.removeChild(hand);
        spawnTicketLock = false;
    });

}

/**
 * Check whether a ticket location is valid
 * (ergo none others in the array share the
 * same location).
 *
 * @param i The index of the ticket.
 */
function isValidTicketLocation(i) {

    // Loop through each.
    for(var j = 0; j < currentTickets.length; j++) {
        if(currentTickets[j].ticket.getPos() == i) {
            return false;
        }
    }

    return true;

}

/**
 * Get a random string of characters in
 * the format XXX-XXXXX.
 */
function getRandomTicketName() {

    /*
     *  Stolen from SO:
     *  http://tiny.cc/see-so-post
     */
    return ((Math.random().toString(36)+'00000000000000000').slice(2, 2+2)
            + "-"
            + (Math.random().toString(36)+'00000000000000000').slice(2, 4+2)).toUpperCase();

}

/**
 *  Get a random criteria pertaining to a ticket.
 */
function getRandomTicketCriteria() {

    // Keep a track of the fields.
    var red, green, blue, black;

    // Randomly assign to each colour.
    if(getRandomInt(0, 1)) {
        red = getRandomInt(0, 1) ? true : false;
    }
    if(getRandomInt(0, 1)) {
        green = getRandomInt(0, 1) ? true : false;
    }
    if(getRandomInt(0, 1)) {
        blue = getRandomInt(0, 1) ? true : false;
    }
    if(getRandomInt(0, 1)) {
        black = getRandomInt(0, 1) ? true : false;
    }

    return new Criteria(red, green, blue, black);

}

// TODO: Can be automated.
/**
 *  Get a random output pertaining to a ticket.
 */
function getRandomTicketOutput() {
    return OUTPUTS[getRandomInt(0, OUTPUTS.length - 1)];
}

/**
 *  Get a random deadline for a ticket in the future.
 */
function getRandomTicketDeadline() {
    return timeKeeper.timeElapsed + getRandomInt(DIFFICULTIES[player.difficulty].MIN_DEADLINE, DIFFICULTIES[player.difficulty].MAX_DEADLINE);
}

/**
 * Check if a ticket should pass.
 *
 * @param criteria  The criteria for passing.
 * @param output    The output of the program.
 */
function checkTicketSolution(criteria, output) {

    /*
     *  For each field of the criteria,
     *  check if it is relevant,
     *  and check if it holds.
     */
    if(criteria.isRed() != null && criteria.isRed() != output.isRed()) {
        return false;
    }
    if(criteria.isGreen() != null && criteria.isGreen() != output.isGreen()) {
        return false;
    }
    if(criteria.isBlue() != null && criteria.isBlue() != output.isBlue()) {
        return false;
    }
    if(criteria.isBlack() != null && criteria.isBlack() != output.isBlack()) {
        return false;
    }

    return true;

}

/**
 * Open the inspection screen for a specific ticket
 * and manage main game logic in listeners.
 *
 * @param ticket    The ticket to be operated on.
 */
function inspectTicket(ticket) {

    // If a ticket is already being inspected, return.
    if(player.isInspecting) {
        return;
    }

    // Log that the inspection screen is open.
    player.isInspecting = true;

    // Find the correct ticket.
    var ticket;
    for(var i = 0; i < currentTickets.length; i++) {
        if(currentTickets[i].ticket == ticket) {
            ticket = currentTickets[i];
        }
    }

    /* Initialise the inspection screen. */

    // Create a container.
    SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN = new createjs.Container();

    // Background.
    var inspectionScreen = new createjs.Bitmap(loader.getResult("inspection"));
    SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(inspectionScreen);

    var criteriaText = ticket.ticket.getCriteria().toString();
    if(criteriaText == "") {
        criteria = NO_CRITERIA_MESSAGE;
    }

    // Add criteria.
    var criteria = new createjs.Text(criteriaText, "60px VT323", "#555555");
    criteria.x = SCENES.INSPECTION_SCREEN.VECTORS.TEXT_INPUT.getX();
    criteria.y = SCENES.INSPECTION_SCREEN.VECTORS.TEXT_INPUT.getY();
    criteria.lineWidth = 650;
    criteria.lineHeight = 55;
    SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(criteria);

    // Back button.
    var backBtn = new createjs.Bitmap(loader.getResult("button-back"));
    backBtn.x = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_BACK.getX();
    backBtn.y = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_BACK.getY();
    // Add a listener.
    backBtn.on("click", function(event) {
        stage.removeChild(SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN);
        player.isInspecting = false;

    });
    SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(backBtn);

    // Run button.
    var hasRan = false;
    var runBtn = new createjs.Bitmap(loader.getResult("button-run"));
    runBtn.x = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_RUN.getX();
    runBtn.y = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_RUN.getY();
    // Add a listener.
    runBtn.on("click", function(event) {
        if(!hasRan) {
            hasRan = true;
            // Add wait graphic.
            var wait = new createjs.Bitmap(loader.getResult("text-wait"));
            wait.x = SCENES.INSPECTION_SCREEN.VECTORS.TEXT_STATUS_RUN.getX();
            wait.y = SCENES.INSPECTION_SCREEN.VECTORS.TEXT_STATUS_RUN.getY();
            SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(wait);
            // Start an asynchronous timer.
            setTimeout(function () {
                // Add done graphic.
                SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.removeChild(wait);
                var done = new createjs.Bitmap(loader.getResult("text-done"));
                done.x = SCENES.INSPECTION_SCREEN.VECTORS.TEXT_STATUS_DONE.getX();
                done.y = SCENES.INSPECTION_SCREEN.VECTORS.TEXT_STATUS_DONE.getY();
                SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(done);
                // Display the output.
                var output = new createjs.Bitmap(loader.getResult(
                   ticket.ticket.getOutput().getImage()
                ));
                output.x = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_OUTPUT.getX();
                output.y = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_OUTPUT.getY();
                SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(output);
            }, ticket.ticket.getRuntime());
        }
    });
    SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(runBtn);

    // Accept button.
    var acceptBtn = new createjs.Bitmap(loader.getResult("button-accept"));
    acceptBtn.x = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_ACCEPT.getX();
    acceptBtn.y = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_ACCEPT.getY();
    // Add a listener.
    acceptBtn.on("click", function(event) {
        answer(true);
    });
    SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(acceptBtn);

    // Reject button.
    var rejectBtn = new createjs.Bitmap(loader.getResult("button-reject"));
    rejectBtn.x = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_REJECT.getX();
    rejectBtn.y = SCENES.INSPECTION_SCREEN.VECTORS.IMAGE_BUTTON_REJECT.getY();
    // Add a listener.
    rejectBtn.on("click", function(event) {
        answer(false);
    });
    SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN.addChild(rejectBtn);

    // Add the container to the stage.
    stage.addChild(SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN);

    /**
     * Assess whether the player got the
     * answer right and fire events accordingly.
     *
     * @param decision  True or false.
     */
    function answer(decision) {

        // Check whether the answer was correct.
        if(decision == ticket.ticket.getSolution()) {

            // Provide visual feedback.
            displayCorrect(true);

            // Check the time of the ticket and see whether the quota needs to be added to.
            if(ticket.ticket.getDeadline() >= timeKeeper.timeElapsed) {
                player.succeeded++;
                // Update the player model in a smaller increment.
                player.score += DIFFICULTIES[player.difficulty].SCORE_INCREMENT;
                player.gain += DIFFICULTIES[player.difficulty].SCORE_INCREMENT;
            } else {
                // Update the player model.
                player.score += DIFFICULTIES[player.difficulty].SCORE_INCREMENT / 2;
                player.gain += DIFFICULTIES[player.difficulty].SCORE_INCREMENT / 2;
            }

        } else {

            // Provide visual feedback.
            displayCorrect(false);

            // Roll for regression.
            var regress = getRandomInt(0, DIFFICULTIES[player.difficulty].REGRESSION_PROPENSITY);
            player.quota += regress;

            // Update the player model.
            player.score -= regress * (DIFFICULTIES[player.difficulty].SCORE_INCREMENT
                * DIFFICULTIES[player.difficulty].SCORE_MULTIPLIER);
            player.loss += regress * (DIFFICULTIES[player.difficulty].SCORE_INCREMENT
                * DIFFICULTIES[player.difficulty].SCORE_MULTIPLIER);

        }

        // Remove the ticket.
        var index = currentTickets.indexOf(ticket);
        currentTickets.splice(index, 1);

        // Remove the listener to prevent bugs.
        ticket.container.mouseChildren = false;

        // Hide the inspection overlay.
        stage.removeChild(SCENES.INSPECTION_SCREEN.CONTAINERS.MAIN);

        // Remove the ticket in an interesting way.
        createjs.Tween.get(ticket.container)
            .to({alpha: 60}, 200, createjs.Ease.linear)
            .to({y: 1400}, 400, createjs.Ease.quartIn)
            .call(function() { stage.removeChild(ticket.container); });

        // Update the quota.
        updateQuota();

        player.isInspecting = false;

    }

}

/**
 *  Update the quota display from game objects.
 */
function updateQuota() {
    SCENES.MAIN_BOARD.CONTAINERS.QUOTA.text = "QUOTA: " + player.succeeded + "/" + player.quota;
}

/**
 *  Display an in-between-game-days screen that
 *  serves to inform the user whether they have
 *  lost or may continue playing.
 */
function displayInterim() {

    /* Initialise the screen. */

    // Create a container.
    SCENES.INTERIM_SCREEN.CONTAINERS.MAIN = new createjs.Container();

    // Background.
    var interimScreen = new createjs.Bitmap(loader.getResult("interim"));
    SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(interimScreen);

    /* Add day results. */

    var quotaResult = new createjs.Text("QUOTA RESULT: " + player.succeeded + "/" + player.quota, "60px VT323", "#555555");
    quotaResult.x = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY_RESULT.getX();
    quotaResult.y = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY_RESULT.getY();
    quotaResult.lineWidth = 550;
    quotaResult.lineHeight = 55;
    SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(quotaResult);

    var quotaSuccess;
    if(player.succeeded >= player.quota) {
        quotaSuccess = new createjs.Text("You reached your day's quota, good job.", "60px VT323", "#00ff00");
    } else {
        quotaSuccess = new createjs.Text("You failed to reach your day's quota.", "60px VT323", "#ff0000");
    }
    quotaSuccess.x = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY_RESULT.getX();
    quotaSuccess.y = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY_RESULT.getY() + 100;
    quotaSuccess.lineWidth = 550;
    quotaSuccess.lineHeight = 55;
    SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(quotaSuccess);

    var scoreDetail = new createjs.Text(
        "SCORE:\n         +" + player.gain + "\n         -" + player.loss + "\nBonus: " + player.bonus,
        "60px VT323", "#555555");
    scoreDetail.x = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY_RESULT.getX();
    scoreDetail.y = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY_RESULT.getY() + 300;
    scoreDetail.lineWidth = 550;
    scoreDetail.lineHeight = 60;
    SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(scoreDetail);

    stage.addChild(SCENES.INTERIM_SCREEN.CONTAINERS.MAIN);

    var totalScore = new createjs.Text("TOTAL SCORE: " + player.score, "60px VT323", "#555555");
    totalScore.x = SCENES.INTERIM_SCREEN.VECTORS.TEXT_TOTAL_SCORE.getX();
    totalScore.y = SCENES.INTERIM_SCREEN.VECTORS.TEXT_TOTAL_SCORE.getY();
    totalScore.lineWidth = 600;
    totalScore.lineHeight = 55;
    SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(totalScore);

    // Day number.
    var dayNumber = new createjs.Text("END OF DAY " + player.day + "...", "90px VT323", "#ffffff");
    dayNumber.x = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY.getX();
    dayNumber.y = SCENES.INTERIM_SCREEN.VECTORS.TEXT_DAY.getY();
    dayNumber.lineWidth = 700;
    dayNumber.lineHeight = 55;
    SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(dayNumber);

    // If the player has succeeded.
    if(player.succeeded >= player.quota) {

        // Add graphic.
        var bedGraphic = new createjs.Bitmap(loader.getResult("bed"));
        bedGraphic.x = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_BED.getX();
        bedGraphic.y = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_BED.getY();
        SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(bedGraphic);

        // Add button.
        var nextButton = new createjs.Bitmap(loader.getResult("button-next"));
        nextButton.x = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_BUTTON_NEXT.getX();
        nextButton.y = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_BUTTON_NEXT.getY();
        SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(nextButton);
        // Add listener.
        nextButton.on("click", function() {
            // Remove this view.
            stage.removeChild(SCENES.INTERIM_SCREEN.CONTAINERS.MAIN);
            // "Restart" day.
            restart();
        });

    }
    else {

        // Add graphic.
        var fireGraphic = new createjs.Bitmap(loader.getResult("fire"));
        fireGraphic.x = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_FIRE.getX();
        fireGraphic.y = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_FIRE.getY();
        SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(fireGraphic);

        // Add button.
        var restartButton = new createjs.Bitmap(loader.getResult("button-restart"));
        restartButton.x = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_BUTTON_RESTART.getX();
        restartButton.y = SCENES.INTERIM_SCREEN.VECTORS.IMAGE_BUTTON_RESTART.getY();
        SCENES.INTERIM_SCREEN.CONTAINERS.MAIN.addChild(restartButton);
        // Add listener.
        restartButton.on("click", function() {
            location.reload();
        });

    }

}

function displayCorrect(isCorrect) {

    var text;
    if(isCorrect) {
        text = new createjs.Text("SUCCESS", "bold 290px VT323", "#00ff00");
    }
    else {
        text = new createjs.Text("BUGGED", "bold 290px VT323", "#ff0000");
    }
    text.x = 960;
    text.y = 540;
    text.textAlign = "center";
    text.textBaseline = "middle";
    text.alpha = 0;
    stage.addChild(text);

    createjs.Tween.get(text)
        .to({alpha: 60}, 200, createjs.Ease.linear)
        .to({alpha: 100, y: -400}, 400, createjs.Ease.backIn)
        .call(function() { stage.removeChild(text); });

}

/**
 *  Update the game's display
 *  based on events.
 */
function tick(event) {
    
    // Update the stage.
    stage.update(event);
    
}

/**
 *  Returns a random integer between min (inclusive) and max (inclusive).
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}