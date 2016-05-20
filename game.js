var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

var img = new Image();
img.src = './sprite.jpg';

var SIZE = 20;

function MineSweeper(width, height, bombsCount){
  this.width = width;
  this.height = height;
  this.bombsCount = bombsCount;

  this.init();
  this.draw();
}

MineSweeper.prototype.each = function(cb) {
  for (var i = 0; i < this.height; i ++){
    for (var j = 0; j < this.width; j ++){
      cb(this.field[i][j], j, i);
    }
  }
}

MineSweeper.prototype.init = function() {
  canvas.width = SIZE * this.width;
  canvas.height = SIZE * this.height;

  this.field = [];

  for (var i = 0; i < this.height; i++){
    this.field[i] = [];
    for (var j = 0; j < this.width; j++){
      this.field[i][j] = {
        bomb: false,
        count: -1,
        visible: false,
        flag: false
      };
    }    
  }
  this.createBombs();
  this.setNeighbours();


}
MineSweeper.prototype.createBombs = function() {
  var bombsLeft = this.bombsCount;
  while(bombsLeft > 0){

    var x = Math.floor(Math.random()*(this.width - 1));
    var y = Math.floor(Math.random()*(this.height - 1));

    if (!this.isBomb(x, y)){
      this.setField(x, y, {
        bomb: true,
        visible: false,
        count: -1
      });
      bombsLeft--;
    }   

  }
}
MineSweeper.prototype.setNeighbours = function() {
  this.each(function(item, x, y){

    if (!item.bomb){
      this.setField(x, y, {
        bomb: false,
        count: this.countNeighbors(x, y),
        visible: false,
        flag: false
      })
    }

  }.bind(this))
}
MineSweeper.prototype.countNeighbors = function(x, y) {
  var bombs = 0;
  
  for (var i = -1; i <= 1; i++){
    for (var j = -1; j <= 1; j++){

      if (this.isBomb(x + j, y + i)){
        bombs++;
      } 
    }
  }

  return bombs;
}
MineSweeper.prototype.isBomb = function(x, y) {
  if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1){
    return false;
  }
  return this.field[y][x].bomb === true;
}

MineSweeper.prototype.setField = function(x, y, val) {
  return this.field[y][x] = val;
}

MineSweeper.prototype.reveal = function(x, y) {  
  this.field[y][x].visible = true;  
}
MineSweeper.prototype.toggleFlag = function(x, y) {
  this.field[y][x].flag = !this.field[y][x].flag;
}
MineSweeper.prototype.revealEmpty = function(x, y) {
  var coords = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1,-1], [1,1],[-1,1],[1,-1]]
  for (var t = 0; t < coords.length; t++){

    var xx = x+coords[t][1];
    var yy = y+coords[t][0];

    if (xx < 0 || xx > this.width - 1 || yy < 0 || yy > this.height - 1) continue;

    if (!this.field[yy][xx].bomb && !this.field[yy][xx].visible){
      this.reveal(xx, yy);
      if (this.field[yy][xx].count === 0){
        this.revealEmpty(xx, yy);
      }
    } 
  }
}

MineSweeper.prototype.draw = function() {

  ctx.clearRect(0,0, canvas.width, canvas.height);

  this.each(function(item, x, y) {

    if (item.flag){
      ctx.drawImage(img, 128 * 1, 128 * 0, 128, 128,
                    x * SIZE, y * SIZE, SIZE, SIZE);

    } else if (!item.visible) {
      ctx.drawImage(img, 128 * 0, 128 * 0, 128, 128,
                    x * SIZE, y * SIZE, SIZE, SIZE);
    } else if (item.bomb){
      ctx.drawImage(img, 128 * 2, 128 * 0, 128, 128,
                    x * SIZE, y * SIZE, SIZE, SIZE);

    } else {

      if (item.count > 0) {
        var row = 1 + Math.floor((item.count - 1) / 4);
        var col = (item.count - 1) % 4;

        ctx.drawImage(img, 128 * col, 128 * row, 128, 128,
                      x * SIZE, y * SIZE, SIZE, SIZE);

      } else if (item.count === 0){
        ctx.drawImage(img, 128 * 3, 128 * 0, 128, 128,
                      x * SIZE, y * SIZE, SIZE, SIZE);
      }

    }

  }.bind(this))      

  var frame = requestAnimationFrame(this.draw.bind(this));
}

canvas.addEventListener('contextmenu', function(e) {
  var y = Math.floor(e.offsetY / SIZE);
  var x = Math.floor(e.offsetX / SIZE);
 
  e.preventDefault();

  if (!game1.field[y][x].visible){
    game1.toggleFlag(x, y);
  }

})

canvas.addEventListener('click', function(e) {

  var y = Math.floor(e.offsetY / SIZE);
  var x = Math.floor(e.offsetX / SIZE);

  if (game1.field[y][x].flag) return;

  if (game1.isBomb(x, y)){
    game1.each(function(item, x, y){
      game1.reveal(x, y);
    })
    alert('YOU DIE');
  } else if (game1.field[y][x].count > 0){
    game1.reveal(x, y);
  } else if (game1.field[y][x].count === 0){
    game1.reveal(x, y);
    game1.revealEmpty(x, y);
  }

  var hidden = 0;

  game1.each(function(item, x, y) {
    if (!item.visible) hidden++
  }.bind(game1))

  if (hidden === game1.bombsCount) {
    alert('you win');

    game1.each(function(item, x, y) {
      item.visible = true;
    }.bind(game1))
  }


})

var game1 = new MineSweeper(10, 10, 10);