import React, { Component } from "react";

class GameBoard extends Component {
  //Generates the table cellls, adding the "active" class for those cells that are alive
  tableCells = height => {
    var myCells = [];
    for (var i = 0; i < this.props.width; i++) {
      var aliveClass = "";

      if (this.props.gameBoard[height][i]) aliveClass = "active";

      let cellClickHandler = this.props.toggleCell.bind(this, height, i);
      myCells.push(
        <td
          key={"w" + i + "h" + height}
          className={aliveClass}
          onClick={cellClickHandler}
        />
      );
    }
    return myCells;
  };

  tableRows = () => {
    var myRows = [];
    for (var j = 0; j < this.props.height; j++)
      myRows.push(<tr>{this.tableCells(j)}</tr>);

    return myRows;
  };

  render() {
    return (
      <div>
        <table>{this.tableRows()}</table>
      </div>
    );
  }
}

export default GameBoard;
