import React, { useState } from 'react';
import './DatePicker.css';

const DatePicker = ({ onSubmit, onClose, initialDate }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('DatePicker - Submitting date:', selectedDate);
    onSubmit(selectedDate);
  };

  return (
    <div className="date-picker-container">
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />
        <div className="button-group">
          <button type="submit">Add date</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default DatePicker;