import * as THREE from 'three';

class PlayerTimers {
	constructor() {
		this.playerATimeTotal = 0;
		this.playerBTimeTotal = 0;
		
		this.currentPlayer = "a";
		this.timerRunning = false;
		this.turnStartTime = false;
	}

	resetTimes() {
		this.playerATimeTotal = 0;
		this.playerBTimeTotal = 0;
		
		this.currentPlayer = "a";
		this.timerRunning = false;
		this.turnStartTime = false;
	}

	getPlayerTime(player) {
		let elapsedTime = this.timerRunning ? new Date() - this.turnStartTime : 0;
		return this.currentPlayer == player ? this.getPlayerTimeTotal(player) + elapsedTime : this.getPlayerTimeTotal(player);
	}

	getPlayerTimeTotal(player) {
		switch (player) {
			case "a":
				return this.playerATimeTotal;
			case "b":
				return this.playerBTimeTotal;
		}
	}

	setPlayerTimeTotal(player) {
		let elapsedTime = this.turnStartTime ? new Date() - this.turnStartTime : 0;
		switch (player) {
			case "a":
				this.playerATimeTotal += elapsedTime;
				break;
			case "b":
				this.playerBTimeTotal += elapsedTime;
				break;
		}
	}

	startTimer() {
		this.timerRunning = true;
		this.turnStartTime = new Date();
	}

	pauseTimer() {
		this.timerRunning = false;
		this.turnStartTime = false;
	}

	switchTurn(player) {
		this.setPlayerTimeTotal(this.currentPlayer);

		if (this.currentPlayer == player && this.timerRunning) {
			this.pauseTimer();
		} else {
			this.currentPlayer = player;
			this.startTimer();
		}
	}
}

class UICanvasObject {
	constructor(timeDisplay, playerTimers) {
		this.playerTimers = playerTimers;

		this.canvas = document.getElementById("uiCanvas");
		this.ctx = this.canvas.getContext("2d");

		this.timeDisplay = timeDisplay;

		this.iconSize = 60;
		this.padding = this.iconSize / 4;
		this.opacity = 1;
		
		this.refreshBtn = new Image(this.iconSize, this.iconSize),
		this.playBtn = new Image(this.iconSize, this.iconSize),
		this.pauseBtn = new Image(this.iconSize, this.iconSize),
		this.fullscreenBtn = new Image(this.iconSize, this.iconSize);

		this.playerAButton = this.playBtn;
		this.playerBButton = this.playBtn;

		this.playerAButtonCoords = [0, 0, 0, 0];
		this.playerBButtonCoords = [0, 0, 0, 0];
		this.fullscreenButtonCoords = [0, 0, 0, 0];
		this.refreshButtonCoords = [0, 0, 0, 0];

		this.refreshBtn.src = "assets/refresh.png";
		this.playBtn.src = "assets/play.png";
		this.pauseBtn.src = "assets/pause.png";
		this.fullscreenBtn.src = "assets/fullscreen.png";

		this.playBtn.onload = () => {
			this.draw()
		};
		this.fullscreenBtn.onload = () => {
			this.draw()
		};
		this.refreshBtn.onload = () => {
			this.draw()
		};

		this.setCanvasDimensions();
		this.draw();

		window.addEventListener('resize', () => {
			this.setCanvasDimensions();
			this.draw();
		}, false);

		const c = this;
		this.canvas.addEventListener('click', function(event) {
			if (c.clickInBox(event.clientX, event.clientY, c.playerAButtonCoords)) {
				playerTimers.switchTurn("a");
				c.draw();
			}
			if (c.clickInBox(event.clientX, event.clientY, c.playerBButtonCoords)) {
				playerTimers.switchTurn("b");
				c.draw();
			}
			if (c.clickInBox(event.clientX, event.clientY, c.fullscreenButtonCoords)) {
				if (!document.fullscreenElement) {
					document.body.requestFullscreen().catch((err) => {
						console.log(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
					});
				} else {
					document.exitFullscreen();
				}
			}
			if (c.clickInBox(event.clientX, event.clientY, c.refreshButtonCoords)) {
				playerTimers.resetTimes();
				c.draw();
			}

			// handle click on coin
			if (!cylinder.disableClick) {
				mouse.x = (event.clientX / window.visualViewport.width) * 2 - 1;
				mouse.y = -(event.clientY / window.visualViewport.height) * 2 + 1;
				raycaster.setFromCamera(mouse, camera);
			
				if (raycaster.intersectObjects(scene.children).length > 0) {
					cylinder.disableClick = true;
					clearTimeout(timeDisplay.fadeInTimeout);
					uiDisplay.fadeOut();
					timeDisplay.fadeOut();
					flipCoin(camera, cylinder, true);
				}
			}
		});
	}

	clickInBox(x, y, box) {
		const
			xMin = box[0],
			xMax = box[0] + box[2],
			yMin = box[1],
			yMax = box[1] + box[3];
		return (x >= xMin && x <= xMax && y >= yMin && y <= yMax);
	}

	draw() {
		if (!this.timeDisplay.fontReady) {
			setTimeout(() => {
				this.draw();
			}, 500);
		}
		this.ctx.shadowColor = `rgba(0, 0, 0, 0.7)`;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.shadowBlur = 10;

		if (this.playerTimers.timerRunning) {
			if (this.playerTimers.currentPlayer == "a") {
				this.playerAButton = this.pauseBtn;
				this.playerBButton = this.playBtn;
			} else {
				this.playerAButton = this.playBtn;
				this.playerBButton = this.pauseBtn;
			}
		} else {
			this.playerAButton = this.playBtn;
			this.playerBButton = this.playBtn;
		}

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.globalAlpha = this.opacity;

		if (window.visualViewport.width < window.visualViewport.height) {
			// pA coords
			this.playerAButtonCoords = [
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- (this.iconSize)
					- this.padding,
				(this.iconSize)
					- (this.padding * 2),
				this.iconSize, this.iconSize
			];
			
			// pB coords
			this.playerBButtonCoords = [
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- (this.iconSize)
					- this.padding,
				(this.canvas.height)
					- (this.iconSize)
					- (this.padding * 2),
				this.iconSize, this.iconSize
			];
			
			// pA button
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 180);

			this.ctx.drawImage(
				this.playerAButton,
				-(this.canvas.width / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding, 
				-(this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.restore();

			// pB button
			this.ctx.drawImage(
				this.playerBButton,
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- (this.iconSize)
					- this.padding,
				(this.canvas.height)
					- (this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.drawImage(
				this.fullscreenBtn,
				this.canvas.width - (this.iconSize * 1.5),
				(this.canvas.height / 2) - 
					(this.timeDisplay.renderedTextMetrics.width / 2) -
					(this.timeDisplay.renderedSubTextMetrics.width) -
					(this.padding * 2) -
					this.iconSize,
				this.iconSize, this.iconSize
			);
			this.fullscreenButtonCoords = [
				this.canvas.width - (this.iconSize * 1.5),
				(this.canvas.height / 2) - 
					(this.timeDisplay.renderedTextMetrics.width / 2) -
					(this.timeDisplay.renderedSubTextMetrics.width) -
					(this.padding * 2) -
					this.iconSize,
				this.iconSize, this.iconSize
			];

			this.ctx.drawImage(
				this.refreshBtn,
				this.canvas.width - (this.iconSize * 1.5),
				(this.canvas.height / 2) +
					(this.timeDisplay.renderedTextMetrics.width / 2) +
					(this.timeDisplay.renderedSubTextMetrics.width) +
					(this.padding * 2) -
					this.iconSize,
				this.iconSize, this.iconSize
			);
			this.refreshButtonCoords = [
				this.canvas.width - (this.iconSize * 1.5),
				(this.canvas.height / 2) +
					(this.timeDisplay.renderedTextMetrics.width / 2) +
					(this.timeDisplay.renderedSubTextMetrics.width) +
					(this.padding * 2) -
					this.iconSize,
				this.iconSize, this.iconSize
			];
		} else {
			// pA coords
			this.playerAButtonCoords = [
				(this.iconSize / 2),
				(this.canvas.height / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding,
				this.iconSize, this.iconSize
			];
			
			// pB coords
			this.playerBButtonCoords = [
				this.canvas.width - (this.iconSize * 1.5),
				(this.canvas.height / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding,
				this.iconSize, this.iconSize
			];

			// pA button
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);
			
			this.ctx.drawImage(
				this.playerAButton,
				(this.canvas.height / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding, 
				-(this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.restore();

			// pB button
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * -90);
			this.ctx.drawImage(
				this.playerBButton,
				-(this.canvas.height / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- this.iconSize
					- this.padding, 
				this.canvas.width - (this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.restore();
			
			this.ctx.drawImage(
				this.refreshBtn,
				(this.canvas.width / 2)
					+ (this.timeDisplay.renderedTextMetrics.width / 2)
					+ (this.timeDisplay.renderedSubTextMetrics.width)
					+ (this.padding * 2),
				(this.iconSize / 2),
				this.iconSize, this.iconSize
			);
			this.refreshButtonCoords = [
				(this.canvas.width / 2)
					+ (this.timeDisplay.renderedTextMetrics.width / 2)
					+ (this.timeDisplay.renderedSubTextMetrics.width)
					+ (this.padding * 2),
				(this.iconSize / 2),
				this.iconSize, this.iconSize
			];

			this.ctx.drawImage(
				this.fullscreenBtn,
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedTextMetrics.width / 2)
					- (this.timeDisplay.renderedSubTextMetrics.width)
					- (this.padding * 2),
				(this.iconSize / 2),
				this.iconSize, this.iconSize
			);
			this.fullscreenButtonCoords = [
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedTextMetrics.width / 2)
					- (this.timeDisplay.renderedSubTextMetrics.width)
					- (this.padding * 2),
				(this.iconSize / 2),
				this.iconSize, this.iconSize
			];
		}
	}

	setCanvasDimensions() {
		this.canvas.width = window.visualViewport.width;
		this.canvas.height = window.visualViewport.height;
	}

	fadeOut() {
		this.fadingOut = true;
		if (this.opacity > 0) {
			this.opacity -= 0.06;
			window.requestAnimationFrame(() => {
				this.fadeOut();
				this.draw();
			});
		} else {
			this.opacity = 0;
			this.fadingOut = false;
		}
	}

	fadeIn() {
		if (!this.fadingOut && this.opacity < 1) {
			this.opacity += 0.025;
			window.requestAnimationFrame(() => {
				this.fadeIn();
				this.draw();
			});
		}
	}
}

class TimeCanvasObject {
	constructor(playerTimers) {
		this.playerTimers = playerTimers;

		this.canvas = document.getElementById("timeCanvas");
		this.ctx = this.canvas.getContext("2d");
		
		this.fontReady = document.fonts.check("1em Wellfleet");
		if (this.fontReady) {
			this.fontCheck();
		}

		this.opacity = 1;

		this.setCanvasDimensions();
		this.draw();

		window.addEventListener('resize', () => {
			this.setCanvasDimensions();
			this.draw();
		}, false);
	}

	formatPlayerTime(date) {
		let hours = date.getUTCHours();
		const minutes = date.getUTCMinutes();
		const seconds = date.getUTCSeconds();
		const strHours = hours < 10 ? '0' + hours : hours;
		const strMinutes = minutes < 10 ? '0' + minutes : minutes;
		const strSeconds = seconds < 10 ? '0' + seconds : seconds;

		return `${strHours}:${strMinutes}:${strSeconds}`;
	}

	formatTime(date, showSeconds=false) {
		let hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		const ampm = hours >= 12 ? 'PM' : 'AM';
	
		hours = hours % 12;
		hours = hours ? hours : 12;
		const strHours = hours < 10 ? '0' + hours : hours;
		const strMinutes = minutes < 10 ? '0' + minutes : minutes;
		const strSeconds = seconds < 10 ? '0' + seconds : seconds;

		let result = `${strHours}:${strMinutes}`;

		if (showSeconds) {
			result = `${strHours}:${strMinutes}:${strSeconds}`;
		}
		return {	
			time: result,
			ampm: ampm
		};
	}

	fontCheck() {
		const formattedTime = this.formatTime(new Date());
		this.fontSize = 80;
		this.ctx.font = this.fontSize + "px Wellfleet";
		this.renderedTextMetrics = this.ctx.measureText(formattedTime.time);
		this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
		this.renderedSubTextMetrics = this.ctx.measureText(formattedTime.ampm);
		this.ctx.font = (this.playerClockFontSize) + "px Wellfleet";
		this.renderedPlayerClockTextMetrics = this.ctx.measureText("00:00:00");

		this.fontReady = document.fonts.check("1em Wellfleet");
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const formattedTime = this.formatTime(new Date());

		this.fontSize = 80;
		this.playerClockFontSize = this.fontSize / 1.5;
		this.ctx.font = this.fontSize + "px Wellfleet";
		this.ctx.textAlign = "left";
		this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
		this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.7})`;
		this.ctx.shadowOffsetX = 4;
		this.ctx.shadowOffsetY = 4;
		this.ctx.shadowBlur = 5;

		if (!this.fontReady) {
			this.fontCheck();
		}

		const pATime = this.formatPlayerTime(new Date(this.playerTimers.getPlayerTime("a")));
		const pBTime = this.formatPlayerTime(new Date(this.playerTimers.getPlayerTime("b")));

		if (window.visualViewport.width < window.visualViewport.height) {
			// main clock
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);

			this.ctx.fillText(
				formattedTime.time,
				(this.canvas.height / 2) - (this.renderedTextMetrics.width / 2) - this.renderedSubTextMetrics.width, 
				(-1 * this.canvas.width) + 96
			);

			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			this.ctx.fillText(
				formattedTime.ampm,
				(this.canvas.height / 2) + (this.renderedTextMetrics.width / 2) - this.renderedSubTextMetrics.width + 8,
				(-1 * this.canvas.width) + 96
			);
	
			this.ctx.restore();

			// pA clock
			this.ctx.font = (this.playerClockFontSize) + "px Wellfleet";
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 180);
			
			this.ctx.fillText(
				pATime,
				-(this.canvas.width / 2) - (this.renderedPlayerClockTextMetrics.width / 2), 
				-(this.playerClockFontSize / 1.5)
			);
	
			this.ctx.restore();

			// pB clock
			this.ctx.fillText(
				pBTime,
				(this.canvas.width / 2) - (this.renderedPlayerClockTextMetrics.width / 2), 
				this.canvas.height - (this.playerClockFontSize / 1.5)
			);
		} else {
			// main clock
			this.ctx.fillText(formattedTime.time, (this.canvas.width / 2) - (this.renderedTextMetrics.width / 2), 96);

			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			this.ctx.fillText(formattedTime.ampm, (this.canvas.width / 2) + (this.renderedTextMetrics.width / 2) + 8, 96);

			// pA clock
			this.ctx.font = (this.playerClockFontSize) + "px Wellfleet";
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);
			
			this.ctx.fillText(
				pATime,
				(this.canvas.height / 2) - (this.renderedPlayerClockTextMetrics.width / 2), 
				-(this.playerClockFontSize / 1.5)
			);

			this.ctx.restore();

			// pB clock
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * -90);	
			
			this.ctx.fillText(
				pBTime,
				-(this.canvas.height / 2) - (this.renderedPlayerClockTextMetrics.width / 2), 
				this.canvas.width - (this.playerClockFontSize / 1.5)
			);
			this.ctx.restore();
		}

		setTimeout(() => {
			window.requestAnimationFrame(() => {
				this.draw();
			});
		}, 500);
	}

	setCanvasDimensions() {
		this.canvas.width = window.visualViewport.width;
		this.canvas.height = window.visualViewport.height;
	}

	fadeOut() {
		this.fadingOut = true;
		if (this.opacity > 0) {
			this.opacity -= 0.06;
			window.requestAnimationFrame(() => {
				this.fadeOut();
				this.draw();
			});
		} else {
			this.opacity = 0;
			this.fadingOut = false;
		}
	}

	fadeIn() {
		if (!this.fadingOut && this.opacity < 1) {
			this.opacity += 0.025;
			window.requestAnimationFrame(() => {
				this.fadeIn();
				this.draw();
			});
		}
	}
}

class StatusCanvasObject {
	constructor() {
		this.canvas = document.getElementById("statusCanvas");
		this.ctx = this.canvas.getContext("2d");
		this.setCanvasDimensions();

		this.fontSize = 96;
		this.opacity = 1;
		this.position = 0;
		this.displayedTime = false;
		this.finished = false;

		window.addEventListener('resize', () => {
			this.setCanvasDimensions();
		}, false);
	}

	drawStatus(text) {
		this.text = text;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.opacity = this.position / (this.fontSize + 16);
		this.ctx.font = this.fontSize + "px Wellfleet";
		this.ctx.textAlign = "center";
		this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
		this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.7})`;
		this.ctx.shadowOffsetX = 4;
		this.ctx.shadowOffsetY = 4;
		this.ctx.shadowBlur = 5;

		if (this.displayedTime && new Date() - this.displayedTime > 1250) {
			this.position = this.position - 3;
			if (this.position < -(this.fontSize + 16)) {
				this.finished = true;
			}
		} else if (!this.displayedTime) {
			this.position = this.position + 7;
			if (this.position > this.fontSize + 16) {
				this.displayedTime = new Date();
			}
		}

		if (!this.finished) {
			if (window.visualViewport.width < window.visualViewport.height) {
				this.ctx.save();
				this.ctx.rotate((Math.PI / 180) * 90);
	
				this.ctx.fillText(this.text,
					(this.canvas.height / 2), 
					(-1 * this.canvas.width) + this.position
				);

				this.ctx.restore();
			} else {
				this.ctx.fillText(this.text, this.canvas.width / 2, this.position);
			}

			window.requestAnimationFrame(() => {
				this.drawStatus(this.text);
			});
		} else {
			this.fontSize = 96;
			this.opacity = 1;
			this.position = 0;
			this.displayedTime = false;
			this.finished = false;
		}
	}

	setCanvasDimensions() {
		this.canvas.width = window.visualViewport.width;
		this.canvas.height = window.visualViewport.height;
	}
}

function setTextures() {
	cylinder.material = [
		// side
		new THREE.MeshBasicMaterial(
			{
				color: 0x71520a
			}
		),
		// top
		new THREE.MeshBasicMaterial(
			{
				map: textureTop
			}
		),
		// bottom
		new THREE.MeshBasicMaterial(
			{
				map: textureBottom
			}
		)
	];

	scene.add(cylinder);
	renderer.render(scene, camera);
}

function flipCoin(camera, cylinder, doAnimation) {
	camera.position.y = 0;
	camera.position.z = 6;
	cylinder.rotation.x = BASE_ROTATION;
	cylinder.rotation.y = Math.PI / 2;
	
	cylinder.rotation.z = 0;
	
	cylinder.flipAnimating = true;
	cylinder.flipFinished = false;
	cylinder.rotations = 0;
	cylinder.zoomAnimating = true;
	cylinder.zoomFinished = false;

	if (doAnimation) {
		if (Math.random() > 0.5) {
			cylinder.rotation.y = (Math.PI / 2) + Math.random();
		} else {
			cylinder.rotation.y = (Math.PI / 2) - Math.random();
		}

		if (Math.random() > 0.5) {
			cylinder.result = "Heads!";
			cylinder.rotation.z = 0;
		} else {
			cylinder.result = "Tails!";
			cylinder.rotation.z = Math.PI;
		}
		animate();
	}
}

function zoomCamera() {
	if (!cylinder.zoomFinished) {
		requestAnimationFrame(zoomCamera);
		renderer.render(scene, camera);
	} else {
		renderer.render(scene, camera);
		cylinder.disableClick = false;
	}

	let targetCameraZ = 2;
	let targetRotationX = Math.PI / 2;

	if (cylinder.zoomAnimating) {
		if (cylinder.rotation.x.toFixed(1) != targetRotationX.toFixed(1)) {
			cylinder.rotation.x += 0.05;
		}
		if (camera.position.z.toFixed(1) != targetCameraZ.toFixed(1)) {
			camera.position.z -= 0.11;
		}

		if (cylinder.rotation.y.toFixed(1) > (Math.PI / 2).toFixed(1)) {
			cylinder.rotation.y -= 0.03;
		} else if (cylinder.rotation.y.toFixed(1) < (Math.PI / 2).toFixed(1)) {
			cylinder.rotation.y += 0.03;
		}

		if (cylinder.rotation.x.toFixed(1) == targetRotationX.toFixed(1) 
			&& camera.position.z.toFixed(1) == targetCameraZ.toFixed(1)) {
			cylinder.zoomAnimating = false;
			cylinder.zoomFinishedTime = new Date();
		}
	} else {
		if ((new Date() - cylinder.zoomFinishedTime) > 1000) {
			if (cylinder.rotation.x.toFixed(1) != BASE_ROTATION.toFixed(1)) {
				cylinder.rotation.x -= 0.025;
			}
			if (camera.position.z.toFixed(1) != (6).toFixed(1)) {
				camera.position.z += 0.1;
			}
			if (cylinder.rotation.y.toFixed(2) > (Math.PI / 2).toFixed(2)) {
				cylinder.rotation.y -= 0.01;
			} else if (cylinder.rotation.y.toFixed(2) < (Math.PI / 2).toFixed(2)) {
				cylinder.rotation.y += 0.01;
			}
	
			if (cylinder.rotation.x.toFixed(1) == BASE_ROTATION.toFixed(1)
				&& camera.position.z.toFixed(1) == (6).toFixed(1)
				&& cylinder.rotation.y.toFixed(1) == (Math.PI / 2).toFixed(1)) {
				cylinder.zoomFinished = true;
			}
		}
	}

}

function animate() {
	if (!cylinder.flipFinished) {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	} else {
		renderer.render(scene, camera);

		setTimeout(zoomCamera, 500);
		setTimeout(() => {
			statusDisplay.drawStatus(cylinder.result);
		}, 700);

		timeDisplay.fadeInTimeout = setTimeout(() => {
			timeDisplay.canFadeIn = true;
			timeDisplay.fadeIn();
		}, 3000);

		uiDisplay.fadeInTimeout = setTimeout(() => {
			uiDisplay.canFadeIn = true;
			uiDisplay.fadeIn();
		}, 3000);
	}

	if (cylinder.flipAnimating) {
		if (camera.position.y > -4) {
			cylinder.rotations += 1;
			cylinder.rotation.x += BASE_ROTATION;
			if (cylinder.rotation.x > BASE_ROTATION * 8) {
				cylinder.rotation.x = BASE_ROTATION;
			}

			cylinder.rotation.z += 0.003;

			camera.position.y -= 0.07;
			camera.position.z -= 0.07;
		} else {
			cylinder.flipAnimating = false;
			cylinder.rotation.x = -((BASE_ROTATION * (cylinder.rotations - 2)) / 4);
		}
	} else {
		if (camera.position.y < 0) {
			cylinder.rotation.x += BASE_ROTATION / 4;

			cylinder.rotation.z -= 0.003;
			camera.position.y += 0.07;
			camera.position.z += 0.07;
			cylinder.rotations += 1;
		} else {
			if (cylinder.rotation.x.toFixed(1) != BASE_ROTATION.toFixed(1)) {
				cylinder.rotation.x += 0.1;
			} else {
				cylinder.rotation.x = BASE_ROTATION;
				cylinder.flipFinished = true;
			}
		}
	}
}

function setCoinCanvasRotation() {
	if (window.visualViewport.width < window.visualViewport.height) {
		renderer.domElement.style = `
			position: fixed;
			top: 0;
			right: 0;
			z-index: 0;
			transform: rotate(90deg) translate(100%, 0);
			transform-origin: 100% 0;
		`;
		camera.aspect = window.visualViewport.height / window.visualViewport.width;
		camera.updateProjectionMatrix();
	
		renderer.setSize(window.visualViewport.height, window.visualViewport.width);
		renderer.render(scene, camera);
	} else {
		renderer.domElement.style = "position: fixed; top: 0; left: 0; z-index: 0;";
		camera.aspect = window.visualViewport.width / window.visualViewport.height;
		camera.updateProjectionMatrix();

		renderer.setSize(window.visualViewport.width, window.visualViewport.height);
		renderer.render(scene, camera);
	}
}


const playerTimers = new PlayerTimers();
const timeDisplay = new TimeCanvasObject(playerTimers);
const uiDisplay = new UICanvasObject(timeDisplay, playerTimers);
const statusDisplay = new StatusCanvasObject();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.visualViewport.width / window.visualViewport.height, 0.1, 1000);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const renderer = new THREE.WebGLRenderer(
	{
		alpha: true,
		antialias: true
	}
);

const BASE_ROTATION = (0.25 * Math.PI);
const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 48);
const cylinder = new THREE.Mesh(geometry);
const textureLoader = new THREE.TextureLoader();

let textureTop, textureBottom;

textureLoader.load('assets/circle_bottom.png',
	function(texture) {
		textureBottom = texture;
		textureBottom.colorSpace = THREE.SRGBColorSpace;

		if (textureTop && textureBottom) {
			setTextures();
		}
	}
);

textureLoader.load('assets/circle_top.png',
	function(texture) {
		textureTop = texture;
		textureTop.colorSpace = THREE.SRGBColorSpace;

		if (textureTop && textureBottom) {
			setTextures();
		}
	}
);

renderer.setClearColor(0x000000, 0);
renderer.domElement.id = "coinFlipCanvas";

cylinder.disableClick = false;
flipCoin(camera, cylinder, false);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);
setCoinCanvasRotation();

window.addEventListener('resize', function () {
	setCoinCanvasRotation();
}, false);
