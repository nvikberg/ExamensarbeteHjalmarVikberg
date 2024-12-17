import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/homepage.css";

interface Item {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const Homepage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // hämta data från databas, endast tillfälligt
    const fetchData = async () => {
      const mockData: Item[] = [
        { id: 1, title: "Objekt 1", description: "Beskrivning 1", imageUrl: "https://via.placeholder.com/150" },
        { id: 2, title: "Objekt 2", description: "Beskrivning 2", imageUrl: "https://via.placeholder.com/150" },
        { id: 3, title: "Objekt 3", description: "Beskrivning 3", imageUrl: "https://via.placeholder.com/150" },
        { id: 4, title: "Objekt 4", description: "Beskrivning 4", imageUrl: "https://via.placeholder.com/150" },
      ];
    };

    fetchData();
  }, []);

  return (
    <div className="homepage-container">
      <h1>Välkommen till Hem</h1>
      <div className="grid-container">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid-item"
            onClick={() => navigate(`/board/${item.id}`)}
          >
            <img src={item.imageUrl} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
