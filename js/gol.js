const docHeight = window.innerHeight
const docWidth = window.innerWidth
const canvas = document.getElementById("gol")
const ctx = canvas.getContext("2d")

ctx.canvas.height = docHeight - 20
ctx.canvas.width = docWidth - 20

const [canvasWidth, canvasHeight] = [canvas.width, canvas.height]
const res = 10
const [rows, cols] = [Math.round(canvasWidth / res), Math.round(canvasHeight / res)]

function createGrid(rows, cols) {
    let arr = new Array(rows).fill(0)
    arr = arr.map((e) => new Array(cols).fill(0))
    return { data: arr, rows, cols }
}

function randomizeGrid(grid) {
    grid.data = grid.data.map((e) =>
        e.map((p) => (Math.random() > 0.5 ? 1 : 0))
    )
}
function printGrid(ctx, grid) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.cols; j++) {
            ctx.beginPath()
            ctx.strokeStyle = "rgb(255, 255, 255)"
            ctx.fillStyle = "rgb(240, 240, 240)"
            // ctx.rect(i * res, j * res, res - 1, res - 1)
            ctx.roundRect(i * res, j * res, res - 1, res - 1, 4)
            if (grid.data[i][j] == 1) ctx.fill()
            ctx.stroke()
        }
    }
}

function computeNextGrid(grid) {
    let next = createGrid(grid.rows, grid.cols)
    for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.cols; j++) {
            let state = grid.data[i][j]
            let neighbours = countLiveNeighbours(grid, i, j)

            if ((neighbours == 3) & (state == 0)) next.data[i][j] = 1
            else if (neighbours < 2 || (neighbours > 3) & (state == 1)) next.data[i][j] = 0
            else if ((neighbours == 2) & (neighbours == 2) & (state == 1)) next.data[i][j] = 1
            else next.data[i][j] = grid.data[i][j]
        }
    }
    return next
}
function countLiveNeighbours(grid, r, c) {
    let sum = 0
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            let row = (r + i + rows) % rows
            let col = (c + j + cols) % cols
            let n = grid.data[row][col]
            sum += n
        }
    }
    sum -= grid.data[r][c]
    return sum
}

let grid = createGrid(rows, cols)
randomizeGrid(grid)

function draw() {
    printGrid(ctx, grid)
    let next = computeNextGrid(grid)
    grid = next
    requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
