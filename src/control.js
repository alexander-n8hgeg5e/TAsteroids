
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


function isNullQObject(obj)
    {
      return obj === null || obj === undefined
    }


var playerVehicles = [];

for(var i = 0; i< gameState.playerCount; ++i)
{
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
	playerVehicles[i].control = true; // enable disable user control
}

function startAcceleration(/*Vehicle* */ vehicle)
{
	vehicle.deccelerating = false;
	vehicle.accelerating = true;
	vehicle.exhaust.visible = true;
	soundEngine.play('loop_engine.wav_' +vehicle.i,-1);
	disablePositionControl(vehicle);
}

function startDecceleration(/*Vehicle* */ vehicle)
{
	vehicle.accelerating = false;
	vehicle.deccelerating = true;
	vehicle.exhaust.visible = false;
	soundEngine.play('loop_engine.wav_' +vehicle.i,-1);
	disablePositionControl(vehicle);
}

function stopAcceleration(/*Vehicle* */ vehicle)
{
	vehicle.xAcceleration = 0.0;
	vehicle.yAcceleration = 0.0;
	vehicle.accelerating = false;
	vehicle.deccelerating = false;
	vehicle.exhaust.visible = false;
	soundEngine.stop('loop_engine.wav_'+vehicle.i);
}

function enablePositionControl(/*Vehicle* */ vehicle)
{
	vehicle.positionControl = 20.0;
}
function enableRotationControl(/*Vehicle* */ vehicle)
{
	vehicle.rotationControl = 100.0;
}
function disablePositionControl(/*Vehicle* */ vehicle)
{
	vehicle.positionControl = 0.0;
}
function disableRotationControl(/*Vehicle* */ vehicle)
{
	vehicle.rotationControl = 0.0;
}

function enableShield(/*Vehicle* */ vehicle)
{
	if(vehicle.shieldDuration < 75)
		return;

	vehicle.shield.visible = true;
	vehicle.indestructible = true;
	vehicle.control = false;
	soundEngine.play('loop_shield.wav_' + vehicle.i,-1);
}

function disableShield(/*Vehicle* */ vehicle)
{
	vehicle.shield.visible = false;
	vehicle.indestructible = false;
	vehicle.control = true;
	soundEngine.stop('loop_shield.wav_' + vehicle.i);
}

function startWormholeTravel(/*Vehicle* */ vehicle)
{
    if(vehicle.wormholeState != Vehicle.OUTSIDE)
		return;

	vehicle.control = false; // disable user control
	stopAcceleration(vehicle);
	vehicle.wormholeTravelTime = 50;
	vehicle.beginWormholeTravel();
	soundEngine.play('vanish.wav');
}

function onGestureStarted(gesture)
{
    if(gameState.gameOver)
    {
        return;
    }
}

function onGestureFinished(gesture)
{
    if(gameState.gameOver)
    {
        return;
    }

    else if(gesture === Qt.PinchGesture)
    {
        startWormholeTravel(playerVehicles[0]);
    }
}

var isRotatingLeft = false;
var isRotatingRight = false;


function key_up_press(playernum){
	if(playerVehicles[0].deccelerating == true){
		stopAcceleration(playerVehicles[0]);
	}
	else{
		startAcceleration(playerVehicles[0]);
	}
}
function key_up_release(playernum){
	stopAcceleration(playerVehicles[playernum]);
	enablePositionControl(playerVehicles[playernum]);
}
function key_down_press(playernum){
	if(playerVehicles[0].accelerating == true){
		stopAcceleration(playerVehicles[0]);
	}
	else{
		startDecceleration(playerVehicles[0]);
	}
}
function key_down_release(playernum){
	stopAcceleration(playerVehicles[playernum]);
	enablePositionControl(playerVehicles[playernum]);
}
function key_left_press(playernum){
	//if(playerVehicles[0].angularVelocity < 0.01){
	//    playerVehicles[0].angularVelocity = 0;
	//    playerVehicles[0].torque = 0;
	//    }
	//else{
	    disableRotationControl(playerVehicles[0]);
		playerVehicles[0].torque = 500.0;
	//}
    //playerVehicles[0].angularVelocity = -350.0;

    isRotatingLeft = true;
}
function key_left_release(playernum){
    isRotatingLeft = false;
    //if(isRotatingRight === false)
    //{
        //playerVehicles[0].angularVelocity = 0;
	    playerVehicles[playernum].torque = 0.0;
		enableRotationControl(playerVehicles[playernum]);
    //}
}
function key_right_press(playernum){
	//if(playerVehicles[0].angularVelocity < 0.01){
	//    playerVehicles[0].angularVelocity = 0.0;
	//    playerVehicles[0].torque = 0;
	//    }
	//else{
	    disableRotationControl(playerVehicles[0]);
		playerVehicles[0].torque = -500.0;
    //}
	//playerVehicles[0].angularVelocity = 350.0;
    isRotatingRight = true;
}
function key_right_release(playernum){
    isRotatingRight = false;
    //if(isRotatingLeft === false)
    //{
        //playerVehicles[0].angularVelocity = 0;
	    playerVehicles[playernum].torque = 0.0;
		enableRotationControl(playerVehicles[playernum]);
            //}
}

function onKeyPress(key)
	{

    if(gameState.gameOver)
    {
        return;
    }

	if(!isNullQObject(playerVehicles[0])
        && playerVehicles[0].control == true && playerVehicles[0].wormholeState == Vehicle.OUTSIDE)
	switch(key)
	{      
        case Qt.Key_Up:
		{
            key_up_press(0);
			break;
		}
		case Qt.Key_Down:
		{
            key_down_press(0);
			break;
		}
		case Qt.Key_Left:
		{
            key_left_press(0);
			break;
		}
		case Qt.Key_Right:
		{
            key_right_press(0);
			break;
		}
		case Qt.Key_Space:
		{
            playerVehicles[0].shooting = true;
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
        && playerVehicles[1].control == true && playerVehicles[1].wormholeState == Vehicle.OUTSIDE)
	switch(key)
	{
		case Qt.Key_W:
		{
            key_up_press(1);
			break;
        }
		case Qt.Key_A:
		{
            key_left_press(1);
			break;
		}
		case Qt.Key_S:
		{
            key_down_press(1);
			break;
		}
		case Qt.Key_D:
		{
            key_right_press(1);
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
			playerVehicles[1].shooting = true;
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
            key_up_release(0);
			break;
		}
        case Qt.Key_Down:
		{
            key_down_release(0);
			break;
		}
		case Qt.Key_Left:
		{
            key_left_release(0);
			break;
		}
        case Qt.Key_Right:
		{
            key_right_release(0);
			break;
		}
		case Qt.Key_Space:
		{
			playerVehicles[0].shooting = false;
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
            key_up_release(1);
			break;
		}
		case Qt.Key_A:
		{  // vehicle 1 left
            key_left_release(1);
			break;
		}
		case Qt.Key_S:
		{  // vehicle 1 down
            key_down_release(1);
			break;
		}
		case Qt.Key_D:
		{  // vehicle 1 right
            key_right_release(1);
			break;
		}
		case Qt.Key_Control:
		{  // vehicle 1 fire
			playerVehicles[1].shooting = false;
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
// vim: set foldmethod=indent foldlevel=0 ;
