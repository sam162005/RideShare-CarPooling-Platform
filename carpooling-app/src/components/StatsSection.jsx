import React from 'react';
import './StatsSection.css';
import { FaCity, FaCarAlt, FaLeaf } from 'react-icons/fa';

const StatsSection = () => {
  const stats = [
    {
      icon: <FaCity />,
      number: '250+',
      title: 'Cities Covered',
      description: 'Spanning across major cities nationwide.',
    },
    {
      icon: <FaCarAlt />,
      number: '1M+',
      title: 'Rides Completed',
      description: 'Trusted by millions every year.',
    },
    {
      icon: <FaLeaf />,
      number: '10K+ Tons',
      title: 'CO₂ Saved',
      description: 'Driving a greener tomorrow.',
    },
  ];

  return (
    <section className="stats-section">
      <h2 className="stats-heading">How it works?</h2>
      <div className="stats-cards">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon-wrapper">
              {item.icon}
            </div>
            <h3 className="stat-number">{item.number}</h3>
            <p className="stat-title">{item.title}</p>
            <p className="stat-description">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
