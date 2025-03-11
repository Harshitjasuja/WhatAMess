import React from "react";
import "./MessCard.css";
import mess1 from "./mess1.jpg";
import mess2 from "./mess2.jpg";
import mess3 from "./mess3.jpg";

const messData = [
  { image: mess1, name: "Jo Paaji" },
  { image: mess2, name: "Jasuja’s Kitchen" },
  { image: mess3, name: "Sheetal Rasoi" },
];

const MessCard = () => {
  return (
    <div className="mess-container">
      {messData.map((mess, index) => (
        <div key={index} className="mess-card">
          <img src={mess.image} alt={mess.name} className="mess-card-image" />
          <h3 className="mess-card-name">{mess.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default MessCard;
