import React, { Component } from 'react';
import './App.css';


class ControlPanel extends Component{
  constructor(){
    super();
    this.state={
      boardWidth: 100,
      boardHeight: 100,
      simulationSpeed: 300,
      gameBoard: null,
      generation: 0
  //Note: am not including the setInterval variable under state because I want to avoid issues with a-synchronicity. If, for example, a user clicks the Play/Pause button very fast
    };
  };

componentWillMount(){
 this.makeStart();
 this.toggleSim();
};

changeSpeed = (speed) => {
  console.log("calling changeSpeed");
  this.setState({simulationSpeed: speed},
               ()=>{
    if(this.timerId != null){
      clearInterval(this.timerId);
      this.timerId = setInterval(()=>{
      this.makeNewGen();},
      this.state.simulationSpeed);
    }
    });
  };

toggleSim = () => {
  if(this.timerId == null){
    this.timerId = setInterval(()=>{
    this.makeNewGen();
    },this.state.simulationSpeed);
  }

 else{
   clearInterval(this.timerId);
   this.timerId = null;
 }
};


/////////////Randomly generates an initial board setup
makeStart = () => {
 var startingPosition = new Array(this.state.boardHeight);
for(var y=0;y<this.state.boardHeight;y++){
  startingPosition[y] = new Array(this.state.boardWidth);
}

for(var y=0;y<this.state.boardHeight;y++){
  for(var x=0;x<this.state.boardWidth;x++)
  {
    if(Math.random()<.2)
     startingPosition[y][x] = true;
    else
     startingPosition[y][x] = false;
  }

}
  this.setState({gameBoard: startingPosition,
                 generation: 0});
};

//clears the Board
clearBoard = () => {

  var newBoard = new Array(this.state.boardHeight);
  for(var i=0;i<this.state.boardHeight;i++)
    newBoard[i] = new Array(this.state.boardWidth);

  this.setState({gameBoard: newBoard,
                 generation: 0});

};


placeCreatureOnBoard = (creature,buffer) => {
  var creatureHeight = Math.max.apply(null,creature.map(function(elt){return elt[0];}));
   var creatureWidth = Math.max.apply(null,creature.map(function(elt){return elt[1];}));
   console.log("Creature Width: " + creatureWidth);
  var offsetHeight = Math.floor(Math.random()*(Math.max(0,this.state.boardHeight-buffer[0]-buffer[2] - creatureHeight)))+buffer[0];

    var offsetWidth = Math.floor(Math.random()*(Math.max(0,this.state.boardWidth-buffer[1]-buffer[3]-creatureWidth)))+buffer[3];

  var creatureOnBoard = creature.map(function([h,w]){return [h+offsetHeight,w+offsetWidth];});

 var newBoard = new Array(this.state.boardHeight);
  for(var i=0;i<this.state.boardHeight;i++){
    newBoard[i] = new Array(this.state.boardWidth);
    for(var j=0;j<this.state.boardWidth;j++)
      newBoard[i][j]=false;
  }

  for(var z=0;z<creatureOnBoard.length;z++)
    newBoard[creatureOnBoard[z][0]][creatureOnBoard[z][1]]=true;

  this.setState({gameBoard: newBoard,
                 generation: 0});

};

makeRPentonimo = () => {
  //coordinates are in: [height,width]
  var rPentonimo = [[0,1],[0,2],[1,0],[1,1],[2,1]];
  //coordinates are in topwise from height: [height,width]
  var rPentBuffer = [20,20,20,20];
  this.placeCreatureOnBoard(rPentonimo,rPentBuffer);
};

makeGliderGun = () => {
  var gliderGun = [[0,24],[1,22],[1,24],[2,12],[2,13],[2,20],[2,21],[2,34],[2,35],[3,11],[3,15],[3,20],[3,21],[3,34],[3,35],[4,0],[4,1],[4,10],[4,16],[4,20],[4,21],[5,0],[5,1],[5,10],[5,14],[5,16],[5,17],[5,22],[5,24],[6,10],[6,16],[6,24],[7,11],[7,15],[8,12],[8,13]];
  var gliderGunBuffer = [0,20,20,0];
  this.placeCreatureOnBoard(gliderGun,gliderGunBuffer)
};

makeFlatGenerator = () => {
  var flatGen = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,9],[0,10],[0,11],[0,12],[0,13],[0,17],[0,18],[0,19],[0,26],[0,27],[0,28],[0,29],[0,30],[0,31],[0,32],[0,34],[0,35],[0,36],[0,37],[0,38]];
   var flatGenBuffer = [0,30,0,0];
   this.placeCreatureOnBoard(flatGen,flatGenBuffer);
};

//makes the next interation
makeNewGen = () => {

  var deaths = [];
  var newLives = [];

  for(var i=0;i<this.state.boardHeight;i++){
    for(var j=0;j<this.state.boardWidth;j++){
      var neighbors=0;

      //counts the number of neighbors a cell has, also checking the cell exists
      for(var v=(-1);v<=1;v++){
        for(var w=(-1);w<=1;w++){
          if(this.state.gameBoard[(v+i)] != null
             && this.state.gameBoard[(v+i)][(w+j)] != null
             ){
           if(this.state.gameBoard[(v+i)][(w+j)] && (!(v===0&&w===0)))
            neighbors ++;

          }
        }
      }

    if((neighbors<2 || neighbors>3) && this.state.gameBoard[i][j])
      deaths.push([i,j]);
    else if((neighbors === 3) && !this.state.gameBoard[i][j])
      newLives.push([i,j]);

    }
  }

  var newBoard = this.state.gameBoard.slice();
  for(var z=0;z<newLives.length;z++)
    newBoard[newLives[z][0]][newLives[z][1]]=true;
  for(var z=0;z<deaths.length;z++)
    newBoard[deaths[z][0]][deaths[z][1]]=false;

  this.setState({gameBoard: newBoard,
                 generation: this.state.generation + 1 });
};

toggleCell = (height,width) => {
  var newBoard = this.state.gameBoard.slice();
  newBoard[height][width]=!newBoard[height][width];
  this.setState({gameBoard: newBoard});

};

render(){

  return <div>
    <div id='gameBoardWrapper'><GameBoard
                gameBoard={this.state.gameBoard}
                height={this.state.boardHeight}
                width ={this.state.boardWidth}
           toggleCell={this.toggleCell}/></div>
    <div id="controlPanel">
      <h1>Game of Life</h1>
      <button onClick={this.toggleSim}>Play/Pause</button>
      <button onClick={this.makeNewGen}>One Generation</button>
    <div id="generationView"> <h3>Generation: {this.state.generation}</h3></div>

    <h2>Reset Options</h2>
    <div><button onClick={this.makeStart}>Random Board</button>
    <button onClick={this.clearBoard}>Clear Board</button>
      </div>
     <div>
    <button onClick={this.makeRPentonimo}>R Pentonimo</button>
    <button onClick={this.makeGliderGun}>Glider Gun</button>
    <button onClick={this.makeFlatGenerator}>Flat Generator</button>
      </div>


    <h2>Speed</h2>
    <button onClick={this.changeSpeed.bind(this,1000)}>Slow</button>
    <button onClick={this.changeSpeed.bind(this,300)}>Medium</button>
    <button onClick={this.changeSpeed.bind(this,10)}>Fast</button>
    </div>
            </div>

}

}


class GameBoard extends Component{
  constructor(){
    super();
  };


//Generates the table cellls, adding the "active" class for those cells that are alive
tableCells =  (height) => {
    var myCells = [];
    for(var i=0;i<this.props.width;i++){
      var aliveClass = "";

       if(this.props.gameBoard[height][i])
        aliveClass = "active";

       let cellClickHandler = this.props.toggleCell.bind(this,height,i);
       myCells.push(<td key={"w"+i+"h"+height}
                       className={aliveClass}
                       onClick={cellClickHandler}
                          ></td>);
    }
  return myCells;
 };

tableRows = () =>{
  var myRows = [];
  for(var j=0;j<this.props.height;j++)
    myRows.push(<tr>{this.tableCells(j)}</tr>);

  return myRows;

};


  render(){
    return  <div><table>{this.tableRows()}</table></div>
  }

}

class App extends Component{
 render(){
   return <ControlPanel/>
 };
}

export default App;
