import * as THREE from 'three';

class TimeCanvasObject {
	constructor() {
		this.canvas = document.getElementById("timeCanvas");
		this.ctx = this.canvas.getContext("2d");
		
		this.fontReady = document.fonts.check("1em Wellfleet");
		if (this.fontReady) {
			const formattedTime = this.formatTime(new Date());
			this.fontSize = 80;
			this.ctx.font = this.fontSize + "px Wellfleet";
			this.renderedTextMetrics = this.ctx.measureText(formattedTime.time);
			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			this.renderedSubTextMetrics = this.ctx.measureText(formattedTime.ampm);
		}

		this.opacity = 1;

		this.setCanvasDimensions();
		this.draw();

		window.addEventListener('resize', () => {
			this.setCanvasDimensions();
			this.draw();
		}, false);
	}

	formatTime(date) {
		let hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		const ampm = hours >= 12 ? 'PM' : 'AM';
	
		hours = hours % 12;
		hours = hours ? hours : 12;
		const strHours = hours < 10 ? '0' + hours : hours;
		const strMinutes = minutes < 10 ? '0' + minutes : minutes;
		const strSeconds = seconds < 10 ? '0' + seconds : seconds;
	
		return {
			time: `${strHours}:${strMinutes}:${strSeconds}`,
			ampm: ampm
		};
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const formattedTime = this.formatTime(new Date());
		this.fontSize = 80;
		this.ctx.font = this.fontSize + "px Wellfleet";
		this.ctx.textAlign = "left";
		this.ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
		this.ctx.shadowColor = `rgba(0, 0, 0, ${this.opacity * 0.7})`;
		this.ctx.shadowOffsetX = 4;
		this.ctx.shadowOffsetY = 4;
		this.ctx.shadowBlur = 5;

		if (!this.fontReady) {
			this.renderedTextMetrics = this.ctx.measureText(formattedTime.time);
			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			this.renderedSubTextMetrics = this.ctx.measureText(formattedTime.ampm);
			this.ctx.font = this.fontSize + "px Wellfleet";
			this.fontReady = document.fonts.check("1em Wellfleet");
		}

		if (window.innerWidth < window.innerHeight) {
			this.ctx.save();
			this.ctx.rotate((Math.PI / 180) * 90);

			this.ctx.fillText(formattedTime.time,
				(this.canvas.height / 2) - (this.renderedTextMetrics.width / 2) - this.renderedSubTextMetrics.width, 
				(-1 * this.canvas.width) + 96
			);

			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			const hShift = (this.canvas.height / 2) + (this.renderedTextMetrics.width / 2 + 8) - this.renderedSubTextMetrics.width;
			this.ctx.fillText(formattedTime.ampm, hShift, (-1 * this.canvas.width) + 96);
	
			this.ctx.restore();
		} else {
			this.ctx.fillText(formattedTime.time, (this.canvas.width / 2) - (this.renderedTextMetrics.width / 2), 96);

			this.ctx.font = (this.fontSize / 2) + "px Wellfleet";
			const hShift = (this.canvas.width / 2) + (this.renderedTextMetrics.width / 2 + 8);
			this.ctx.fillText(formattedTime.ampm, hShift, 96);
		}

		setTimeout(() => {
			window.requestAnimationFrame(() => {
				this.draw();
			});
		}, 1000);
	}

	setCanvasDimensions() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	fadeOut() {
		if (this.opacity > 0) {
			this.opacity -= 0.06;
			window.requestAnimationFrame(() => {
				this.fadeOut();
				this.draw();
			});
		}
	}

	fadeIn() {
		if (this.opacity < 1) {
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
			if (window.innerWidth < window.innerHeight) {
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
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
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
	if (window.innerWidth < window.innerHeight) {
		renderer.domElement.style = `
			position: absolute;
			top: 0;
			right: 0;
			z-index: 0;
			transform: rotate(90deg) translate(100%, 0);
			transform-origin: 100% 0;
		`;
		camera.aspect = window.innerHeight / window.innerWidth;
		camera.updateProjectionMatrix();
	
		renderer.setSize(window.innerHeight, window.innerWidth);
		renderer.render(scene, camera);
	} else {
		renderer.domElement.style = "position: absolute; top: 0; left: 0; z-index: 0;";
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.render(scene, camera);
	}
}

const timeDisplay = new TimeCanvasObject();
const statusDisplay = new StatusCanvasObject();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

textureLoader.load('circle_bottom.png',
	function(texture) {
		textureBottom = texture;
		textureBottom.colorSpace = THREE.SRGBColorSpace;

		if (textureTop && textureBottom) {
			setTextures();
		}
	}
);

textureLoader.load('circle_top.png',
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

renderer.domElement.addEventListener('click', function(event) {
	if (!cylinder.disableClick) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
	
		if (raycaster.intersectObjects(scene.children).length > 0) {
			cylinder.disableClick = true;
			clearTimeout(timeDisplay.fadeInTimeout);
			timeDisplay.fadeOut();
			flipCoin(camera, cylinder, true);
		}
	}
});
