import './style.css'
import "./events.js"

export const BOARD_WIDTH = 800
const BOARD_HEIGHT = 600
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 10
const PADDLE_SPEED = 15
const BAR_WIDTH = 90
const BAR_HEIGHT = 15
const BAR_PADDING = 5
const BALL_RADIUS = 10
let defaultBallSpeedY = 5
const getDefaultBallSpeed = () => {
  return {
    x: 0,
    y: -defaultBallSpeedY
  }
}

const DEFAULT_BALL_SPEED = 5
const POWERUP_WIDTH = 50
const POWERUP_HEIGHT = 20
const POWERUP_SPEED = 1

let lastTime = 0
let level = 1
let score = 0
let powerUpsValue = 0
let barsValue = 0

const barColors = [
  '#4287f5',
  '#4dd18f',
  '#e9f26b',
  '#e86461',
  '#d654d6'
]


const powerUps = []

const canvas = document.querySelector('canvas')
canvas.width = BOARD_WIDTH
canvas.height = BOARD_HEIGHT
canvas.style.border = '1px solid black'

const ctx = canvas.getContext('2d')


const powerUpsList = [
  { 
    name: 'duplicateBalls',
    color: ["#6dff2e", "#4ff8ff"],
  },
  { 
    name: 'enlargePaddle',
    color: ["#f52525", "#ff6b6b"],
  }
]

export const paddle = {
  x: BOARD_WIDTH / 2 - PADDLE_WIDTH / 2,
  y: BOARD_HEIGHT - PADDLE_HEIGHT - 10,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: PADDLE_SPEED
}

const balls = [{
  x: BOARD_WIDTH / 2,
  y: BOARD_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS,
  radius: BALL_RADIUS,
  speed: getDefaultBallSpeed()
}]

const bars = []


const resetBalls = () => {
  balls.splice(0, balls.length) 
  balls.push({
    x: BOARD_WIDTH / 2,
    y: BOARD_HEIGHT - PADDLE_HEIGHT - 10 - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: getDefaultBallSpeed()
  })
}

const resetPowerUps = () => {
  powerUps.splice(0, powerUps.length)
}

const generateBars = (amount) => {
  bars.splice(0, bars.length)
  const columns = Math.floor(BOARD_WIDTH / (BAR_WIDTH + BAR_PADDING * 2))
  const rows = Math.floor(amount / columns)
  for(let i = 0; i < amount; i++) {
    bars.push({
      x: (i % columns) * (BAR_WIDTH + BAR_PADDING * 2) + BAR_PADDING,
      y: Math.floor(i / columns) * (BAR_HEIGHT + BAR_PADDING * 2) + BAR_PADDING + BAR_HEIGHT,
      width: BAR_WIDTH,
      height: BAR_HEIGHT,
      color: barColors[Math.floor(Math.random() * barColors.length)]
    })
  }
}
const drawPaddle = () => {
  ctx.fillStyle = '#fff'
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
}

const drawBall = (ball) => {
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
  ctx.fill()
}

const drawBalls = () => {
  balls.forEach(drawBall)
}

const drawBoard = () => {
  ctx.fillStyle = '#444'
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)
}

const drawBar = (bar) => {
  ctx.fillStyle = bar.color
  ctx.fillRect(bar.x, bar.y, bar.width, bar.height)
}

const drawBars = () => {
  bars.forEach(drawBar)
}

const drawPowerUp = (powerUp) => {
  const grd = ctx.createRadialGradient(powerUp.x + POWERUP_WIDTH / 2, powerUp.y + POWERUP_HEIGHT / 2, 0, powerUp.x + POWERUP_WIDTH / 2, powerUp.y + POWERUP_HEIGHT / 2, POWERUP_WIDTH / 2)
  grd.addColorStop(0, powerUp.color[0])
  grd.addColorStop(1, powerUp.color[1])
  ctx.fillStyle = grd
  ctx.fillRect(powerUp.x, powerUp.y, POWERUP_WIDTH, POWERUP_HEIGHT)
}

const drawPowerUps = () => {
  powerUps.forEach(drawPowerUp)
}
const draw = () => {
  drawBoard()
  drawPaddle()
  drawBalls()
  drawBars()
  drawPowerUps()
}

const moveBalls = (deltaTime) => {
  console.log("moving ball")
  balls.forEach((ball) => {
    ball.x += ball.speed.x * deltaTime
    ball.y += ball.speed.y * deltaTime
  })
}

const writeScore = () => {
  document.getElementById("score-value").innerHTML = score
  document.getElementById("level-value").innerHTML = level
  document.getElementById("powerups-value").innerHTML = powerUpsValue
  document.getElementById("bars-value").innerHTML = barsValue
}

const resetScore = () => {
  level = 1
  score = 0
  powerUpsValue = 0
  barsValue = 0
}

const resetPaddle = () => {
  paddle.x = BOARD_WIDTH / 2 - PADDLE_WIDTH / 2
  paddle.width = PADDLE_WIDTH
}

const lose = () => {
  alert('You lost!')
  defaultBallSpeedY = DEFAULT_BALL_SPEED
  resetScore()
  resetBalls()
  resetPowerUps()
  resetPaddle()
  generateBars(64)
}

const levelUp = () => {
  defaultBallSpeedY++
  level++
  resetBalls()
  resetPowerUps()
  resetPaddle()
  paddle.x = BOARD_WIDTH / 2 - paddle.width / 2
  generateBars(64)
  document.getElementById("level-value").innerHTML = level
}

const getBallXDistanceFromPaddle = (ball) => {
  const paddleCenter = paddle.x + paddle.width / 2
  const distance = (ball.x - paddleCenter)
  return distance / 5
}

const checkCollisionWithBar = (ball, bar) => {
  return (
    ball.x + ball.radius > bar.x &&
    ball.x - ball.radius < bar.x + bar.width &&
    ball.y + ball.radius > bar.y &&
    ball.y - ball.radius < bar.y + bar.height
  )
}

const checkCollidesWithAnyBar = (ball) => {
  let barCollides = null
  bars.forEach((bar, index) => {
    if (checkCollisionWithBar(ball, bar)) {
      barCollides = bar
      bars.splice(index, 1)
      barsValue++
      score += 10
    }
  });
  return barCollides
}

//check which side of bar is colliding with ball
const checkBarCollidingSide = (ball, bar) => {
  console.log("ball x " + (ball.x + ball.radius))
  console.log("bar x " + bar.x)
  
  if (ball.x + ball.radius - ball.speed.x <= bar.x) {
    return 'left'
  }

  if (ball.x - ball.radius - ball.speed.x >= bar.x + bar.width) {
    return 'right'
  }

  if (ball.y + ball.radius - ball.speed.y >= bar.y) {
    return 'bottom'
  }

  if (ball.y - ball.radius - ball.speed.y <= bar.y + bar.height) {
    return 'top'
  }

}

const dropPowerUp = (bar) => {
  if(Math.random() > 0.3) {
    return
  }
  const randomPowerUp = Math.floor(Math.random() * powerUpsList.length)
  const powerUp = {
    x: bar.x + bar.width / 2 - POWERUP_WIDTH / 2,
    y: bar.y,
    name: powerUpsList[randomPowerUp].name,
    color: powerUpsList[randomPowerUp].color
  }
  powerUps.push(powerUp)
}

const handleBallCollision = (ball) => {
  // Check if the ball collides with the paddle
  if (ball.x + ball.radius > paddle.x && ball.x - ball.radius < paddle.x + paddle.width && ball.y + ball.radius > paddle.y) {
    ball.speed.y = -ball.speed.y
    ball.speed.x = getBallXDistanceFromPaddle(ball)
    ball.y = paddle.y - ball.radius

  }

  // Check if the ball collides with the top
  if (ball.y - ball.radius < 0) {
    ball.speed.y = -ball.speed.y
  }

  // Check if the ball collides with the bottom
  if (ball.y + ball.radius > BOARD_HEIGHT) {
    balls.splice(balls.indexOf(ball), 1)
    if(balls.length === 0){
      lose()
    }
  }

  // Check if the ball collides with the left or right
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > BOARD_WIDTH) {
    ball.speed.x = -ball.speed.x
  }
  let bar = checkCollidesWithAnyBar(ball)
  if (bars.length === 0) {
    levelUp()
    return
  }
  // Check if the ball collides with a bar
    if (bar) {
      const side = checkBarCollidingSide(ball, bar)
      if (side === 'top' || side === 'bottom') {
        ball.speed.y = -ball.speed.y
      } else if (side === 'left' || side === 'right') {
        ball.speed.x = -ball.speed.x
      }
      dropPowerUp(bar)
    }
}

const collidesWithPaddle = (powerUp) => {
  return (
    paddle.x + paddle.width > powerUp.x &&
    paddle.x < powerUp.x + POWERUP_WIDTH &&
    paddle.y + paddle.height > powerUp.y &&
    paddle.y < powerUp.y + POWERUP_HEIGHT
  )
}

const duplicateBalls = () => {
  balls.forEach((ball) => {
    ball.speed.x = 3
    balls.push({
      x: ball.x,
      y: ball.y,
      radius: ball.radius,
      speed: {
        x: -3,
        y: ball.speed.y
      }
    })
  })
}

const enlargePaddle = () => {
  paddle.width += 10
  paddle.x -= 5
}

const triggerPowerUp = (powerUp) => {
  switch (powerUp.name) {
    case 'duplicateBalls':
      duplicateBalls()
      break
    case 'enlargePaddle':
      enlargePaddle()
      break
    case 'speedUpPaddle':
      speedUpPaddle()
      break
  }
}

const movePowerUps = (deltaTime) => {
  powerUps.forEach((powerUp) => {
    powerUp.y += POWERUP_SPEED * deltaTime
    if (powerUp.y > BOARD_HEIGHT) {
      powerUps.splice(powerUps.indexOf(powerUp), 1)
    }
    if (collidesWithPaddle(powerUp)) {
      triggerPowerUp(powerUp)
      powerUpsValue++
      score += 5
      powerUps.splice(powerUps.indexOf(powerUp), 1)
    }
  })  
}

let deltaTime = 0


const update = (time = 0) => {
  balls.forEach((ball) => {
    handleBallCollision(ball)
  })
  
  deltaTime = (time - lastTime) / 16
  lastTime = time

  console.log(deltaTime)
  moveBalls(deltaTime)
  movePowerUps(deltaTime)
  writeScore()

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#444'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  draw()
  requestAnimationFrame(update)
}
writeScore()
generateBars(64)
update()