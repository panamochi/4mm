"use strict";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d"); //getContext("2d"),キャンバスに描画するためのツール
const ballRadius = 10;
// ボールの開始位置
let x = canvas.width / 2;
let y = canvas.height - 15;
//ボールの速さ(位置描画の更新,射出角度)
let dx = 1;
let dy = -1;
// パドルの大きさ
const paddleHeight = 10; // パドルの高さ
const paddleWidth = 75; // パドルの幅
let paddleX = (canvas.width - paddleWidth) / 2; //x軸の開始位置
//  パドル操作変数(初期値: false)
let rightPressed = false;
let leftPressed = false;
// スコア変数(初期値: 0)
let score = 0;
//プレイヤーのライフ(初期値: 3)
let lives = 3;

// ブロック変数
const brickRowCount = 8; //ブロックの行
const brickColumnCount = 5; //ブロックの列
const brickWidth = 75; //ブロックの幅
const brickHeight = 20; //ブロックの高さ
const brickPadding = 20; // ブロック間の隙間
const brickOffsetTop = 30; // 上辺からの相対位置
const brickOffsetLeft = 30; // 左辺からの相対位置

const bricks = [];
// console.log(bricks);
// 行と列をループして新しいブロックを作成
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

//keydown,keyupイベントプロパティで矢印キー(左右)の動作を検知
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
//mousemoveイベントプロパティでマウスの動作を検知
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// 衝突検出関数
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x && // ボールの x 座標がブロックの x 座標より大きい
          x < b.x + brickWidth && // ボールの x 座標がブロックの x 座標とその幅の和より小さい
          y > b.y && // ボールの y 座標がブロックの y 座標より大きい
          y < b.y + brickHeight // ボールの y 座標がブロックの y 座標とその高さの和より小さい
        ) {
          dy = -dy;
          b.status = 0;
          score++; //ブロックに当たるたびにスコアを増加
          if (score === brickRowCount * brickColumnCount) {
            //ブロックをすべて崩したとき
            alert("YOU WIN, CONGRATULATIONS!!");
            document.location.reload();
            // clearInterval(interval);
          }
        }
      }
    }
  }
}

// ボール描画関数
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  if (lives == 3) {
    ctx.fillStyle = "#0095dd";
  } else if (lives == 2) {
    ctx.fillStyle = "green";
  } else {
    ctx.fillStyle = "red";
  }
  ctx.fill();
  ctx.closePath();
}

// パドル描画関数
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095dd";
  ctx.fill();
  ctx.closePath();
}

// スコア描画関数
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095dd";
  ctx.fillText(`Score: ${score}`, 8, 20);
}

//ライフ描画関数
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095dd";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

// ブロック描画ロジック
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft; //x座標
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop; //y座標
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095dd";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// 描画関数
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //ボールの軌跡を消去
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();
  // 左辺と右辺で跳ね返させる //
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  // 上辺と下辺で跳ね返させる //
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    // 下辺に触れたらゲームオーバーの条件
    if (x > paddleX && x < paddleX + paddleWidth) {
      // パドルに触れると跳ね返る条件
      dy = -dy;
    } else {
      lives--;
      if (!lives) {
        // 下辺に触れるとGAME OVERを表示、リトライ
        alert("GAME OVER");
        document.location.reload();
        // clearInterval(interval); // クロームがゲームを終了するのに必要
      } else if (lives === 2) {
        x = canvas.width / 2;
        y = canvas.height - 15;
        dx = 2;
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      } else if (lives === 1) {
        x = canvas.width / 2;
        y = canvas.height - 15;
        dx = -3;
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }
  if (rightPressed) {
    // paddleX += 7; // パドルのスピード
    paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
  } else if (leftPressed) {
    // paddleX -= 7; // パドルのスピード
    paddleX = Math.max(paddleX - 7, 0);
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw); //ブラウザーによる滑らかなアニメーション
}

const startBtn = document.getElementById("btn");
startBtn.addEventListener("click", draw);
// draw();
