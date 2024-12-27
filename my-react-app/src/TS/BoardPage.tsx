import React from "react";
import { useParams } from "react-router-dom";
import Lists from "./Lists";

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { boardname } = useParams<{ boardname: string }>();

  if (!boardId) {
    return <p>Board not found</p>;
  }

  return (
    <div>
      <h1>Board Name: {boardname}</h1>
      <Lists boardId={boardId} />
    </div>
  );
};

export default Board;

