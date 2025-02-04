/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

class Tile {
  constructor() {
    this.letter = this.chooseLetter();
  }

  chooseLetter() {
    const letterFrequencies = [[null,'E','T','A','O','I','N','S','R','H','D',
    'L','U','C','M','F','Y','W','G','P','B','V','K','X','Q','J','Z'],
  [0,12.02,21.12,29.24,36.92,44.23,51.18,57.46,63.48,69.40,73.72,77.70,80.58,
    83.29,5.90,88.20,90.31,92.40,94.43,96.25,97.74,98.85,99.54,99.71,99.82,
    99.92,100]];

    let randomNum = (Math.random() * 100).toFixed(2);
    for (let i = 1; i < letterFrequencies[1].length; i++) {
      if (randomNum <= letterFrequencies[1][i] && randomNum > letterFrequencies[1][i-1]) {
        return letterFrequencies[0][i];
      }
    }
  }
}

module.exports = Tile;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const View = __webpack_require__(2);

$(function () {
  const rootEl = ".word-game";
  new View(rootEl);
});


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Game = __webpack_require__(3);

class View {
  constructor($el) {
    this.$el = $el;
    this.string = "";
    this.wordForm = $(".word-form");
    let dictionary;
    $.get("https://s3-us-west-1.amazonaws.com/virginia-wordgame/AllWords.txt", (txt) => {
      dictionary = txt.split("\n");
    }).then((dict) => {
      this.game = new Game(dictionary);
      this.setupBoard();
    });

    this.interval = window.setInterval(this.step.bind(this), this.stepMillis());

    $(".string").focus();
    this.gamePlay = document.getElementById("gamePlay");
    this.gameOver = document.getElementById("gameOver");

    $("#word-form").submit((e) => this.handleSubmit(e));

    $(window).on("keydown", this.handleEnter.bind(this));
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // faster speed of moving tiles with increasing score
  descendingInterval() {
    clearInterval(this.interval);
    this.interval = window.setInterval(this.step.bind(this), this.stepMillis());
  }

  stepMillis() {
    if (!this.game) {
      return 7000;
    } else if (this.game.score <= 265) {
      return -20 * this.game.score + 7000;
    } else {
      return 1700;
    }
  }

  // submit the form if Enter is pressed
  handleEnter(e) {
    if (e.keyCode === 13) {
      if (document.getElementById("intro")) {
        this.startGame();
      } else {
        if (document.getElementById("replay") === null) {
          e.preventDefault();
          $("#word-form").submit();
        } else {
          e.preventDefault();
          location.reload();
        }
      }
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.string = $("input:first").val().toUpperCase();
    if (this.game.board.validWord(this.string)) {
      this.game.handleWord(this.string);
      this.render();
      this.string = "";
      let form = document.getElementById("word-form");
      form.reset();
      let $score = document.getElementById("score");
      $($score).attr("data-score", this.game.score);
      parent.window.bubble_fn_score(this.game.score);
    } else {
      document.getElementById("word-input").style.outline = "#FF0015 solid thick";
      this.game.badWord.play();
      setTimeout(() => (document.getElementById("word-input").style.outline = "none"), 200);
    }
  }

  handleCharacter(e) {
    e.preventDefault();
    this.string = e.target.value;
    // check if the new character is in the list of letters on the screen.
    // If it is, turn that tile green. If it's not, give an alert/indicator
    let lastChar = this.string.charAt(this.string.length - 1);
    this.board.handleLetter(lastChar);
  }

  setupBoard() {
    // setting up the tiles grid
    const $ul = $("<ul>");
    $ul.attr("id", "all-tiles");

    for (let rowIdx = 0; rowIdx < this.game.board.height; rowIdx++) {
      for (let colIdx = 0; colIdx < this.game.board.width; colIdx++) {
        let $li = $("<li>");
        $li.data("pos", [rowIdx, colIdx]);
        if (this.game.board.grid[rowIdx][colIdx]) {
          $li.attr("data-letter", this.game.board.grid[rowIdx][colIdx].letter);
          $li.addClass("tile");
        }

        $ul.append($li);
      }
    }

    $(this.$el).append($ul);

    // adding the bar to the left of the tiles
    const $ledge = $("<div>");
    $ledge.attr("id", "ledge");
    $(this.$el).append($ledge);

    // introductory box
    const $intro = $(
      "<div><h1>INSTRUCTIONS</h1><p>Type out words using the letters on the screen. Use the letters before they hit the red bar. Words are 3 letters minimum, and longer words earn you more points. The higher your score, the faster the tiles move. Good luck!</p></div>"
    );
    $intro.attr("id", "intro");
    const $start = $("<button id='start'>START</button>");
    $start.click(this.startGame);
    $intro.append($start);
    $(this.$el).append($intro);
  }

  startGame() {
    let $intro = document.getElementById("intro");
    $intro.remove();

    let $cover = document.getElementById("cover");
    $cover.remove();

    let $input = document.getElementById("word-input");
    $input.focus();
  }

  render() {
    let $ul2 = document.getElementById("all-tiles");
    $ul2.remove();

    const $ul = $("<ul>");
    $ul.attr("id", "all-tiles");
    for (let rowIdx = 0; rowIdx < this.game.board.height; rowIdx++) {
      for (let colIdx = 0; colIdx < this.game.board.width; colIdx++) {
        let $li = $("<li>");
        $li.data("pos", [rowIdx, colIdx]);
        if (this.game.board.grid[rowIdx][colIdx]) {
          $li.attr("data-letter", this.game.board.grid[rowIdx][colIdx].letter);
          $li.addClass("tile");
        }

        $ul.append($li);
      }
    }

    $(this.$el).append($ul);
  }

  step() {
    this.descendingInterval();

    let $intro = document.getElementById("intro");
    if (!$intro) {
      this.game.board.incrementTiles();
      this.render();
      if (this.game.lose()) {
        this.displayLosing();
      }
    }
  }

  displayLosing() {
    clearInterval(this.interval);
    this.gameOver.play();

    let $form = document.getElementById("word-form");
    $form.remove();

    const $ul = $("<ul>");
    $ul.attr("id", "game-over");
    $ul.text("GAME OVER");

    $(this.$el).append($ul);

    const $replay = $("<ul><button id='replay' onclick='parent.window.bubble_fn_reset()'>PLAY AGAIN!</button></ul>");
    $replay.attr("id", "replay");

    setTimeout(() => $(this.$el).append($replay), 1000);

    parent.window.bubble_fn_score(this.game.score);
  }
}

module.exports = View;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const Board = __webpack_require__(4);
const Tile = __webpack_require__(0);

class Game {

  constructor(dictionary) {
    this.board = new Board(10,4);
    this.score = 0;
    this.dict = dictionary;

    this.goodWord = document.getElementById("goodWord");
    this.badWord = document.getElementById("badWord");

  }

  // check the submitted word against a dictionary. If the word exists,
  // clear its letters from the screen and add points to the player's score.
  handleWord(word) {
    if (this.dict.includes(word.toLowerCase()) && word.length >= 3 &&
      this.board.validWord(word)) {
        this.incrementScore(word);
        this.board.clearWord(word);
        this.goodWord.play();
    } else {
      document.getElementById("word-input").style.outline = '#FF0015 solid thick';
      this.badWord.play();
      setTimeout(() => document.getElementById("word-input").style.outline = 'none', 200);

    }
  }

  incrementScore(word) {
    if (word.length === 3) {
      this.score += 5;
    } else if (word.length === 4) {
      this.score += 10;
    } else if (word.length === 5) {
      this.score += 15;
    } else if (word.length === 6) {
      this.score += 25;
    } else if (word.length === 7) {
      this.score += 35;
    } else if (word.length === 8) {
      this.score += 45;
    } else if (word.length === 9) {
      this.score += 60;
    } else {
      this.score += 70;
    }
  }

  lose() {
    if ((this.board.grid[0][0] !== null) || (this.board.grid[1][0] !== null)
      || (this.board.grid[2][0] !== null)) {
        return true;
      }
    return false;
  }

}

module.exports = Game;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const Tile = __webpack_require__(0);

class Board {
  constructor(x,y) {
    this.width = x;
    this.height = y;
    this.grid = [];
    for (let i = 0; i < this.height; i++) {
      this.grid.push(new Array(x).fill(null));
    }
    this.initializeTiles();

  }

  initializeTiles() {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = (this.grid[0].length/2)+2; j < this.grid[0].length; j++) {
        let tile = new Tile();
        this.grid[i][j] = tile;
      }
    }
  }

  incrementTiles() {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i].shift();
      this.grid[i].push(new Tile());
    }
  }

  // updates the tile's class to "selected" if the letter exists in the
  // letters shown on the screen and has not yet been selected. Returns
  // an error if the letter can't be found
  handleLetter(letter) {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[0].length; j++) {
        if (this.grid[i][j].letter === letter ) { // NOTE: AND class != selected
          // change the tile's class to selected, then break
        }
      }
    }
    // give an error
  }

  // returns true if all the letters for the word are on the screen
  validWord(word) {
    let wordLetters= {};
    for (let i = 0; i < word.length; i++) {
      let letter = word[i];
      if (!wordLetters[letter]) {
        wordLetters[letter] = 1;
      } else {
        wordLetters[letter] += 1;
      }
    }

    let counter = word.length;
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[0].length; j++) {
        if (this.grid[i][j]) {
          let letter = this.grid[i][j].letter;
          if (wordLetters[letter] && wordLetters[letter] !== 0) {
            wordLetters[letter] -= 1;
            counter -= 1;
            if (counter === 0) return true;
          }
        }
      }
    }
    return false;
  }

  // clear the letters of the word from the list of letters on the screen
  clearWord(word) {
    let tempWord = word;
    tempWord = tempWord.toUpperCase().split('');
    tempWord.forEach((el) => {
      let removed = false;
      for (let i = 0; i < this.grid[0].length; i++) {
        for (let j = 0; j < this.grid.length; j++) {
          if (!removed && this.grid[j][i]) {
            if (this.grid[j][i].letter === el) {
              this.grid[j][i] = null;
              removed = true;
            }
          }
        }
      }
    });
  }

}

module.exports = Board;


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map