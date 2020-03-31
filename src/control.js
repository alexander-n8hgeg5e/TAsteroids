
ScriptProxy.signalKeyPress.connect(onKeyPress);
ScriptProxy.signalKeyRelease.connect(onKeyRelease);

ScriptProxy.signalGestureStarted.connect(onGestureStarted);
ScriptProxy.signalGestureFinished.connect(onGestureFinished);

//coordinate system 0,0 of playerVehicles[1] is in topleft corner
// angles are degree by default

// before you change here anything, make sure this script is actually loaded

// WARNING SCRIPT MAY BE TAKEN FROM RESOURCE
// ALTERING THIS FILE MAY NOT HAVE ANY EFFECT
// check setupScript in graphicsview.cpp for this issue


function isNullQObject(obj){
    return obj === null || obj === undefined
    }


var playerVehicles = [];

for(var i = 0; i< gameState.playerCount; ++i){
	playerVehicles[i] = graphicsEngine.createVehicleAt(416 + 384*i,-600);
	playerVehicles[i].file = i == 0 ? ':playerVehicle1.svg' :  ':images/purplePlayerVehicle1.svg';
	playerVehicles[i].setCenterOffset();
	playerVehicles[i].diplomacy = 1;
	playerVehicles[i].hitpoints = 10;
	playerVehicles[i].isPlayer = true;
	playerVehicles[i].setMaximumVelocity(50.0,50.0);


	// dynamic properties
	playerVehicles[i].i = i;
	playerVehicles[i].shootCooldown = 0;
	playerVehicles[i].reloadCooldown = 0;
	playerVehicles[i].exhaust = graphicsEngine.createAnimatedItemAt(-48,0, ':images/exhaust.svg');
	playerVehicles[i].exhaust.parentItem = playerVehicles[i];
	playerVehicles[i].exhaust.visible = false;
	playerVehicles[i].shield = graphicsEngine.createAnimatedItemAt(0,0,':images/shield.svg');
	playerVehicles[i].shield.parentItem = playerVehicles[i];
	playerVehicles[i].shield.visible = false;
	playerVehicles[i].shieldDuration = 200;
	playerVehicles[i].wormholeTravelTime = 0;
	playerVehicles[i].control_user = true; // enable disable user control
    }

/* acceleration decceleration */
function startAcceleration(num_player){
	playerVehicles[num_player].deccelerating = false;
	playerVehicles[num_player].accelerating = 1.0;
	playerVehicles[num_player].control_position = 0.0;}
function startDecceleration(num_player){
	playerVehicles[num_player].accelerating = 0.0;
	playerVehicles[num_player].deccelerating = true;
	playerVehicles[num_player].control_position = 0.0;}
function stopAccelerationDecceleration(num_player){
	playerVehicles[num_player].accelerating  = 1.0;
	playerVehicles[num_player].deccelerating = false;
	playerVehicles[num_player].control_position = 20.0;}

/* rotation */
function startRotateLeft(num_player){
	playerVehicles[num_player].control_heading = 0.0;
	playerVehicles[num_player].torque = 500.0;}
function startRotateRight(num_player){
	playerVehicles[num_player].control_heading = 0.0;
	playerVehicles[num_player].torque = -500.0;}
function stopRotateLeftRight(num_player){
	playerVehicles[num_player].torque = 0.0;
	playerVehicles[num_player].control_heading = 100.0;}

/* shooting */
function startFire(playernum){
    playerVehicles[0].shooting = true;}
function stopFire(playernum){
    playerVehicles[0].shooting = false;}

function enableShield(/*Vehicle* */ vehicle){
	if(vehicle.shieldDuration < 75)
		return;

	vehicle.shield.visible = true;
	vehicle.indestructible = true;
	vehicle.control_user = false;
	soundEngine.play('loop_shield.wav_' + vehicle.i,-1);
    }

function disableShield(/*Vehicle* */ vehicle){
	vehicle.shield.visible = false;
	vehicle.indestructible = false;
	vehicle.control_user = true;
	soundEngine.stop('loop_shield.wav_' + vehicle.i);
    }

function startWormholeTravel(/*Vehicle* */ vehicle){
    if(vehicle.wormholeState != Vehicle.OUTSIDE)
		return;

	vehicle.control_user = false; // disable user control
	stopAcceleration(vehicle);
	vehicle.wormholeTravelTime = 50;
	vehicle.beginWormholeTravel();
	soundEngine.play('vanish.wav');
    }

function onGestureStarted(gesture){
    if(gameState.gameOver)
    {
        return;
    }
    }

function onGestureFinished(gesture){
    if(gameState.gameOver)
    {
        return;
    }

    else if(gesture === Qt.PinchGesture)
    {
        startWormholeTravel(playerVehicles[0]);
    }
    }

function onKeyPress(key){
    if(gameState.gameOver)
    {
        return;
    }

	if(!isNullQObject(playerVehicles[0])
        && playerVehicles[0].control_user == true && playerVehicles[0].wormholeState == Vehicle.OUTSIDE)
	switch(key)
	{      
        case Qt.Key_Up:
		{
            startAcceleration(0);
			break;
		}
		case Qt.Key_Down:
		{
            startDecceleration(0);
			break;
		}
		case Qt.Key_Left:
		{
            startRotateLeft(0);
			break;
		}
		case Qt.Key_Right:
		{
            startRotateRight(0);
			break;
		}
		case Qt.Key_Space:
		{
            startFire(0);
			break;
		}
		// Key_Enter didn't work
		case Qt.Key_W:
		{
			startWormholeTravel(playerVehicles[0]);
			break;
		}
		case Qt.Key_Delete:
		{
			enableShield(playerVehicles[0]);
			break;
		}
		default:;
	}

	if(!isNullQObject(playerVehicles[1])
        && playerVehicles[1].control_user == true && playerVehicles[1].wormholeState == Vehicle.OUTSIDE)
	switch(key)
	{
		case Qt.Key_W:
		{
            startAcceleration(1);
			break;
        }
		case Qt.Key_A:
		{
            startRotateLeft(1);
			break;
		}
		case Qt.Key_S:
		{
            startDecceleration(1);
			break;
		}
		case Qt.Key_D:
		{
            startRotateRight(1);
			break;
		}
		case Qt.Key_F:
		{
			startWormholeTravel(playerVehicles[1]);
			break;
		}
		case Qt.Key_G:
		{
			enableShield(playerVehicles[1]);
			break;
		}
		case Qt.Key_Control:
		{
            startFire(1);
			break;
		}
		default:;
	}
    }

function onKeyRelease(key){
    if(gameState.gameOver){
        return;
    }
    if(!isNullQObject(playerVehicles[0]))
    switch (key){
        case Qt.Key_Up:
		{
            stopAccelerationDecceleration(0);
			break;
		}
        case Qt.Key_Down:
		{
            stopAccelerationDecceleration(0);
			break;
		}
		case Qt.Key_Left:
		{
            stopRotateLeftRight(0);
			break;
		}
        case Qt.Key_Right:
		{
            stopRotateLeftRight(0);
			break;
		}
		case Qt.Key_Space:
		{
            stopFire(0);
			break;
		}
		case Qt.Key_Delete:
		{
			disableShield(playerVehicles[0]);
			break;
		}
		default:;
	}


    if(!isNullQObject(playerVehicles[1]))
    switch (key)
	{
		case Qt.Key_W:
		{  // vehicle 1 up
            stopAccelerationDecceleration(1);
			break;
		}
		case Qt.Key_A:
		{  // vehicle 1 left
            stopRotateLeftRight(1);
			break;
		}
		case Qt.Key_S:
		{  // vehicle 1 down
            stopAccelerationDecceleration(1);
			break;
		}
		case Qt.Key_D:
		{  // vehicle 1 right
            stopRotateLeftRight(1);
			break;
		}
		case Qt.Key_Control:
		{  // vehicle 1 fire
            stopFire(1);
			break;
		}
		case Qt.Key_G:
		{  // vehicle 1 shield
			disableShield(playerVehicles[1]);
			break;
		}
		default:;
	}
    }

// vim: set foldmethod=indent foldlevel=0 foldnestmax=1 :
