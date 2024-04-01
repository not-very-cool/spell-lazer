var keys;
var points;
var mirrors;
var selected;
var selectedXDelta;
var selectedYDelta;
var downOnSelected;
var rotationOnSelected;
var clocked;
var laserOn;
var laserButton;
var xPosBox;
var yPosBox;
var angleBox;
var isTyping;
var pointer;
var score;
var scoreLabel;
var targetLabel;
var grid;
var showGrid;
var data;
var timer;
var codeBox;
var code;

function startGame(){
	keys = {};
	points = [];
	mirrors = [];
	selected = null;
	downOnSelected = false;
	rotationOnSelected = false;
	clicked = false;
	laserOn = false;
	isTyping = false;
	score = 0.0;
	showGrid = false;

	laserButton = document.getElementById("switch");
	xPosBox = document.getElementById("xPos");
	yPosBox = document.getElementById("yPos");
	angleBox = document.getElementById("angle");
	codeBox = document.getElementById("code");
	scoreLabel = document.getElementById("score");
	targetLabel = document.getElementById("target");
	grid = document.getElementById("grid");
	data = document.getElementById("data");
	timer = document.getElementById("timer");

	xPosBox.addEventListener("keydown", function(event) {
    	if (event.code === "Enter") {
    		setXPos();
    		xPosBox.select();
    	}
	});
	yPosBox.addEventListener("keydown", function(event) {
    	if (event.code === "Enter") {
    		setYPos();
    		yPosBox.select();
    	}
	});
	angleBox.addEventListener("keydown", function(event) {
    	if (event.code === "Enter") {
    		setAngle();
    		angleBox.select();
    	}
	});
	codeBox.addEventListener("keydown", function(event) {
    	if (event.code === "Enter") {
    		setCode();
    		angleBox.select();
    	}
	});

	stopTimer();
	myGameArea.start();

	let theta;
	var tempLength = myGameArea.canvas.width * 0.7 * (6.5 / 56.0);
	for (var i = 0; i < 5; i++){
		mirrors.push(new Mirror(myGameArea.canvas.width * 0.7 + 10 + tempLength * 0.5, (i + 1) * tempLength * 0.5, Math.PI / 4.0, tempLength, 1));
	}
	let centermirror = 5+Math.floor(Math.random()*3);
	for (var i = 5; i < 8; i++){
		theta=Math.random()*2*Math.PI
		h = 15*Math.abs(Math.cos(theta))+65*Math.abs(Math.sin(theta))
		w = 65*Math.abs(Math.cos(theta))+15*Math.abs(Math.sin(theta))
		mirrors.push(new Mirror(10+w+Math.random()*(myGameArea.canvas.width*0.7-10-2*w), i==centermirror?myGameArea.canvas.width*0.7*5.0/8.0*0.5+10+(Math.random()-1/2)*h:10+h+Math.random()*(myGameArea.canvas.width*0.7*5.0/8.0-10-2*h), theta, tempLength, i==7?-1:0));
	}

	pointer = new Pointer();
	pointer.randomize();
	updateCode();
}

function setXPos(){
	xPosBox.select();
	var toFloat = parseFloat(xPosBox.value);
    if (toFloat && selected != null){
		mirrors[selected].x = toFloat * ((myGameArea.canvas.width * 0.7) / 56.0) + 10.0;
    }
    setText();
}

function setYPos(){
	yPosBox.select();
	var toFloat = parseFloat(yPosBox.value);
    if (toFloat && selected != null){
		mirrors[selected].y = -toFloat * ((myGameArea.canvas.width * 0.7 * (5.0 / 8.0)) / 35.0) + ((10.0 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0)));
    }
    setText();
}

function setAngle(){
	angleBox.select();
	var toFloat = parseFloat(angleBox.value);
    if ((toFloat || toFloat == 0.0) && selected != null){
		mirrors[selected].angle = normalizeAngle360(-(toFloat - 360) * (Math.PI / 180.0));
    }
    setText();
}

function getHelp(){
	alert("Welcome to The Laser Shoot Simulator!\nHere are a few tips:\n1) Click and drag to move the mirrors.\n2) For precision movement use the arrow keys.\n3) When selected on a mirror hold shift while clicking and dragging to rotate the mirror.\n4) For precision rotation hold shift while pressing the arrow keys.\n5) Press enter when selected on a mirror to toggle between the different mirror styles.");
}

function showHideGrid(){
	if (grid.value == "Show Grid"){
		showGrid = true;
		grid.value = "Hide Grid";
	}
	else{
		showGrid = false;
		grid.value = "Show Grid"
	}
}

function showHideData(){
	if (data.value == "Show Data"){
		data.value = "Hide Data";
		xPosBox.style.visibility = "visible";
		yPosBox.style.visibility = "visible";
		angleBox.style.visibility = "visible";
	}
	else{
		data.value = "Show Data";
		xPosBox.style.visibility = "hidden";
		yPosBox.style.visibility = "hidden";
		angleBox.style.visibility = "hidden";
	}
}

function textOut(){
	isTyping = false;
	setText();
}

function textIn(){
	isTyping = true;
}

function keyActions(){
	if (isTyping == false){
		if (keys[16] == true){
			if (selected != null && rotationOnSelected == false){
				mirrors[selected].image.src = "rotateMirror" + String(mirrors[selected].numMirrors) + ".png";
			}
			rotationOnSelected = true;

		}
		if (keys[16] == false){
			if (selected != null && rotationOnSelected == true){
				mirrors[selected].image.src = "selectedMirror" + String(mirrors[selected].numMirrors) + ".png";
			}
			rotationOnSelected = false;
		}
	}
}

function laserOnOff(){
	if (laserButton.value == "Laser On"){
		laserOn = true;
		laserButton.value = "Laser Off";
	}
	else{
		laserOn = false;
		laserButton.value = "Laser On"
	}
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = window.innerWidth * 0.7;
        this.canvas.height = window.innerHeight * 0.7;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            keys[e.keyCode] = true;

            if (isTyping == false){
            	if (keys[13] == true){
					if (selected != null){
						mirrors[selected].numMirrors += 1;
						mirrors[selected].numMirrors %= 4;
						if (mirrors[selected].numMirrors == 3){
							mirrors[selected].numMirrors = -1;
						}
						if (rotationOnSelected == true){
							mirrors[selected].image.src = "rotateMirror" + String(mirrors[selected].numMirrors) + ".png";
						}
						else{
							mirrors[selected].image.src = "selectedMirror" + String(mirrors[selected].numMirrors) + ".png";
						}
					}
				}

				if (keys[37] == true){
					if (selected != null){
						if (selected != null && rotationOnSelected == false){
							mirrors[selected].x -= 0.25;
						}
						else{
							mirrors[selected].angle += 0.005;
						}
					}
					setText();
				}
				if (keys[39] == true){
					if (selected != null){
						if (selected != null && rotationOnSelected == false){
							mirrors[selected].x += 0.25;
						}
						else{
							mirrors[selected].angle -= 0.005;
						}
					}
					setText();
				}
				if (keys[38] == true){
					if (selected != null){
						if (rotationOnSelected == false){
							mirrors[selected].y -= 0.25;
						}
						else{
							mirrors[selected].angle -= 0.005;
						}
					}
					setText();
				}
				if (keys[40] == true){
					if (selected != null){
						if (rotationOnSelected == false){
							mirrors[selected].y += 0.25;
						}
						else{
							mirrors[selected].angle += 0.005;
						}
					}
					setText();
				}
            }
        })
        window.addEventListener('keyup', function (e) {
            keys[e.keyCode] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

myGameArea.canvas.onmousedown = function(e){
	clicked = true;
	if (selected != null){
		mirrors[selected].image.src = "mirror" + String(mirrors[selected].numMirrors) + ".png";
		mirrors[selected].length *= 439.0 / 541.0;
		mirrors[selected].width *= 138.0 / 210.0;
		if (rotationOnSelected == true){
			mirrors[selected].angle = Math.atan((e.y - mirrors[selected].y) / (e.x - mirrors[selected].x));
			if (checkDirection(mirrors[selected].x, mirrors[selected].y, e.x, e.y, mirrors[selected].angle) == false){
				mirrors[selected].angle = Math.PI + mirrors[selected].angle;
			}
			mirrors[selected].angle = normalizeAngle360(mirrors[selected].angle);
		}
		else{
			selected = null;
		}
	}
	downOnSelected = false;

	var tempSelected = null;
	var minDist = 10000000000000000000.0;
	for (var i = 0; i < mirrors.length; i++){
		var dist = Math.pow(mirrors[i].x - e.x, 2.0) + Math.pow(mirrors[i].y - e.y, 2.0);
		if (dist <= Math.pow(mirrors[i].length * 0.5, 2.0)){
			if (dist < minDist){
				tempSelected = i;
				minDist = dist;
			}
		}
	}

	
	if (rotationOnSelected == true){
		if (selected == null && tempSelected != null){
			selected = tempSelected
			setText();
		}
		mirrors[selected].image.src = "rotateMirror" + String(mirrors[selected].numMirrors) + ".png";
		mirrors[selected].length *= 541.0 / 439.0;
		mirrors[selected].width *= 210.0 / 138.0;
		downOnSelected = true;
	}
	else{
		if (tempSelected != null){
			selected = tempSelected;
			setText();
			mirrors[selected].image.src = "selectedMirror" + String(mirrors[selected].numMirrors) + ".png";
			mirrors[selected].length *= 541.0 / 439.0;
			mirrors[selected].width *= 210.0 / 138.0;
			selectedXDelta = e.x - mirrors[selected].x
			selectedYDelta = e.y - mirrors[selected].y
			downOnSelected = true;
		}
	}
}

function setText(){
	if (selected != null) {
		xPosBox.value = String(Math.round((mirrors[selected].x - 10.0) * (56.0 / (myGameArea.canvas.width * 0.7)) * 100.0) / 100.0);
		yPosBox.value = String(Math.round(((10.0 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0)) - mirrors[selected].y) * (35.0 / (myGameArea.canvas.width * 0.7 * (5.0 / 8.0))) * 100.0) / 100.0);
		angleBox.value = String(Math.round((360.0 - (mirrors[selected].angle) * (180.0 / Math.PI)) * 100.0) / 100.0);
	}
}

function finalizeScore(){
	var lastPoint = points[points.length - 1];
	score += Math.max(25.0 - ((Math.abs(lastPoint[1] - pointer.y) * (350.0 / (myGameArea.canvas.width * 0.7 * (5.0 / 8.0))) + Math.abs(lastPoint[0] - (myGameArea.canvas.width * 0.7 + 10.0)) * (560.0 / (myGameArea.canvas.width * 0.7))) / 10.0), 0.0);
}

myGameArea.canvas.onmouseup = function(e){
	downOnSelected = false;
	clicked = false;
}

myGameArea.canvas.onmousemove = function(e){
	if (selected != null && downOnSelected == true && clicked == true){
		if (rotationOnSelected == false){
			mirrors[selected].x = e.x - selectedXDelta;
			mirrors[selected].y = e.y - selectedYDelta;
		}
		else{
			mirrors[selected].angle = Math.atan((e.y - mirrors[selected].y) / (e.x - mirrors[selected].x));
			if (checkDirection(mirrors[selected].x, mirrors[selected].y, e.x, e.y, mirrors[selected].angle) == false){
				mirrors[selected].angle = Math.PI + mirrors[selected].angle;
			}
			mirrors[selected].angle = normalizeAngle360(mirrors[selected].angle);
		}
		setText();
	}
}

function Mirror(x, y, angle, length, numMirrors){
	this.angle = angle;
	this.x = x;
	this.y = y;
	this.length = length;
	this.width = 15;
	this.standardLength = this.length;
	this.standardWidth = this.width;
	this.numMirrors = numMirrors;

	this.image = new Image();
	this.image.src = "mirror" + String(this.numMirrors) + ".png";

	this.update = function(){
		myGameArea.context.save();
		myGameArea.context.translate(this.x, this.y);
		myGameArea.context.rotate(this.angle);
		myGameArea.context.drawImage(this.image, -this.length * 0.5, -this.width * 0.5, this.length, this.width);
		myGameArea.context.restore();
	}
}

function Pointer(){
	this.length = 25;
	this.width = 20;
	this.x = 10 + myGameArea.canvas.width * 0.7 - this.length;
	this.y = 15;
	this.image = new Image();
	this.image.src = "pointer.png";

	this.sety = function(height) {
		this.y = height;
		targetLabel.innerText = "Target: "+height.toFixed(1)+" cm";
	}

	this.update = function(){
		myGameArea.context.save();
		myGameArea.context.drawImage(this.image, this.x, myGameArea.canvas.width/80*(this.y+5/2)+10-this.width/2, this.length, this.width);
		myGameArea.context.restore();
	}

	this.randomize = function(){
		this.sety(Math.floor(Math.random()*300)/10);
	}
}

function calculatePoints(){
	var angles = [0.0];
	points = [[10, 10 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0) * 0.5]];
	var lastMirrors = [-1];

	if (laserOn == false){
		return;
	}

	while (true){
		var laserPointX = points[points.length - 1][0];
		var laserPointY = points[points.length - 1][1];
		var laserAngle = angles[angles.length - 1];
		var laserSlope = Math.tan(laserAngle);

		var minDistance = 100000000000000000000.0;
		var collidesWith = null;
		var collisionX = null;
		var collisionY = null;
		var collisionSolid = false;

		for (var i = 0; i < mirrors.length; i++){
			if (i == lastMirrors[lastMirrors.length - 1]){
				continue;
			}

			var slopeMirror = Math.tan(mirrors[i].angle);
			var perpendicularSlope = -1.0 / slopeMirror;

			var point1Y = mirrors[i].standardWidth * 0.5 * Math.sin(mirrors[i].angle + Math.PI / 2.0) + mirrors[i].y;
			var point1X = mirrors[i].standardWidth * 0.5 * Math.cos(mirrors[i].angle + Math.PI / 2.0) + mirrors[i].x;

			var intersect1X = ((point1Y - slopeMirror * point1X) - (laserPointY - laserSlope * laserPointX)) / (laserSlope - slopeMirror);
			var intersect1Y = intersect1X * slopeMirror + point1Y - slopeMirror * point1X;

			if (checkDirection(laserPointX, laserPointY, intersect1X, intersect1Y, laserAngle)){
				var bound11 = mirrors[i].standardLength * 0.5 * Math.sin(mirrors[i].angle) + point1Y;
				var bound12 = -mirrors[i].standardLength * 0.5 * Math.sin(mirrors[i].angle) + point1Y;

				if (intersect1Y < Math.max(bound11, bound12) && intersect1Y > Math.min(bound11, bound12)){
					var distance1 = Math.sqrt(Math.pow(laserPointX - intersect1X, 2.0) + Math.pow(laserPointY - intersect1Y, 2.0));
					if (distance1 < minDistance){
						minDistance = distance1;
						collidesWith = i;
						collisionX = intersect1X;
						collisionY = intersect1Y;
						if (mirrors[i].numMirrors == 2){
							collisionSolid = false;
						}
						else{
							collisionSolid = true;
						}
					}
				}
			}

			var point2Y = -mirrors[i].standardWidth * 0.5 * Math.sin(mirrors[i].angle + Math.PI / 2.0) + mirrors[i].y;
			var point2X = -mirrors[i].standardWidth * 0.5 * Math.cos(mirrors[i].angle + Math.PI / 2.0) + mirrors[i].x;

			var intersect2X = ((point2Y - slopeMirror * point2X) - (laserPointY - laserSlope * laserPointX)) / (laserSlope - slopeMirror);
			var intersect2Y = intersect2X * slopeMirror + point2Y - slopeMirror * point2X;

			if (checkDirection(laserPointX, laserPointY, intersect2X, intersect2Y, laserAngle)){
				var bound21 = mirrors[i].standardLength * 0.5 * Math.sin(mirrors[i].angle) + point2Y;
				var bound22 = -mirrors[i].standardLength * 0.5 * Math.sin(mirrors[i].angle) + point2Y;

				if (intersect2Y < Math.max(bound21, bound22) && intersect2Y > Math.min(bound21, bound22)){
					var distance2 = Math.sqrt(Math.pow(laserPointX - intersect2X, 2.0) + Math.pow(laserPointY - intersect2Y, 2.0));

					if (distance2 < minDistance){
						minDistance = distance2;
						collidesWith = i;
						collisionX = intersect2X;
						collisionY = intersect2Y;
						if (mirrors[i].numMirrors == 2 || mirrors[i].numMirrors == 1 || mirrors[i].numMirrors == -1){
							collisionSolid = false;
						}
						else{
							collisionSolid = true;
						}
					}
				}
			}


			var point3Y = mirrors[i].standardLength * 0.5 * Math.sin(mirrors[i].angle) + mirrors[i].y;
			var point3X = mirrors[i].standardLength * 0.5 * Math.cos(mirrors[i].angle) + mirrors[i].x;

			var intersect3X = ((point3Y - perpendicularSlope * point3X) - (laserPointY - laserSlope * laserPointX)) / (laserSlope - perpendicularSlope);
			var intersect3Y = intersect3X * perpendicularSlope + point3Y - perpendicularSlope * point3X;

			if (checkDirection(laserPointX, laserPointY, intersect3X, intersect3Y, laserAngle)){
				var bound31 = mirrors[i].standardWidth * 0.5 * Math.sin(mirrors[i].angle + Math.PI / 2.0) + point3Y;
				var bound32 = -mirrors[i].standardWidth * 0.5 * Math.sin(mirrors[i].angle + Math.PI / 2.0) + point3Y;

				if (intersect3Y < Math.max(bound31, bound32) && intersect3Y > Math.min(bound31, bound32)){
					var distance3 = Math.sqrt(Math.pow(laserPointX - intersect3X, 2.0) + Math.pow(laserPointY - intersect3Y, 2.0));

					if (distance3 < minDistance){
						minDistance = distance3;
						collidesWith = i;
						collisionX = intersect3X;
						collisionY = intersect3Y;
						collisionSolid = true;
					}
				}
			}

			var point4Y = -mirrors[i].standardLength * 0.5 * Math.sin(mirrors[i].angle) + mirrors[i].y;
			var point4X = -mirrors[i].standardLength * 0.5 * Math.cos(mirrors[i].angle) + mirrors[i].x;

			var intersect4X = ((point4Y - perpendicularSlope * point4X) - (laserPointY - laserSlope * laserPointX)) / (laserSlope - perpendicularSlope);
			var intersect4Y = intersect4X * perpendicularSlope + point4Y - perpendicularSlope * point4X;

			if (checkDirection(laserPointX, laserPointY, intersect4X, intersect4Y, laserAngle)){
				var bound41 = mirrors[i].standardWidth * 0.5 * Math.sin(mirrors[i].angle + Math.PI / 2.0) + point4Y;
				var bound42 = -mirrors[i].standardWidth * 0.5 * Math.sin(mirrors[i].angle + Math.PI / 2.0) + point4Y;

				if (intersect4Y < Math.max(bound41, bound42) && intersect4Y > Math.min(bound41, bound42)){
					var distance4 = Math.sqrt(Math.pow(laserPointX - intersect4X, 2.0) + Math.pow(laserPointY - intersect4Y, 2.0));

					if (distance4 < minDistance){
						minDistance = distance4;
						collidesWith = i;
						collisionX = intersect4X;
						collisionY = intersect4Y;
						collisionSolid = true;
					}
				}
			}
		}

		var farWallY = laserSlope * ((myGameArea.canvas.width * 0.7 + 10.0) - laserPointX) + laserPointY;
		if (farWallY >= 10.0 && farWallY <= myGameArea.canvas.width * 0.7 * (5.0 / 8.0) + 10.0 && checkDirection(laserPointX, laserPointY, myGameArea.canvas.width * 0.7 + 10.0, farWallY, laserAngle)){
			var farWallDistance = Math.sqrt(Math.pow(laserPointY - farWallY, 2.0) + Math.pow(laserPointX - (myGameArea.canvas.width * 0.7 + 10.0), 2.0));
			if (farWallDistance < minDistance){
				points.push([myGameArea.canvas.width * 0.7 + 10.0, farWallY]);
				break;
			}
		}

		var nearWallY = laserSlope * (10.0 - laserPointX) + laserPointY;
		if (nearWallY >= 10.0 && nearWallY <= myGameArea.canvas.width * 0.7 * (5.0 / 8.0) + 10.0 && checkDirection(laserPointX, laserPointY, 10.0, nearWallY, laserAngle) && points.length != 1){
			var nearWallDistance = Math.sqrt(Math.pow(laserPointY - nearWallY, 2.0) + Math.pow(laserPointX - 10.0, 2.0));
			if (nearWallDistance < minDistance){
				points.push([10.0, nearWallY]);
				break;
			}		
		}

		var topWallX = (10 - laserPointY) / laserSlope + laserPointX;
		if (topWallX >= 0.0 && topWallX <= myGameArea.canvas.width * 0.7 + 10.0 && checkDirection(laserPointX, laserPointY, topWallX, 10.0, laserAngle)){
			var topWallDistance = Math.sqrt(Math.pow(laserPointY - 10.0, 2.0) + Math.pow(laserPointX - topWallX, 2.0));
			if (topWallDistance < minDistance){
				points.push([topWallX, 10.0]);
				break;
			}	
		}

		var bottomWallX = ((myGameArea.canvas.width * 0.7 * (5.0 / 8.0) + 10.0) - laserPointY) / laserSlope + laserPointX;
		if (bottomWallX >= 0.0 && bottomWallX <= myGameArea.canvas.width * 0.7 + 10.0 && checkDirection(laserPointX, laserPointY, bottomWallX, myGameArea.canvas.width * 0.7 * (5.0 / 8.0) + 10.0, laserAngle)){
			var bottomWallDistance = Math.sqrt(Math.pow(laserPointY - (myGameArea.canvas.width * 0.7 * (5.0 / 8.0) + 10.0), 2.0) + Math.pow(laserPointX - bottomWallX, 2.0));
			if (bottomWallDistance < minDistance){
				points.push([bottomWallX, myGameArea.canvas.width * 0.7 * (5.0 / 8.0) + 10.0]);
				break;
			}	
		}
		points.push([collisionX, collisionY]);

		if (collisionSolid){
			break;
		}

		var finalAngle;
		if (laserAngle > Math.PI / 2.0 && laserAngle <= Math.PI * (3.0 / 2.0)){
			finalAngle = normalizeAngle360(Math.PI - Math.atan(Math.tan(laserAngle)) + 2.0 * Math.atan(Math.tan(mirrors[collidesWith].angle)));
		}
		else{
			finalAngle = normalizeAngle360(-Math.atan(Math.tan(laserAngle)) + 2.0 * Math.atan(Math.tan(mirrors[collidesWith].angle)));
		}
		var loop = false;

		for (var i = 0; i < points.length; i++){
			if (points[i][0] == collisionX && points[i][1] == collisionY && angles[i] == finalAngle){
				loop = true;
				break;
			}
		}
		if (loop == true){
			break;
		}

		var alreadyHit = false;
		if (mirrors[collidesWith].numMirrors == 1 || mirrors[collidesWith].numMirrors == 2){
			for (var i = 0; i < lastMirrors.length; i++){
				if (collidesWith == lastMirrors[i]){
					alreadyHit = true;
					break;
				}
			}
			if (alreadyHit == false){
				score += 4.0;
			}
		}
		if (mirrors[collidesWith].numMirrors == -1){
			for (var i = 0; i < lastMirrors.length; i++){
				if (collidesWith == lastMirrors[i]){
					alreadyHit = true;
					break;
				}
			}
			if (alreadyHit == false){
				score += 5.0;
			}
		}

		angles.push(finalAngle);
		lastMirrors.push(collidesWith);
	}
}

function normalizeAngle360(angle){
	var normalized = angle % (Math.PI * 2.0);
	if (normalized < 0){
		normalized = Math.PI * 2.0 - Math.abs(normalized);
	}
	return normalized;
}
function normalizeAngle180(angle){
	var normalized = angle % Math.PI;
	if (normalized < 0){
		normalized = Math.PI - Math.abs(normalized);
	}
	return normalized;
}

function checkDirection(x1, y1, x2, y2, angle){
	var dist = Math.sqrt(Math.pow(x1 - x2, 2.0) + Math.pow(y1 - y2, 2.0));
	var x3 = dist * Math.cos(angle) + x1;
	var y3 = dist * Math.sin(angle) + y1;
	if (Math.abs(x3 - x2) <= 0.1 && Math.abs(y3 - y2) <= 0.1){
		return true;
	}
	return false;
}

function setGrid(){
	for (var i = 1; i < 56.0; i++){
		myGameArea.context.beginPath();
		myGameArea.context.lineWidth = "1";
		myGameArea.context.strokeStyle = "grey";
		myGameArea.context.moveTo((10 + myGameArea.canvas.width * 0.7) * (i / 56.0), 10.0);
		myGameArea.context.lineTo((10 + myGameArea.canvas.width * 0.7) * (i / 56.0), 10 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0));
		myGameArea.context.stroke();
	}

	for (var i = 1; i < 35.0; i++){
		myGameArea.context.beginPath();
		myGameArea.context.lineWidth = "1";
		myGameArea.context.strokeStyle = "grey";
		myGameArea.context.moveTo(10.0, (10 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0)) * (i / 35.0));
		myGameArea.context.lineTo(10 + myGameArea.canvas.width * 0.7, (10 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0)) * (i / 35.0));
		myGameArea.context.stroke();
	}
}

function updateGameArea() {
    myGameArea.clear();
    score = 0.0;
    keyActions();

    myGameArea.canvas.width = window.innerWidth * 0.7;
    myGameArea.canvas.height = window.innerHeight * 0.7;

    myGameArea.context.beginPath();
	myGameArea.context.lineWidth = "4";
	myGameArea.context.strokeStyle = "black";
	myGameArea.context.rect(10, 10, myGameArea.canvas.width * 0.7, myGameArea.canvas.width * 0.7 * (5.0 / 8.0));
	myGameArea.context.stroke();

	myGameArea.context.beginPath();
	myGameArea.context.lineWidth = "1";
	myGameArea.context.strokeStyle = "grey";
	myGameArea.context.moveTo(10, 10 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0) * 0.5);
	myGameArea.context.lineTo(10 + myGameArea.canvas.width * 0.7, 10 + myGameArea.canvas.width * 0.7 * (5.0 / 8.0) * 0.5);
	myGameArea.context.stroke();

	if (showGrid){
		setGrid();
	}

	calculatePoints();

	myGameArea.context.beginPath();
	myGameArea.context.lineWidth = "4";
	myGameArea.context.strokeStyle = "red";
	myGameArea.context.moveTo(points[0][0], points[0][1]);
	for (var i = 1; i < points.length; i++){
		myGameArea.context.lineTo(points[i][0], points[i][1]);
	}
	myGameArea.context.stroke();

	for (var i = 0; i < mirrors.length; i++){
		mirrors[i].update();
	}

	pointer.update();
	finalizeScore();
	scoreLabel.innerText = "Score: " + String(Math.round(score * 10.0) / 10.0);
}

var interval = false;
var paused = false;
var time;
var start;

function startTimer() {
	if (!interval) {
		start = paused ? Date.now() - time : Date.now();
		interval = setInterval(function() {
			time = start-Date.now()+240000;
			if (time > 0) {
				timer.innerHTML = "Time: "+String(Math.floor(time/60000))+":"+(time/1000%60).toFixed(3).padStart(6, "0")
			} else {
				clearInterval(interval);
				interval = null;
			}
		},1);
	}
}

function pauseTimer() {
	if (interval) {
		time = Date.now()-start;
		paused = true;
		clearInterval(interval);
		interval = null;
	}
}

function stopTimer() {
	if (interval || paused) {
		clearInterval(interval);
		interval = null;
		timer.innerHTML = "Time: 4:00.000";
		paused = false;
	}
}

function updateCode() {
	code = "";
	for (var i = 5; i < 8; i++){
		code += mirrors[i].x/myGameArea.canvas.width+";"+mirrors[i].y/myGameArea.canvas.width+";"+mirrors[i].angle+";";
	}
	codeBox.value = code + pointer.gety();
}

function copyCode() {
	navigator.clipboard.writeText(codeBox.value)
}

function setCode() {
	var m;
	var n;
	code = codeBox.value.split(";");
	if (code.length < 10 || !/^[\d;\.]+$/.test(codeBox.value)) {alert("invalid code!");return}
	for (var i = 0; i < 9; i++) {
		m = mirrors[5+~~(i/3)]
		n = parseFloat(code[i])
		switch (i % 3) {
			case 0: m.x = n*myGameArea.canvas.width
			case 1: m.y = n*myGameArea.canvas.width
			case 2: m.angle = n
		}
	}
	pointer.sety(code[9]);
}
