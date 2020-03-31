

// WARNING SCRIPT IS TAKEN FROM RESOURCE

// all script functions that must be called regulary must be in here

ScriptProxy.signalTimerEvent.connect(mainLoop);
gameState.signalPhaseChanged.connect(phaseChange);

var finalPhase = 5 // the number of levels

// call callback for asteroid initialization
//phaseChange(0);

var ufo;
var ufoAppearCountdown = 500;
var cosAnglePlayerVehicle;
var sinAnglePlayerVehicle;

class Cannon {}
for(var i = 0; i < playerVehicles.length; i++){
    playerVehicles[i].cannon=[new Cannon(),new Cannon(),new Cannon()];
    playerVehicles[i].cannon[0].shootCooldown=0;
    playerVehicles[i].cannon[1].shootCooldown=0;
    playerVehicles[i].cannon[2].shootCooldown=0;
    playerVehicles[i].cannon[0].shooting=0;
    playerVehicles[i].cannon[1].shooting=0;
    playerVehicles[i].cannon[2].shooting=0;
    }
var timestep=0;

function mainLoop(){
    /* timestep */
    timestep++;
    if(timestep%(1000*1000)==0){timestep=0;}

	for(var i = 0; i < playerVehicles.length; ++i)
	{
	    cosAnglePlayerVehicle = Math.cos(playerVehicles[i].angle*Math.PI/180.0);
    	sinAnglePlayerVehicle = Math.sin(playerVehicles[i].angle*Math.PI/180.0);

        // check for wrapped NULL pointer
		if(isNullQObject(playerVehicles[i]) == true){continue;}

		/* wormhole */
		if(playerVehicles[i].wormholeTravelTime > 0){
			--playerVehicles[i].wormholeTravelTime;
			if(playerVehicles[i].wormholeTravelTime <= 0){
				randPosX = Math.floor(Math.random() *1600.0);
				randPosY = Math.floor(Math.random() * 1200.0);

				if(isNearPlayers(randPosX,randPosY)) // try next time
				{
					playerVehicles[i].wormholeTravelTime = 1;
					continue;
				}

				playerVehicles[i].px = randPosX;
				playerVehicles[i].py = randPosY;

				playerVehicles[i].endWormholeTravel();
				soundEngine.play('appear.wav');
				playerVehicles[i].control_user = true;
                }
			continue;
		    }

		/* shield */
		if(playerVehicles[i].indestructible == true){
			playerVehicles[i].shieldDuration-=3; // weaken shield

			if(playerVehicles[i].shieldDuration < 100){ // begin to flicker
			    playerVehicles[i].shield.visible = playerVehicles[i].shieldDuration % 2;}

			if(playerVehicles[i].shieldDuration <= 0){
				playerVehicles[i].shield.visible = false;
				playerVehicles[i].indestructible = false;
				soundEngine.stop('loop_shield.wav_'+i);
			    }
		    }
		else{
			if(playerVehicles[i].shieldDuration < 150)
			++playerVehicles[i].shieldDuration; // charge shield
		    }


        /* engine control */
        timestep_position_control(i);
        timestep_heading_control(i);
        timestep_engine_control(i);

		/* weapon systems */
        timestep_weapon_system_control(i);
        timestep_cannon(i,0);
        timestep_cannon(i,1);
        timestep_cannon(i,2);

		/* dynamics */
        timestep_dynamics(i);
	}

    //if(!isNullQObject(ufo) && ufo.wormholeState == Vehicle.OUTSIDE)
	//{
	//	var cosAngle = Math.cos(ufo.angle*Math.PI/180.0);
	//	var sinAngle = Math.sin(ufo.angle*Math.PI/180.0);
	//	if(ufo.shootCooldown <= 0)
	//	{
	//		var projectile =
	//		graphicsEngine.createCircleVehicleAt(ufo.x +cosAngle*60,
	//									   ufo.y +sinAngle*60, /*radius = */ 5.0);
    //        projectile.file = ":images/turquoiseBomb.svg";
	//		soundEngine.play('fire.wav');
	//		graphicsEngine.appendProjectile(projectile);
	//		var impulseX = cosAngle*40.0+ufo.xVelocity;
	//		var impulseY = sinAngle*40.0+ufo.yVelocity;
	//		projectile.applyImpulse(impulseX,impulseY);
	//		projectile.diplomacy = 3; // diplomacy of player
	//		projectile.isProjectile = true;
	//		ufo.shootCooldown = 25;
	//	}
	//	else
	//		--ufo.shootCooldown;

	//	ufo.xAcceleration = cosAngle*10.0;
	//	ufo.yAcceleration = sinAngle*10.0;

	//	++ufo.stayTime;
	//	if(ufo.stayTime  > 1000) // if it stayed too long and it hasn't been destroyed
	//	{
	//		ufo.beginWormholeTravel();
	//		soundEngine.play('vanish.wav');
	//	}
	//}
	//else // isNullQObject(ufo)
	//{
	//	--ufoAppearCountdown;
    //    if(ufoAppearCountdown <= 0  && !gameState.gameOver)
	//	{
	//		ufoAppearCountdown = 1000; // appear approximately every 40s
	//		appearUfo();
	//	}
	//}

	// uncomment this if no asteroids are spawned, else cpu load --> 100%
    //if(graphicsEngine.asteroidCount === 0 && !gameState.gameOver)
    //{
	//	gameState.phase += 1;
    //}
    }

function timestep_dynamics(num_player){
    if (timestep % 10 == 0){
        console.log("engine_main_power:",playerVehicles[num_player].engine_main_power);
        }
	playerVehicles[num_player].xAcceleration = cosAnglePlayerVehicle * playerVehicles[num_player].engine_main_power;
	playerVehicles[num_player].yAcceleration = sinAnglePlayerVehicle * playerVehicles[num_player].engine_main_power;
    }

function timestep_weapon_system_control(num_player){
    if ((playerVehicles[num_player].shooting == true) || ( playerVehicles[num_player].deccelerating == true)){
        playerVehicles[num_player].cannon[0].shooting = true;
        playerVehicles[num_player].cannon[1].shooting = true;
        playerVehicles[num_player].cannon[2].shooting = true;
        }
    else{
        playerVehicles[num_player].cannon[0].shooting = false;
        playerVehicles[num_player].cannon[1].shooting = false;
        playerVehicles[num_player].cannon[2].shooting = false;
        }
    }

function timestep_engine_control(num_player){
    if (playerVehicles[num_player].accelerating > 0){
        if (playerVehicles[num_player].exhaust.visible == false){engine_main_start(num_player);}
        playerVehicles[num_player].engine_main_power = 36.0;
        }
    else{
        if (playerVehicles[num_player].exhaust.visible == true){engine_main_stop(num_player);}
        playerVehicles[num_player].engine_main_power = 0.0;
        }
    }

function timestep_position_control(num_player){
	if(playerVehicles[num_player].control_position > 0 ){
        var Vx=playerVehicles[num_player].xVelocity;
        var Vy=playerVehicles[num_player].yVelocity;
        var energy = (Vx*Vx)+(Vy*Vy);
        if (energy > 2){
            var c= cosAnglePlayerVehicle;
            var s= sinAnglePlayerVehicle;
            var p = (Vx*c)+(Vy*s);
            if ( p < 0 ){
                playerVehicles[num_player].deccelerating = false;
                playerVehicles[num_player].accelerating = 0.3;
                }
            else{
                playerVehicles[num_player].deccelerating = true;
                playerVehicles[num_player].accelerating = 0.0;
                }
            }
        else{
            playerVehicles[num_player].deccelerating = false;
            playerVehicles[num_player].accelerating = 0.0;
            }
        }
    }

function timestep_heading_control(num_player){
	if(playerVehicles[num_player].control_heading > 0){
		if (playerVehicles[num_player].angularVelocity > 0) {
            playerVehicles[num_player].torque = playerVehicles[num_player].control_heading;
            }
        else if (playerVehicles[num_player].angularVelocity < 0){
            playerVehicles[num_player].torque = - playerVehicles[num_player].control_heading;
            }
        else{
            playerVehicles[num_player].torque = 0;
            }
        }
    }

function timestep_cannon(num_player,num_cannon){
	if(playerVehicles[num_player].cannon[num_cannon].shootCooldown > 0){
	    --playerVehicles[num_player].cannon[num_cannon].shootCooldown;
        }
	if(playerVehicles[num_player].cannon[num_cannon].reloadCooldown > 0){
	    --playerVehicles[num_player].cannon[num_cannon].reloadCooldown;
        }
    if(playerVehicles[num_player].cannon[num_cannon].shooting === true
	    //&& playerVehicles[num_player].shootCooldown <= 0 TODO: fixme
        && playerVehicles[num_player].indestructible === false){
            var offset_x = 0;
            if (num_cannon == 0){ offset_f = 54 ; offset_r =    0 ;}
            if (num_cannon == 1){ offset_f = 40 ; offset_r =   30 ;}
            if (num_cannon == 2){ offset_f = 40 ; offset_r = - 30 ;}
		    var projectile =
		    graphicsEngine.createCircleVehicleAt( 
                playerVehicles[num_player].x + cosAnglePlayerVehicle * offset_f + sinAnglePlayerVehicle * offset_r,
		    	playerVehicles[num_player].y + sinAnglePlayerVehicle * offset_f - cosAnglePlayerVehicle * offset_r,
                5.0 /* radius */);
		    if( num_player == 1 ){ projectile.file = ':images/purpleBomb.svg';}
		    graphicsEngine.appendProjectile(projectile);
		    var impulseX = cosAnglePlayerVehicle*40.0+playerVehicles[num_player].xVelocity;
		    var impulseY = sinAnglePlayerVehicle*40.0+playerVehicles[num_player].yVelocity;
		    projectile.applyImpulse(impulseX,impulseY);
            playerVehicles[num_player].applyImpulse( - impulseX*0.01, - impulseY*0.01);
            soundEngine.play('fire.wav');
		    projectile.diplomacy = 1; // diplomacy of player
		    projectile.isProjectile = true;
            //playerVehicles[num_player].reloadCooldown += 5;
		    playerVehicles[num_player].shootCooldown = 1;
		    //= playerVehicles[num_player].reloadCooldown >= 14 ?\
            // playerVehicles[num_player].reloadCooldown : 1;
	        }
    }

function engine_main_start(num_player){
	playerVehicles[num_player].exhaust.visible = true;
	soundEngine.play('loop_engine.wav_' + num_player,-1);
    }

function engine_main_stop(num_player){
	playerVehicles[num_player].exhaust.visible = false;
	soundEngine.stop('loop_engine.wav_'+num_player);
    }

function appearUfo(){
	randPosX = 800 + Math.floor(Math.random() *800.0);
	randPosY = -400 -Math.floor(Math.random() * 600.0);
	ufo = graphicsEngine.createUfoAt(randPosX,randPosY);
	ufo.endWormholeTravel();
	ufo.xAcceleration = 10;
	ufo.shootCooldown = 0;
	ufo.stayTime = 0; // time the ufo spends till it decides to vanish in a wormhole
    }

function distance(x1,y1,x2,y2){
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    }

function isNearPlayers(px,py){
	for(var i = 0; i < playerVehicles.length; ++i)
	{
		if(isNullQObject(playerVehicles[i]) == true) // check for wrapped NULL pointer
			continue;

		if(distance(playerVehicles[i].px,playerVehicles[i].py,px,py) < 512.0)
			return true;
	}
	return false;
    }

function phaseChange(newPhase){
    if(newPhase === finalPhase)
    {
        // make players indestructible

        for(var i = 0; i < playerVehicles.length; ++i)
        {
            if(isNullQObject(playerVehicles[i]) === true) // check for wrapped NULL pointer
                continue;

            playerVehicles[i].indestructible = true

        }

        gameState.gameOver = true;
        // todo set single press to exit on android
        // TODO use 5 different colors


        if(ScriptProxy.os === "android")
        {
            graphicsEngine.showText('Congratulations! You Finished the Game! \n Press BACK to return to menu')
        }
        else if(ScriptProxy.os === "ios")
        {
            graphicsEngine.showText('Congratulations! You Finished the Game!')
        }
        else
        {
            graphicsEngine.showText('Congratulations! You Finished the Game! \n Press ESC to return to menu')
        }
    }
    else
       {
        graphicsEngine.showText('Level ' + (newPhase+1),3000);

        for(i = 0; i< 3; ++i)
		{
			do
			{
				randPosX = 0+  Math.floor(Math.random() *1600.0);
				randPosY = 0;//-400 -Math.floor(Math.random() * 600.0);
			}
			while(isNearPlayers(randPosX,randPosY));

			graphicsEngine.createAsteroidAt(randPosX,randPosY,2.0);

		}
		// restore hitpoints every 2 levels
		if(newPhase % 2 == 0)
		{
			for(i= 0; i< playerVehicles.length; ++i)
				playerVehicles[i].hitpoints = 10;
		}
    }
    }

// vim: set foldmethod=indent foldlevel=0 foldnestmax=1 :
