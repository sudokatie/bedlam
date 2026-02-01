import { GameState } from './types';
import { updatePatients, checkPatientSpawn } from './patients';
import { updateStaffMovement, updateStaffAI } from './staff';
import { processAllDiagnosis } from './diagnosis';
import { processAllTreatments } from './treatment';
import { processSalaries } from './economy';
import { SIMULATION_TICK_MS } from './constants';

interface GameLoop {
  start: () => void;
  stop: () => void;
}

export function createGameLoop(
  getState: () => GameState,
  setState: (state: GameState | ((prev: GameState) => GameState)) => void,
  onRender: (state: GameState) => void
): GameLoop {
  let animationFrameId: number | null = null;
  let lastTickTime = 0;
  let running = false;
  
  function tick(currentTime: number): void {
    const state = getState();
    
    // Handle render every frame
    onRender(state);
    
    // Handle simulation tick at fixed interval
    if (!state.paused && !state.gameOver) {
      const tickInterval = SIMULATION_TICK_MS / state.gameSpeed;
      
      if (currentTime - lastTickTime >= tickInterval) {
        lastTickTime = currentTime;
        
        setState((prevState: GameState) => {
          let newState = { ...prevState, tick: prevState.tick + 1 };
          
          // Process in correct order
          newState = checkPatientSpawn(newState, currentTime);
          newState = updatePatients(newState);
          newState = updateStaffMovement(newState);
          newState = updateStaffAI(newState);
          newState = processAllDiagnosis(newState);
          newState = processAllTreatments(newState);
          newState = processSalaries(newState);
          
          // Clean up old notifications (older than 3 seconds)
          newState = {
            ...newState,
            notifications: newState.notifications.filter(
              n => currentTime - n.timestamp < 3000
            ),
          };
          
          return newState;
        });
      }
    }
    
    if (running) {
      animationFrameId = requestAnimationFrame(tick);
    }
  }
  
  function start(): void {
    if (running) return;
    running = true;
    lastTickTime = performance.now();
    animationFrameId = requestAnimationFrame(tick);
  }
  
  function stop(): void {
    running = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
  
  return { start, stop };
}
