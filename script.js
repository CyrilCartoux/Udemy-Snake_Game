window.onload = function () {

	class Game {
		constructor(canvasWidth, canvasHeight) {
			this.canvasWidth = 900;
			this.canvasHeight = 600;
			this.blockSize = 30;
			this.canvas = document.createElement("canvas");
			this.ctx = this.canvas.getContext("2d");
			this.widthInBlocks = this.canvasWidth / this.blockSize;
			this.heightInBlocks = this.canvasHeight / this.blockSize;
			this.centreX = this.canvasWidth / 2;
			this.centreY = this.canvasHeight / 2;
			this.delay = 100;  // vitesse du snake 
			this.score = 0;
			this.snakee;
			this.applee;
			this.timeout;
		}

		init() {
			this.canvas.width = this.canvasWidth;
			this.canvas.height = this.canvasHeight;
			this.canvas.style.border = "30px solid grey";
			document.body.appendChild(this.canvas);
			this.snakee = new Snake([[6,4], [5,4], [4,4]], "right");
			this.applee = new Apple([10, 10]);
			this.refreshCanvas();		
		}

		restart() {
	    	location.reload();
	    }

		refreshCanvas(ctx, blockSize, centreX, centreY) {
	        this.snakee.advance();
	        if(this.snakee.checkCollision(this.widthInBlocks, this.heightInBlocks)) {
	            Drawing.gameOver(this.ctx, this.centreX, this.centreY);
	        } 
	        else {       
	            if(this.snakee.isEatingApple(this.applee))  {
	                this.score ++;
	                this.snakee.ateApple = true;
	                do {
	                    this.applee.setNewPosition(this.widthInBlocks, this.heightInBlocks);
	                } while(this.applee.isOnSnake(this.snakee))                                   
	            }
	            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	            Drawing.drawScore(this.ctx, this.centreX, this.centreY, this.score);
	            Drawing.drawApple(this.ctx, this.blockSize, this.applee);       
	            Drawing.drawSnake(this.ctx, this.blockSize, this.snakee)
	            this.timeout = setTimeout(this.refreshCanvas.bind(this), this.delay);
	        }
	    }
	}

	class Snake {
		constructor(body, direction) {
			this.body = body;
			this.direction = direction;
			//par défaut n'a pas mangé la pomme, deviens true si il l'a mangée
			this.ateApple = false;
		}
		//Function qui détermine la direction du serpent selon setDirection()
		// on modifie ici les coordonnées[x,y] ; [0]=x [1]=y
		advance() {
			const nextPosition = this.body[0].slice();
				switch (this.direction) {
					case "left":
					//je décremente [x] pour aller à gauche
					nextPosition[0]--;
					break;
					case "right":
					//j'incrémente [x] pour aller à droite
					nextPosition[0]++
					break;
					case "up":
					// a comprendre, dans ma tête ce serait l'inverse
					nextPosition[1]--
					break;
					case "down":
					// a comprendre, dans ma tête ce serait l'inverse
					nextPosition[1]++
					break;
					default:
					throw("invalid direction");
				};

			this.body.unshift(nextPosition);
			if (!this.ateApple) {''
				this.body.pop();
			} else {
				this.ateApple = false;
			}	 
		};
		// dirige le serpent en function des directions autorisées et de l'input sur le clavier
		setDirection(newDirection){
			let allowedDirections;
				switch(this.direction) {
					case "left":
					case "right":
					// si il va vers la gauche ou droite / autorise que haut et bas 
					allowedDirections = ["up", "down"]
					break;
					case "up":
					case "down":
					// si il va vers le haut ou le bas tu m'autorise que gauche ou droite
					allowedDirections = ["left", "right"]
					break;
					default:
					throw("invalid direction");
				}

				// si x ou y n'est pas négatif il n'est pas sorti du canvas donc il continue d'avancer
				if (allowedDirections.indexOf(newDirection) > -1) {
					this.direction = newDirection;
				}
		};
		// on verifie si le serpent ne s'est pas mangé un mur
		checkCollision(widthInBlocks, heightInBlocks) {
			let wallCollision = false;
			let snakeCollision = false;
			//tete est le premier element du corps du snake qui est un array
			const head = this.body[0];
			//le corps c'est le serpent moins ( slice()) la tête 
			const rest = this.body.slice(1);
			const snakeX = head[0];
			const snakeY = head[1];
			const minX = 0;
			const minY = 0;
			const maxX = widthInBlocks - 1;
			const maxY = heightInBlocks - 1;
			const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

				//si il a dépassé les limites du canvas
				if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
					wallCollision = true;
				}
				//Si il se mange la queue retoure snakecollision = true
				for (let block of rest) {
					if (snakeX === block[0] && snakeY === block[1]) {
						snakeCollision = true;
					}
				}
				// return false by default sauf si il s'est mangé le mur ou lui même
			return wallCollision || snakeCollision;
		};
		isEatingApple(appleToEat){
            const head = this.body[0];
            //si ma tete est sur la position de la pomme en x et en y
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
            	//il l'a mangée
                return true;
            else
            	//il l'a pas mangée
                return false;
        }
	} 

	class Apple {
		constructor(position) {
			this.position = position;
        }      
        //genere aléatoirement un X et un Y qui seront les nouvelles coordonnées de notre pomme
		setNewPosition(widthInBlocks, heightInBlocks) {
			const newX = Math.round(Math.random() * (widthInBlocks -1));
			const newY  = Math.round(Math.random() * (heightInBlocks -1));
			//on attribue a la position de notre pomme les nouveaux X et Y
			this.position = [newX, newY];
		}

		//On verifie si la pomme n'a pas apparue SUR le serpent ( bug)
		isOnSnake(snakeToCheck) {
			//par défaut elle ne l'es pas
			const isOnSnake = false;

			//je parcoure la longeur de mon serpent
			for(let block of snakeToCheck.body) {
				//si la position x de la pomme correspond au x du serpent ET le y de la pomme au y du serpent tu me renvoi true
				if (this.position[0] === block[0] && this.position[1] === block[1]) {
					isOnSnake = true;
				}
			}
			return isOnSnake;
		}
	}

	class Drawing {

		// Affiche le texte "GAME OVER"
		static gameOver(ctx, centreX, centreY) {
	    	ctx.save();
	        ctx.font = "bold 70px sans-serif";
	        ctx.fillStyle = "#000";
	        ctx.textAlign = "center";
	        ctx.textBaseline = "middle";
	        ctx.strokeStyle = "white";
	        ctx.lineWidth = 5;
	        ctx.strokeText("Game Over", centreX, centreY - 180);
	        ctx.fillText("Game Over", centreX, centreY - 180);
	        ctx.font = "bold 30px sans-serif";
	        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
	        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
	        ctx.restore();
	    }
	    // Affiche le score
	    static drawScore(ctx, centreX, centreY, score) {
	    	ctx.save();
	        ctx.font = "bold 200px sans-serif";
	        ctx.fillStyle = "gray";
	        ctx.globalAlpha = 0.5
	        ctx.textAlign = "center";
	        ctx.textBaseline = "middle";
	        ctx.fillText(score.toString(), centreX, centreY);
	        ctx.restore();
	    } 
	    static drawSnake(ctx, blockSize, snake) {
	    	ctx.save();
			ctx.fillStyle = "#ff0000";
				for(let block of snake.body) {
					this.drawBlock(ctx, block, blockSize);
				}
			ctx.restore();
	    }
	    static drawApple(ctx, blockSize, apple) {
	        ctx.save();
	        ctx.fillStyle = "#33cc33";
	        ctx.beginPath();
	        //on prend le milieu d'un block du canvas
	        const radius = blockSize/2;
	        //on trace un cercle
	        const x = apple.position[0]*blockSize + radius;
	        const y = apple.position[1]*blockSize + radius;
	        ctx.arc(x, y, radius, 0, Math.PI*2, true);
	        ctx.fill();
	        ctx.restore();
        };
	    static drawBlock(ctx, position, blockSize) {
			const x = position[0] * blockSize;
			const y = position[1] * blockSize;
			ctx.fillRect(x, y, blockSize, blockSize);
		}   
	}

	let myGame = new Game();
	myGame.init();



	document.onkeydown = (e) => {
		const key = e.keyCode;
		let newDirection;
			switch(key) {
			case 37:
				newDirection = "left"
				break;
			case 38:
				newDirection = "up"
				break;
			case 39:
				newDirection = "right"
				break;
			case 40:
				newDirection = "down"
				break;
			case 32: 
			//ESPACE
				myGame.restart();
				
				return;
			default:
				return;
			}
			//appelle la fonction setdirection et lui attribues la nouvelle direction indiquée par notre input sur le clavier
		myGame.snakee.setDirection(newDirection);
		
	}
};