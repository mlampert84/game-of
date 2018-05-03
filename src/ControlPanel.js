import React, { Component } from "react";
import GameBoard from "./GameBoard.js";
import { gliderGun } from "./GliderGun.js";
import { flatGen } from "./FlatGen.js";

class ControlPanel extends Component {
  constructor() {
    super();
    this.state = {
      boardWidth: 100,
      boardHeight: 100,
      simulationSpeed: 300,
      gameBoard: null,
      generation: 0
      //Note: am not including the setInterval variable under state because I want to avoid issues with a-synchronicity. If, for example, a user clicks the Play/Pause button very fast
    };
  }

  componentWillMount() {
    this.makeStart();
    this.toggleSim();
  }

  changeSpeed = speed => {
    console.log("calling changeSpeed");
    this.setState({ simulationSpeed: speed }, () => {
      if (this.timerId != null) {
        clearInterval(this.timerId);
        this.timerId = setInterval(() => {
          this.makeNewGen();
        }, this.state.simulationSpeed);
      }
    });
  };

  toggleSim = () => {
    if (this.timerId == null) {
      this.timerId = setInterval(() => {
        this.makeNewGen();
      }, this.state.simulationSpeed);
    } else {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  };

  /////////////Randomly generates an initial board setup
  makeStart = () => {
    var startingPosition = new Array(this.state.boardHeight);
    for (var y = 0; y < this.state.boardHeight; y++) {
      startingPosition[y] = new Array(this.state.boardWidth);
    }

    for (var y = 0; y < this.state.boardHeight; y++) {
      for (var x = 0; x < this.state.boardWidth; x++) {
        if (Math.random() < 0.2) startingPosition[y][x] = true;
        else startingPosition[y][x] = false;
      }
    }
    this.setState({
      gameBoard: startingPosition,
      generation: 0
    });
  };

  //clears the Board
  clearBoard = () => {
    var newBoard = new Array(this.state.boardHeight);
    for (var i = 0; i < this.state.boardHeight; i++)
      newBoard[i] = new Array(this.state.boardWidth);

    this.setState({
      gameBoard: newBoard,
      generation: 0
    });
  };

  placeCreatureOnBoard = (creature, buffer) => {
    var creatureHeight = Math.max.apply(
      null,
      creature.map(function(elt) {
        return elt[0];
      })
    );
    var creatureWidth = Math.max.apply(
      null,
      creature.map(function(elt) {
        return elt[1];
      })
    );
    // console.log("Creature Width: " + creatureWidth);
    var offsetHeight =
      Math.floor(
        Math.random() *
          Math.max(
            0,
            this.state.boardHeight - buffer[0] - buffer[2] - creatureHeight
          )
      ) + buffer[0];

    var offsetWidth =
      Math.floor(
        Math.random() *
          Math.max(
            0,
            this.state.boardWidth - buffer[1] - buffer[3] - creatureWidth
          )
      ) + buffer[3];

    var creatureOnBoard = creature.map(function([h, w]) {
      return [h + offsetHeight, w + offsetWidth];
    });

    var newBoard = new Array(this.state.boardHeight);
    for (var i = 0; i < this.state.boardHeight; i++) {
      newBoard[i] = new Array(this.state.boardWidth);
      for (var j = 0; j < this.state.boardWidth; j++) newBoard[i][j] = false;
    }

    for (var z = 0; z < creatureOnBoard.length; z++)
      newBoard[creatureOnBoard[z][0]][creatureOnBoard[z][1]] = true;

    this.setState({
      gameBoard: newBoard,
      generation: 0
    });
  };

  makeRPentonimo = () => {
    //coordinates are in: [height,width]
    var rPentonimo = [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]];
    //coordinates are in topwise from height: [height,width]
    var rPentBuffer = [20, 20, 20, 20];
    this.placeCreatureOnBoard(rPentonimo, rPentBuffer);
  };

  makeGliderGun = () => {
    var gliderGunBuffer = [0, 20, 20, 0];
    this.placeCreatureOnBoard(gliderGun, gliderGunBuffer);
  };

  makeFlatGenerator = () => {
    var flatGenBuffer = [0, 30, 0, 0];
    this.placeCreatureOnBoard(flatGen, flatGenBuffer);
  };

  //makes the next interation
  makeNewGen = () => {
    var deaths = [];
    var newLives = [];

    for (var i = 0; i < this.state.boardHeight; i++) {
      for (var j = 0; j < this.state.boardWidth; j++) {
        var neighbors = 0;

        //counts the number of neighbors a cell has, also checking the cell exists
        for (var v = -1; v <= 1; v++) {
          for (var w = -1; w <= 1; w++) {
            if (
              this.state.gameBoard[v + i] != null &&
              this.state.gameBoard[v + i][w + j] != null
            ) {
              if (this.state.gameBoard[v + i][w + j] && !(v === 0 && w === 0))
                neighbors++;
            }
          }
        }

        if ((neighbors < 2 || neighbors > 3) && this.state.gameBoard[i][j])
          deaths.push([i, j]);
        else if (neighbors === 3 && !this.state.gameBoard[i][j])
          newLives.push([i, j]);
      }
    }

    var newBoard = this.state.gameBoard.slice();
    for (var z = 0; z < newLives.length; z++)
      newBoard[newLives[z][0]][newLives[z][1]] = true;
    for (var z = 0; z < deaths.length; z++)
      newBoard[deaths[z][0]][deaths[z][1]] = false;

    this.setState({
      gameBoard: newBoard,
      generation: this.state.generation + 1
    });
  };

  toggleCell = (height, width) => {
    var newBoard = this.state.gameBoard.slice();
    newBoard[height][width] = !newBoard[height][width];
    this.setState({ gameBoard: newBoard });
  };

  render() {
    return (
      <div>
        <div id="gameBoardWrapper">
          <GameBoard
            gameBoard={this.state.gameBoard}
            height={this.state.boardHeight}
            width={this.state.boardWidth}
            toggleCell={this.toggleCell}
          />
        </div>
        <div id="controlPanel">
          <h1>Game of Life</h1>
          <button onClick={this.toggleSim}>Play/Pause</button>
          <button onClick={this.makeNewGen}>One Generation</button>
          <div id="generationView">
            {" "}
            <h3>Generation: {this.state.generation}</h3>
          </div>

          <h2>Reset Options</h2>
          <div>
            <button onClick={this.makeStart}>Random Board</button>
            <button onClick={this.clearBoard}>Clear Board</button>
          </div>
          <div>
            <button onClick={this.makeRPentonimo}>R Pentonimo</button>
            <button onClick={this.makeGliderGun}>Glider Gun</button>
            <button onClick={this.makeFlatGenerator}>Flat Generator</button>
          </div>

          <h2>Speed</h2>
          <button onClick={this.changeSpeed.bind(this, 1000)}>Slow</button>
          <button onClick={this.changeSpeed.bind(this, 300)}>Medium</button>
          <button onClick={this.changeSpeed.bind(this, 10)}>Fast</button>
        </div>
      </div>
    );
  }
}

export default ControlPanel;
