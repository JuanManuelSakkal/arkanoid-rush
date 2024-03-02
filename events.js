import { paddle, BOARD_WIDTH } from "./main.js"

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && paddle.x > 0) {
      paddle.x -= paddle.speed
    } else if (event.key === 'ArrowRight' && paddle.x < BOARD_WIDTH - paddle.width) {
      paddle.x += paddle.speed
    }
  })
  