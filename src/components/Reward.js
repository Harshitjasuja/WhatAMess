import React, { Component } from "react";
import { motion } from "framer-motion";
import "./Reward.css";
import { FaAward } from "react-icons/fa";

class Reward extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coins: 0,
    };
  }
  componentDidUpdate(prevProps) {
    if ((prevProps.completedDeliveries || 0) !== (this.props.completedDeliveries || 0)) {
      this.earnReward();
    }
  }
  

  earnReward = () => {
    this.setState((prevState) => ({
      coins: prevState.coins + 1,
    }));
  };

  render() {
    return (
      <div className="reward-container">
        {/* Animated Fireworks Background */}
        <motion.div
          className="fireworks"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              className="firework"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0.5, 1.5, 0], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.5 }}
            />
          ))}
        </motion.div>
        
        <motion.div
          className="reward-card"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="medal-icon"
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1.5, rotate: 15 }}
            transition={{ duration: 0.6, yoyo: Infinity }}
          >
            <FaAward size={150} color="#FFD700" style={{ filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 1))" }} />
          </motion.div>
          <h2 className="congrats-text">🎉 Congratulations! 🎉</h2>
          <p className="reward-count">Rewards : {this.state.coins}</p>
        </motion.div>
      </div>
    );
  }
}

export default Reward;
