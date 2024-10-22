"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  TextField,
  Container,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { PlayArrow, Pause, Replay, Delete } from "@mui/icons-material";

// Helper function to format time
const formatTime = (time) => {
  const getSeconds = `0${time % 60}`.slice(-2);
  const minutes = Math.floor(time / 60);
  const getMinutes = `0${minutes % 60}`.slice(-2);
  const getHours = `0${Math.floor(time / 3600)}`.slice(-2);
  return `${getHours} : ${getMinutes} : ${getSeconds}`;
};

// Stopwatch Component
const Stopwatch = ({
  id,
  name,
  time,
  isRunning,
  onDelete,
  onUpdateTotalTime,
  onSave,
}) => {
  const [stopwatchName, setStopwatchName] = useState(name);
  const [stopwatchTime, setStopwatchTime] = useState(time);
  const [running, setRunning] = useState(isRunning);

  // Timer interval for running stopwatch
  useEffect(() => {
    let interval = null;
    if (running) {
      interval = setInterval(() => {
        setStopwatchTime((prevTime) => prevTime + 1);
        onUpdateTotalTime(id, 1); // Update the total time in real-time
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, id, onUpdateTotalTime]);

  // Save the stopwatch when the stopwatch is paused or when the name changes
  useEffect(() => {
    if (!running) {
      onSave(id, stopwatchName, stopwatchTime, running);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopwatchName, stopwatchTime, running]);

  const handleStartPause = () => {
    setRunning(!running);
  };

  const handleReset = () => {
    onUpdateTotalTime(id, -stopwatchTime); // Subtract the total time of this stopwatch
    setStopwatchTime(0);
    setRunning(false);
    onSave(id, stopwatchName, 0, false); // Save the reset state
  };

  return (
    <Card style={styles.stopwatch}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <TextField
            label="Stopwatch Name"
            variant="outlined"
            value={stopwatchName}
            onChange={(e) => setStopwatchName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", fontSize: "2rem", paddingLeft: 2 }}
          >
            {formatTime(stopwatchTime)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={handleStartPause}>
            {running ? <Pause color="primary" /> : <PlayArrow color="primary" />}
          </IconButton>
          <IconButton onClick={handleReset}>
            <Replay color="secondary" />
          </IconButton>
          <IconButton onClick={() => onDelete(id, stopwatchTime)}>
            <Delete color="error" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main App Component
const Home = () => {
  const [stopwatches, setStopwatches] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  // Load data from localStorage when the app loads
  useEffect(() => {
    const savedStopwatches = JSON.parse(localStorage.getItem("stopwatches")) || [];
    const savedTotalTime = JSON.parse(localStorage.getItem("totalTime")) || 0;

    setStopwatches(savedStopwatches);
    setTotalTime(savedTotalTime);
  }, []);

  // Save the updated stopwatch list and total time to localStorage
  const saveStopwatchData = useCallback(
    (id, name, time, isRunning) => {
      const updatedStopwatches = stopwatches.map((sw) =>
        sw.id === id ? { id, name, time, isRunning } : sw
      );
      setStopwatches(updatedStopwatches);
      localStorage.setItem("stopwatches", JSON.stringify(updatedStopwatches));
      localStorage.setItem("totalTime", JSON.stringify(totalTime));
    },
    [stopwatches, totalTime]
  );

  // Add a new stopwatch
  const addStopwatch = () => {
    const newStopwatch = {
      id: stopwatches.length + 1,
      name: `Stopwatch ${stopwatches.length + 1}`,
      time: 0,
      isRunning: false,
    };
    const updatedStopwatches = [...stopwatches, newStopwatch];
    setStopwatches(updatedStopwatches);
    localStorage.setItem("stopwatches", JSON.stringify(updatedStopwatches));
  };

  // Delete a stopwatch and update the total time
  const deleteStopwatch = (id, time) => {
    const updatedStopwatches = stopwatches.filter((sw) => sw.id !== id);
    setStopwatches(updatedStopwatches);
    localStorage.setItem("stopwatches", JSON.stringify(updatedStopwatches));

    // Update the total time
    const newTotalTime = totalTime - time;
    setTotalTime(newTotalTime);
    localStorage.setItem("totalTime", JSON.stringify(newTotalTime));
  };

  // Update the total time when stopwatches are running
  const updateTotalTime = (id, delta) => {
    const newTotalTime = totalTime + delta;
    setTotalTime(newTotalTime);
    localStorage.setItem("totalTime", JSON.stringify(newTotalTime)); // Save total time to localStorage
  };

  return (
    <Container style={styles.container}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Stopwatch App with Real-Time Save
      </Typography>

      <Button variant="contained" color="primary" onClick={addStopwatch} sx={{ mb: 3 }}>
        Add Stopwatch
      </Button>

      <Typography variant="h6" color="textSecondary">
        Total Time: {formatTime(totalTime)}
      </Typography>

      {stopwatches.length === 0 ? (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          No stopwatches added yet!
        </Typography>
      ) : (
        stopwatches.map((sw) => (
          <Stopwatch
            key={sw.id}
            id={sw.id}
            name={sw.name}
            time={sw.time}
            isRunning={sw.isRunning}
            onDelete={deleteStopwatch}
            onUpdateTotalTime={updateTotalTime}
            onSave={saveStopwatchData}
          />
        ))
      )}
    </Container>
  );
};

const styles = {
  container: {
    padding: "30px",
    textAlign: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f4f4",
  },
  stopwatch: {
    margin: "10px 0",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export default Home;