import React, { useState } from 'react';
import './HistoryBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const HistoryBar = () => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100 arası slider değeri

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="history-bar-container">
      <div className="start-time-select">
        <label>Başlangıç:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
      </div>

      <div className="end-time-select">
        <label>Bitiş:</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
      </div>

      <div className="speed-select">
        <label>Hız:</label>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
          <option value={1}>x1</option>
          <option value={2}>x2</option>
          <option value={4}>x4</option>
          <option value={8}>x8</option>
        </select>
      </div>

      <div className="play-bar">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={e => setProgress(Number(e.target.value))}
        />
        <button onClick={togglePlay}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
      </div>
    </div>
  );
};

export default HistoryBar;
