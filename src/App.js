import React, { useEffect, useState } from "react";
import axios from "axios";
import Board from "./Components/Board/Board";
import Editable from "./Components/Editabled/Editable";
import "./App.css";

function App() {
  const [boards, setBoards] = useState([]);
  const [targetCard, setTargetCard] = useState({
    bid: "",
    cid: "",
  });

  const dragEntered = (bid, cid) => {
    setTargetCard({
      bid,
      cid,
    });
  };

  
  const dragEnded = async (bid, cid) => {
    if (!targetCard.bid || !targetCard.cid) {
      // Invalid target, clear and return
      setTargetCard({ bid: "", cid: "" });
      return;
    }

    // Find the source and target boards
    const sourceBoard = boards.find(board => board.cards.some(card => card.id === cid));
    const targetBoard = boards.find(board => board.id === targetCard.bid);

    if (!sourceBoard || !targetBoard) {
      // Invalid source or target, clear and return
      setTargetCard({ bid: "", cid: "" });
      return;
    }

    // Find the source card and remove it
    const sourceCardIndex = sourceBoard.cards.findIndex(card => card.id === cid);
    const sourceCard = sourceBoard.cards[sourceCardIndex];
    sourceBoard.cards.splice(sourceCardIndex, 1);

    // Add the source card to the target board
    targetBoard.cards.push(sourceCard);

    // Update backend
    try {
      await axios.put(`https://kanban-board-backend-myxe.onrender.com/api/boards/${sourceBoard.id}`, { cards: sourceBoard.cards });
      await axios.put(`https://kanban-board-backend-myxe.onrender.com/api/boards/${targetBoard.id}`, { cards: targetBoard.cards });
    } catch (error) {
      console.error("Error updating boards:", error);
    }

    // Update state and reset target
    setBoards([...boards]);
    setTargetCard({ bid: "", cid: "" });
  };


  
  useEffect(() => {
    axios.get("https://kanban-board-backend-myxe.onrender.com/api/boards")
      .then(response => {
        setBoards(response.data);
      })
      .catch(error => {
        console.error("Error fetching boards:", error);
      });
  }, []);

  const addboardHandler = (name) => {
    axios.post("https://kanban-board-backend-myxe.onrender.com/api/boards", { name })
      .then(response => {
        setBoards([...boards, response.data]);
      })
      .catch(error => {
        console.error("Error creating board:", error);
      });
  };

  const removeBoard = (id) => {
    axios.delete(`https://kanban-board-backend-myxe.onrender.com/api/boards/${id}`)
      .then(() => {
        const updatedBoards = boards.filter(board => board.id !== id);
        setBoards(updatedBoards);
      })
      .catch(error => {
        console.error("Error deleting board:", error);
      });
  };

  const addCardHandler = (id, title) => {
    axios.post(`https://kanban-board-backend-myxe.onrender.com/api/boards/${id}/cards`, { title })
      .then(response => {
        const updatedBoards = [...boards];
        const boardIndex = updatedBoards.findIndex(board => board.id === id);
        updatedBoards[boardIndex].cards.push(response.data);
        setBoards(updatedBoards);
      })
      .catch(error => {
        console.error("Error creating card:", error);
      });
  };

  const removeCard = (bid, cid) => {
    axios.delete(`https://kanban-board-backend-myxe.onrender.com/api/boards/${bid}/cards/${cid}`)
      .then(() => {
        const updatedBoards = [...boards];
        const boardIndex = updatedBoards.findIndex(board => board.id === bid);
        const cardIndex = updatedBoards[boardIndex].cards.findIndex(card => card.id === cid);
        updatedBoards[boardIndex].cards.splice(cardIndex, 1);
        setBoards(updatedBoards);
      })
      .catch(error => {
        console.error("Error deleting card:", error);
      });
  };

  

  const updateCard = (bid, cid, card) => {
    axios.put(`https://kanban-board-backend-myxe.onrender.com/api/boards/${bid}/cards/${cid}`, card)
      .then(() => {
        const updatedBoards = [...boards];
        const boardIndex = updatedBoards.findIndex(board => board.id === bid);
        const cardIndex = updatedBoards[boardIndex].cards.findIndex(card => card.id === cid);
        updatedBoards[boardIndex].cards[cardIndex] = card;
        setBoards(updatedBoards);
      })
      .catch(error => {
        console.error("Error updating card:", error);
      });
  };



  

  return (
    <div className="app">
      <div className="app_nav">
        <h1 className="app_header">Kanban Board</h1>
      </div>
      <div className="app_boards_container">
        <div className="app_boards">
          {boards.map((item) => (
            <Board
              key={item.id}
              board={item}
              addCard={addCardHandler}
              removeBoard={() => removeBoard(item.id)}
              removeCard={removeCard}
              dragEnded={dragEnded}
              dragEntered={dragEntered}
              updateCard={updateCard}
            />
          ))}
          <div className="app_boards_last">
            <Editable
              displayClass="app_boards_add-board"
              editClass="app_boards_add-board_edit"
              placeholder="Enter Board Name"
              text="Add Board"
              buttonText="Add Board"
              onSubmit={addboardHandler}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
