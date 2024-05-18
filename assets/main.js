import * as THREE from 'three';

class PlayerData {
	constructor() {
		this.playerATimeTotal = 0;
		this.playerBTimeTotal = 0;
		this.currentTurnTotal = 0;
		this.lastTurnTime = 0;

		this.flips = {
			heads: 0,
			tails: 0,
			history: []
		}
		
		this.currentPlayer = "a";
		this.timerRunning = false;
		this.turnStartTime = false;
	}

	elapsedTime() {
		return this.timerRunning ? new Date() - this.turnStartTime : 0;
	}

	resetSession() {
		this.playerATimeTotal = 0;
		this.playerBTimeTotal = 0;
		this.currentTurnTotal = 0;
		this.lastTurnTime = 0;
		this.timerRunning = false;
		this.turnStartTime = false;

		this.flips = {
			heads: 0,
			tails: 0,
			history: []
		}
	}

	getPlayerTime(player) {
		return this.currentPlayer == player ? this.getPlayerTimeTotal(player) + this.elapsedTime() : this.getPlayerTimeTotal(player);
	}

	getPlayerTimeTotal(player) {
		switch (player) {
			case "a":
				return this.playerATimeTotal;
			case "b":
				return this.playerBTimeTotal;
		}
	}

	getCurrentTurnTotal() {
		return this.currentTurnTotal + this.elapsedTime();
	}

	setPlayerTimeTotal(player) {
		this.currentTurnTotal += this.elapsedTime();
		switch (player) {
			case "a":
				this.playerATimeTotal += this.elapsedTime();
				break;
			case "b":
				this.playerBTimeTotal += this.elapsedTime();
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

		if (this.currentPlayer == player) {
			this.timerRunning ? this.pauseTimer() : this.startTimer();
		} else {
			this.lastTurnTime = this.currentTurnTotal;
			this.currentTurnTotal = 0;
			this.currentPlayer = player;
			this.startTimer();
		}
	}
}

class UICanvasObject {
	constructor(timeDisplay, playerData) {
		this.playerData = playerData;

		this.canvas = document.getElementById("uiCanvas");
		this.ctx = this.canvas.getContext("2d");

		this.timeDisplay = timeDisplay;

		this.iconSize = ICON_SIZE;
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
				playerData.switchTurn("a");
				c.draw();
			}
			if (c.clickInBox(event.clientX, event.clientY, c.playerBButtonCoords)) {
				playerData.switchTurn("b");
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
				playerData.resetSession();
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
					clearTimeout(uiDisplay.fadeInTimeout);
					uiDisplay.fadeOut();
					timeDisplay.fadeOut();
					switch (flipCoin(camera, cylinder, true)) {
						case "Heads!":
							setTimeout(() => {
								c.playerData.flips.heads++;
								if (c.playerData.flips.history.length > 4) {
									c.playerData.flips.history.shift();
								}
								c.playerData.flips.history.push("H");
							}, 2000);
							break;
						case "Tails!":
							setTimeout(() => {
								c.playerData.flips.tails++;
								if (c.playerData.flips.history.length > 4) {
									c.playerData.flips.history.shift();
								}
								c.playerData.flips.history.push("T");
							}, 2000);
							break;
						}
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

	setShadow(button) {
		switch (button) {
			case this.playBtn:
				this.ctx.shadowColor = `rgba(0, 180, 0, 0.6)`;
				break;		
			case this.pauseBtn:
				this.ctx.shadowColor = `rgba(180, 0, 0, 0.6)`;
				break;		
			case this.refreshBtn:
				this.ctx.shadowColor = `rgba(235, 131, 52, 0.5)`;
				break;		
			case this.fullscreenBtn:
				this.ctx.shadowColor = `rgba(237, 0, 229, 0.5)`;
				break;	
		}	
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

		if (this.playerData.timerRunning) {
			if (this.playerData.currentPlayer == "a") {
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

		let buttonSizeModifier = this.timeDisplay.renderedPlayerClockTextMetrics.width + this.padding;

		if (window.visualViewport.width < window.visualViewport.height) {
			// pA coords
			this.playerAButtonCoords = [
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- (this.iconSize)
					- this.padding
					+ (this.iconSize / 2),
				0,
				this.iconSize + buttonSizeModifier, this.iconSize * 2.25
			];
			
			// pB coords
			this.playerBButtonCoords = [
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- (this.iconSize)
					- this.padding
					+ (this.iconSize / 2),
				(this.canvas.height)
					- (this.iconSize * 2.25),
				this.iconSize + buttonSizeModifier, this.iconSize * 2.25
			];
			
			// pA button
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 180);

			this.setShadow(this.playerAButton);
			this.ctx.drawImage(
				this.playerAButton,
				-(this.canvas.width / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding
					- (ICON_SIZE / 2), 
				-(this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.restore();

			// pB button
			this.ctx.save();

			this.setShadow(this.playerBButton);
			this.ctx.drawImage(
				this.playerBButton,
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- (this.iconSize)
					- this.padding
					+ (ICON_SIZE / 2),
				(this.canvas.height)
					- (this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.restore();

			this.ctx.save();
			this.setShadow(this.fullscreenBtn);
			this.fullscreenButtonCoords = [
				this.canvas.width - (this.iconSize * 1.5),
				(this.canvas.height / 2)
					- (this.timeDisplay.renderedTextMetrics.width / 2)
					- (this.timeDisplay.renderedSubTextMetrics.width /  2)
					- (this.padding * 3)
					- this.iconSize,
				this.iconSize, this.iconSize
			];
			this.ctx.drawImage(
				this.fullscreenBtn,
				...this.fullscreenButtonCoords
			);
			this.ctx.restore();

			this.ctx.save();
			this.setShadow(this.refreshBtn);
			this.refreshButtonCoords = [
				this.canvas.width - (this.iconSize * 1.5),
				(this.canvas.height / 2)
					+ (this.timeDisplay.renderedTextMetrics.width / 2)
					+ (this.timeDisplay.renderedSubTextMetrics.width / 2)
					+ (this.padding * 3),
				this.iconSize, this.iconSize
			];
			this.ctx.drawImage(
				this.refreshBtn,
				...this.refreshButtonCoords
			);
			this.ctx.restore();

			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);
			this.ctx.font = (this.iconSize / 2.5) + "px Wellfleet";
			this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
			this.ctx.textAlign = "left";
			this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.7})`;
			this.ctx.shadowOffsetX = 4;
			this.ctx.shadowOffsetY = 4;
			this.ctx.shadowBlur = 5;
			const
				textH = "Heads: ",
				textT = "Tails: ",
				textHMetrics = this.ctx.measureText(textH),
				textTMetrics = this.ctx.measureText(textT);
			
			this.ctx.fillText(
				this.playerData.flips.heads,
				(this.canvas.height / 2) + (textHMetrics.width / 2),
				-(this.iconSize)
			);
		
			this.ctx.fillText(
				this.playerData.flips.tails,
				(this.canvas.height / 2) + (textHMetrics.width / 2),
				-(this.iconSize / 2.5)
			);
			
			this.ctx.fillText(
				textH,
				(this.canvas.height / 2) - (textHMetrics.width / 2),
				-(this.iconSize)
			);
			this.ctx.fillText(
				textT,
				(this.canvas.height / 2) - textTMetrics.width + (textHMetrics.width / 2),
				-(this.iconSize / 2.5)
			);
			this.ctx.restore();
		} else {
			// pA coords
			this.playerAButtonCoords = [
				0,
				(this.canvas.height / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding
					- (this.iconSize / 2)
					- buttonSizeModifier,
				this.iconSize * 2.25, this.iconSize + buttonSizeModifier
			];
			
			// pB coords
			this.playerBButtonCoords = [
				this.canvas.width - (this.iconSize * 2.25),
				(this.canvas.height / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding
					- (ICON_SIZE / 2)
					- buttonSizeModifier,
				this.iconSize * 2.25, this.iconSize + buttonSizeModifier
			];

			// pA button
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);
			
			this.setShadow(this.playerAButton);
			this.ctx.drawImage(
				this.playerAButton,
				(this.canvas.height / 2)
					+ (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					+ this.padding
					- (ICON_SIZE / 2), 
				-(this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.restore();

			// pB button
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * -90);

			this.setShadow(this.playerBButton);
			this.ctx.drawImage(
				this.playerBButton,
				-(this.canvas.height / 2)
					- (this.timeDisplay.renderedPlayerClockTextMetrics.width / 2)
					- this.iconSize
					- this.padding
					+ (ICON_SIZE / 2), 
				this.canvas.width - (this.iconSize * 1.5),
				this.iconSize, this.iconSize
			);

			this.ctx.restore();

			this.ctx.save();
			this.setShadow(this.refreshBtn);
			this.refreshButtonCoords = [
				(this.canvas.width / 2)
					+ (this.timeDisplay.renderedTextMetrics.width / 2)
					+ (this.timeDisplay.renderedSubTextMetrics.width / 2)
					+ (this.padding * 3),
				(this.iconSize / 2),
				this.iconSize, this.iconSize
			];
			this.ctx.drawImage(
				this.refreshBtn,
				...this.refreshButtonCoords
			);
			this.ctx.restore();

			this.ctx.save();
			this.setShadow(this.fullscreenBtn);
			this.fullscreenButtonCoords = [
				(this.canvas.width / 2)
					- (this.timeDisplay.renderedTextMetrics.width / 2)
					- (this.timeDisplay.renderedSubTextMetrics.width / 2)
					- (this.padding * 3)
					- this.iconSize,
				(this.iconSize / 2),
				this.iconSize, this.iconSize
			];
			this.ctx.drawImage(
				this.fullscreenBtn,
				...this.fullscreenButtonCoords
			);
			this.ctx.restore();

			this.ctx.save();
			this.ctx.font = (this.iconSize / 2.5) + "px Wellfleet";
			this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
			this.ctx.textAlign = "left";
			this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.7})`;
			this.ctx.shadowOffsetX = 4;
			this.ctx.shadowOffsetY = 4;
			this.ctx.shadowBlur = 5;
			const
				textH = "Heads: ",
				textT = "Tails: ",
				textHMetrics = this.ctx.measureText(textH),
				textTMetrics = this.ctx.measureText(textT);
			
			this.ctx.fillText(
				this.playerData.flips.heads,
				(this.canvas.width / 2) + (textHMetrics.width / 2),
				this.canvas.height - (this.iconSize)
			);
		
			this.ctx.fillText(
				this.playerData.flips.tails,
				(this.canvas.width / 2) + (textHMetrics.width / 2),
				this.canvas.height - (this.iconSize / 2.5)
			);
			
			this.ctx.fillText(
				textH,
				(this.canvas.width / 2) - (textHMetrics.width / 2),
				this.canvas.height - (this.iconSize)
			);
			this.ctx.fillText(
				textT,
				(this.canvas.width / 2) - textTMetrics.width + (textHMetrics.width / 2),
				this.canvas.height - (this.iconSize / 2.5)
			);
			this.ctx.restore();
		}

		// this.ctx.fillRect(...this.playerAButtonCoords);
		// this.ctx.fillRect(...this.playerBButtonCoords);
		// this.ctx.fillRect(...this.fullscreenButtonCoords);
		// this.ctx.fillRect(...this.refreshButtonCoords);
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
			if (this.opacity > 1) {
				this.opacity = 1;
			}
			window.requestAnimationFrame(() => {
				this.fadeIn();
				this.draw();
			});
		}
	}
}

class TimeCanvasObject {
	constructor(playerData) {
		this.playerData = playerData;

		this.canvas = document.getElementById("timeCanvas");
		this.ctx = this.canvas.getContext("2d");

		this.opacity = 1;
		this.fontSize = 80;
		this.playerClockFontSize = this.fontSize / 1.5;
		this.playerClockSubTextColor = "180, 180, 180";
		this.glowLoop = 0;
		
		this.fontReady = document.fonts.check("1em Wellfleet");
		if (this.fontReady) {
			this.fontCheck();
		}

		this.setCanvasDimensions();
		this.draw();

		setInterval(() => {
			window.requestAnimationFrame(() => {
				this.draw();
			});
		}, 100);

		window.addEventListener('resize', () => {
			this.setCanvasDimensions();
			this.draw();
		}, false);
	}

	formatPlayerTime(date) {
		const hours = date.getUTCHours();
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
		this.ctx.font = this.fontSize + "px Wellfleet";
		this.renderedTextMetrics = this.ctx.measureText(formattedTime.time);
		this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
		this.renderedSubTextMetrics = this.ctx.measureText(formattedTime.ampm);
		this.ctx.font = (this.playerClockFontSize) + "px Wellfleet";
		this.renderedPlayerClockTextMetrics = this.ctx.measureText("00:00:00");
		this.ctx.font = (this.fontSize / 2.25) + "px Wellfleet";
		this.renderedPlayerClockSubTextMetrics = this.ctx.measureText("00:00:00");

		this.fontReady = document.fonts.check("1em Wellfleet");
	}

	drawBackground(shadowOffsetX, shadowOffsetY, shadowBlur, fillRect) {
		this.ctx.save();

		if (this.playerData.getCurrentTurnTotal() > 120000) {
			this.glowLoop += this.glowLoop < 255 ? 4 : 0;
			this.ctx.shadowColor = `rgba(${this.glowLoop}, ${255 - this.glowLoop}, 255, ${this.opacity})`;
		} else {
			this.ctx.shadowColor = `rgba(0, 255, 255, ${this.opacity})`;
			this.glowLoop = 0;
		}

		this.ctx.shadowOffsetX = shadowOffsetX;
		this.ctx.shadowOffsetY = shadowOffsetY;
		this.ctx.shadowBlur = shadowBlur;
		this.ctx.fillRect(...fillRect);
		this.ctx.restore();
	}

	draw() {
		if (!this.fontReady) {
			this.fontCheck();
		}

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const formattedTime = this.formatTime(new Date());

		this.ctx.font = this.fontSize + "px Wellfleet";
		this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
		this.ctx.textAlign = "left";
		this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.7})`;
		this.ctx.shadowOffsetX = 4;
		this.ctx.shadowOffsetY = 4;
		this.ctx.shadowBlur = 5;

		const pATime = this.formatPlayerTime(new Date(this.playerData.getPlayerTime("a")));
		const pBTime = this.formatPlayerTime(new Date(this.playerData.getPlayerTime("b")));
		const pLastTurnTime = this.formatPlayerTime(new Date(this.playerData.lastTurnTime));
		const cTurnTime = this.formatPlayerTime(new Date(this.playerData.getCurrentTurnTotal()));

		if (window.visualViewport.width < window.visualViewport.height) {
			// main clock
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);

			this.ctx.fillText(
				formattedTime.time,
				(this.canvas.height / 2)
					- (this.renderedTextMetrics.width / 2)
					- (this.renderedSubTextMetrics.width / 2)
					- 8, 
				-(this.canvas.width) + 96
			);

			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			this.ctx.fillText(
				formattedTime.ampm,
				(this.canvas.height / 2)
					+ (this.renderedTextMetrics.width / 2)
					- (this.renderedSubTextMetrics.width / 2),
				-(this.canvas.width) + 96
			);
	
			this.ctx.restore();

			this.ctx.font = (this.playerClockFontSize) + "px Wellfleet";
			// pA clock
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 180);

			if (this.playerData.currentPlayer == "a") {
				this.drawBackground(0, 100, this.canvas.height, [-(this.canvas.width), 0, this.canvas.width, 100]);
			} else {
				this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity / 2})`;
			}

			this.ctx.fillText(
				this.playerData.currentPlayer == "a" ? cTurnTime : pLastTurnTime,
				-(this.canvas.width / 2) - (this.renderedPlayerClockTextMetrics.width / 2) - (ICON_SIZE / 2), 
				-(this.playerClockFontSize / 1.5)
			);
			
			this.ctx.font = (this.fontSize / 2.25) + "px Wellfleet";
			this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity})`;
			this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.4})`;
			this.ctx.fillText(
				pATime,
				-(this.canvas.width / 2) - (this.renderedPlayerClockSubTextMetrics.width / 2) - (ICON_SIZE / 2), 
				-(this.playerClockFontSize * 1.75)
			);
	
			this.ctx.restore();

			// pB clock
			this.ctx.save();
			if (this.playerData.currentPlayer == "b") {
				this.drawBackground(0, -100, this.canvas.height, [0, this.canvas.height, this.canvas.width, 100]);
			} else {
				this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity / 2})`;
			}
			this.ctx.fillText(
				this.playerData.currentPlayer == "b" ? cTurnTime : pLastTurnTime,
				(this.canvas.width / 2) - (this.renderedPlayerClockTextMetrics.width / 2) + (ICON_SIZE / 2), 
				this.canvas.height - (this.playerClockFontSize / 1.5)
			);
			this.ctx.font = (this.fontSize / 2.25) + "px Wellfleet";
			this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity})`;
			this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.4})`;
			this.ctx.fillText(
				pBTime,
				(this.canvas.width / 2) - (this.renderedPlayerClockSubTextMetrics.width / 2) + (ICON_SIZE / 2), 
				this.canvas.height - (this.playerClockFontSize * 1.75)
			);
			this.ctx.restore();
		} else {
			// main clock
			this.ctx.fillText(
				formattedTime.time,
				(this.canvas.width / 2)
					- (this.renderedTextMetrics.width / 2)
					- (this.renderedSubTextMetrics.width / 2)
					- 8,
				96
			);

			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			this.ctx.fillText(
				formattedTime.ampm,
				(this.canvas.width / 2)
					+ (this.renderedTextMetrics.width / 2)
					- (this.renderedSubTextMetrics.width / 2), 
				96
			);

			// pA clock
			this.ctx.font = (this.playerClockFontSize) + "px Wellfleet";
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);

			if (this.playerData.currentPlayer == "a") {
				this.drawBackground(100, 0, this.canvas.width, [0, 0, this.canvas.height, 100]);
			} else {
				this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity / 2})`;
			}
			
			this.ctx.fillText(
				this.playerData.currentPlayer == "a" ? cTurnTime : pLastTurnTime,
				(this.canvas.height / 2) - (this.renderedPlayerClockTextMetrics.width / 2) - (ICON_SIZE / 2), 
				-(this.playerClockFontSize / 1.5)
			);
			this.ctx.font = (this.fontSize / 2.25) + "px Wellfleet";
			this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity})`;
			this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.4})`;
			this.ctx.fillText(
				pATime,
				(this.canvas.height / 2) - (this.renderedPlayerClockSubTextMetrics.width / 2) - (ICON_SIZE / 2), 
				-(this.playerClockFontSize * 1.75)
			);

			this.ctx.restore();

			// pB clock
			this.ctx.save();
			if (this.playerData.currentPlayer == "b") {
				this.drawBackground(-100, 0, this.canvas.width, [this.canvas.width, 0, 100, this.canvas.height]);
			} else {
				this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity / 2})`;
			}
			this.ctx.rotate((Math.PI / 180) * -90);	
			
			this.ctx.fillText(
				this.playerData.currentPlayer == "b" ? cTurnTime : pLastTurnTime,
				-(this.canvas.height / 2) - (this.renderedPlayerClockTextMetrics.width / 2) + (ICON_SIZE / 2), 
				this.canvas.width - (this.playerClockFontSize / 1.5)
			);
			this.ctx.font = (this.fontSize / 2.25) + "px Wellfleet";
			this.ctx.fillStyle = `rgba(${this.playerClockSubTextColor}, ${this.opacity})`;
			this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.4})`;
			this.ctx.fillText(
				pBTime,
				-(this.canvas.height / 2) - (this.renderedPlayerClockSubTextMetrics.width / 2) + (ICON_SIZE / 2), 
				this.canvas.width - (this.playerClockFontSize * 1.75)
			);
			this.ctx.restore();
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
			if (this.opacity > 1) {
				this.opacity = 1;
			}
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
					-(this.canvas.width) + this.position
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

		return cylinder.result;
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

const ICON_SIZE = 60;
const playerData = new PlayerData();
const timeDisplay = new TimeCanvasObject(playerData);
const uiDisplay = new UICanvasObject(timeDisplay, playerData);
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
