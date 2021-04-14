// Declaration Dom Elements
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let min = 55;
let max = 65;

if (innerWidth < innerHeight) {
  min = 30;
  max = 40;
}

const mouse = {
  x: undefined,
  y: undefined,
};

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gameStart();
});

window.addEventListener(
  "touchmove",
  function (ev) {
    mouse.x = ev.touches[0].clientX;
    mouse.y = ev.touches[0].clientY;
  },
  false
);

addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// Player Class
class Player {
  constructor(x, size, color) {
    this.x = x;
    this.y = innerHeight - 75;
    this.size = size;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    this.draw();
    if (mouse.x < innerWidth - 50 && mouse.x > 0) {
      this.x = mouse.x;
    }
    if (this.y > innerHeight - 50) {
      {
        this.y = this.y;
        landed = true;
      }
    } else {
      this.y += 10;
    }
  }
}

//Enemies Class
class Enemies {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.move =
      innerWidth > innerHeight
        ? Math.random() * ((70 - this.radius) / 50)
        : Math.random() * ((70 - this.radius) / 150);
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    if (this.x + this.radius > innerWidth || this.x - this.radius < -50)
      this.velocity.x = -this.velocity.x;
    if (this.y + this.radius > innerHeight || this.y + this.radius < 50) {
      this.velocity.y = -this.velocity.y;
    } else {
      this.velocity.y += 2.5;
    }
    if (innerWidth > innerHeight)
      this.x += this.velocity.x * (this.radius / 15);
    else this.x += this.velocity.x * (this.radius / 5);

    this.y += this.velocity.y * this.move;
    this.draw();
  }
}

// Particles Class
const friction = 0.989;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    this.alpha -= 0.01;
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
  }
}

// Projectile Class
class Projectile {
  constructor(x, y, radius, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = ctx.strokeStyle = `hsl(${Math.random() * 360},50%,50%)`;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.y += this.velocity.y;
    this.draw();
  }
}

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//Objects
const player = new Player(innerWidth / 2 - 50, 60, "red");
let projectiles = [];
let enemies = [];
let landed = false;
let particles = [];
let spawnTym = 5000;
const scoreTxt = document.querySelector("#score");
const modal = document.getElementById("scoreModal");
const score = document.querySelector("#scoreBtn");
const btn = document.querySelector("#btn");
const background = document.querySelector("#background");
const fire = document.querySelector("#fire");
const blast = document.querySelector("#blast");
const smallblast = document.querySelector("#smallblast");
const intro = document.querySelector("#intro");
const title = document.querySelector("#title");
let scoreValue = 0;
let speed = 1;

btn.addEventListener("click", function () {
  window.location.reload();
});

function play() {
  projectiles.push(
    new Projectile(player.x + 30, innerHeight - 25, 7, { x: 0, y: -9 })
  );
}

function spawnEnemies() {
  setInterval(() => {
    console.log("Enemies");
    let radius = randomIntFromRange(min, max);

    let velocity = {
      x: 0,
      y: 0,
    };

    let x = 20;
    let y = Math.random() * 200 + 100;
    velocity.x = Math.random() * 3 + radius / 50;
    velocity.y = Math.random() * 3 + radius / 100;

    enemies.push(
      new Enemies(x, y, radius, `hsl(${Math.random() * 360},50%,50%)`, velocity)
    );
  }, spawnTym);
}

function animate() {
  animationID = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 10);
    } else particle.update();
  });
  if (landed) {
    projectiles.forEach((missile, index) => {
      missile.update();
      if (
        missile.x + missile.radius < 0 ||
        missile.x - missile.radius > innerWidth ||
        missile.y + missile.radius < 0 ||
        missile.y - missile.radius > innerHeight
      ) {
        setTimeout(() => {
          projectiles.splice(index, 1);
        }, 0);
      }
    });
  }
  enemies.forEach((enemy, index) => {
    enemy.update();
    if (
      Math.hypot(enemy.x - player.x, enemy.y - player.y)  -
        enemy.radius <
      -1
    ) {
      setTimeout(function () {
        cancelAnimationFrame(animationID);
        score.innerHTML = scoreValue;
        modal.style.display = "flex";
        gameEnd();
      }, 100);
    }
    projectiles.forEach((missiles, indexProjectile) => {
      if (
        Math.hypot(missiles.x - enemy.x, missiles.y - enemy.y) -
          missiles.radius -
          enemy.radius <
        1
      ) {
        for (let i = 0; i < enemy.radius / 2 + 18; i++) {
          particles.push(
            new Particle(
              missiles.x,
              missiles.y,
              Math.random() * 4 + 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 20),
                y: (Math.random() - 0.5) * (Math.random() * 20),
              }
            )
          );
        }
        if (enemy.radius - 15 > 12) {
          smallblast.play();
          scoreValue += 100;
          scoreTxt.innerHTML = scoreValue;
          gsap.to(enemy, {
            radius: enemy.radius - 15,
          });
          let turn = 0;
          while (turn++ != 60) {
            enemy.x += 0.01;
          }
          turn = 0;
          while (turn++ != 120) {
            enemy.y -= 0.01;
          }
          setTimeout(() => {
            projectiles.splice(indexProjectile, 1);
          }, 0);
        } else {
          setTimeout(() => {
            blast.play();
            scoreValue += 250;
            scoreTxt.innerHTML = scoreValue;
            enemies.splice(index, 1);
            projectiles.splice(indexProjectile, 1);
          }, 0);
        }
      }
    });
  });

  player.update();
}

const startGame = document.querySelector("#startboard");
const start = document.querySelector("#start");

start.addEventListener("click", gameStart);
let run = true;
function gameStart() {
  title.play();
  animate();
  spawnEnemies();
  startGame.style.display = "none";
  background.loop = true;
  setTimeout(() => {
    background.play();
    setInterval(() => {
      if (run) {
        fire.volume = 0.1;
        fire.play();
      } else return;
    }, 10);
  }, 5000);
  setInterval(play, 100);
  setInterval(function () {
    spawnTym -= 500;
  }, 5000);
}
function gameEnd() {
  background.pause();
  run = false;
  setTimeout(() => {
    intro.play();
  }, 100);
}
