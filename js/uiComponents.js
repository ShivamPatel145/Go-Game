/**
 * =============================================================================
 * UI COMPONENTS MODULE - User Interface and Rendering
 * =============================================================================
 *
 * This module handles all user interface elements and visual rendering:
 * - Canvas-based board rendering with visual effects
 * - Mouse event handling for user interactions
 * - Game status display and updates
 * - Control panel management
 * - Visual feedback and animations
 * - Responsive design and layout management
 *
 * Key UI Components:
 * - Game Board Canvas: Interactive playing surface
 * - Status Displays: Current player, score, game state
 * - Control Panels: Settings, statistics, game controls
 * - Hover Effects: Visual feedback for move preview
 */

// =============================================================================
// UI STATE AND CONFIGURATION
// =============================================================================

/**
 * Canvas and rendering context
 * These are the main elements for drawing the game board
 */
let canvas; // HTML5 Canvas element for the game board
let ctx; // 2D rendering context for drawing operations

/**
 * DOM element references for efficient UI updates
 * Cached to avoid repeated DOM queries
 */
let uiElements = {
  // Game status elements
  currentPlayer: null, // Shows whose turn it is
  gameScore: null, // Displays current score
  aiStats: null, // Shows AI performance metrics

  // Control elements
  boardSizeSelector: null, // Dropdown for board size selection
  passButton: null, // Button to pass turn
  resetButton: null, // Button to start new game

  // Settings elements
  algorithmRadios: null, // Radio buttons for AI algorithm selection
  depthSlider: null, // Slider for AI search depth
  depthValue: null, // Display for current depth value
  gameModeRadios: null, // Radio buttons for game mode selection
};

/**
 * Hover preview state for move visualization
 * Provides visual feedback when user hovers over board
 */
let hoverPreview = {
  row: -1, // Current hover row (-1 if no hover)
  col: -1, // Current hover column (-1 if no hover)
  isVisible: false, // Whether preview should be displayed
  player: EMPTY, // Which player's stone to preview
};

/**
 * Visual styling configuration for the board
 * Centralized styling makes it easy to customize appearance
 */
const visualConfig = {
  // Board appearance
  boardColors: {
    background: "#D4A574", // Light honey wood
    backgroundGradient: [
      // Wood grain gradient stops
      { stop: 0, color: "#D4A574" }, // Light honey
      { stop: 0.3, color: "#C19A6B" }, // Medium honey
      { stop: 0.6, color: "#CD853F" }, // Peru/darker wood
      { stop: 1, color: "#B8860B" }, // Dark golden wood
    ],
    gridLines: "#654321", // Dark brown for grid
    starPoints: "#2F1B14", // Very dark brown for star points
  },

  // Stone appearance
  stones: {
    black: {
      fill: "#1a1a1a", // Nearly black
      stroke: "#000000", // Pure black border
      shadowColor: "rgba(0,0,0,0.4)",
    },
    white: {
      fill: "#f8f8f8", // Nearly white
      stroke: "#cccccc", // Light gray border
      shadowColor: "rgba(0,0,0,0.3)",
    },
    preview: {
      opacity: 0.6, // Semi-transparent for hover
      pulseEffect: true, // Whether to animate preview
    },
  },

  // Layout and sizing
  layout: {
    stoneRadius: 12, // Base stone radius
    starPointRadius: 4, // Radius of star point markers
    gridLineWidth: 2, // Thickness of grid lines
    shadowBlur: 3, // Stone shadow blur amount
    hoverTolerance: 15, // Mouse distance tolerance for hover
  },
};

// =============================================================================
// INITIALIZATION AND DOM SETUP
// =============================================================================

/**
 * Initialize the user interface
 * Sets up all DOM references and initial state
 * Should be called once when the page loads
 */
function initializeUI() {
  console.log("Initializing UI components...");

  // Get canvas and context for board rendering
  canvas = document.getElementById("gameBoard");
  if (!canvas) {
    console.error("Game board canvas not found!");
    return false;
  }

  ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Could not get 2D rendering context!");
    return false;
  }

  // Cache DOM element references for efficiency
  cacheDOMElements();

  // Set up event listeners for user interactions
  setupEventListeners();

  // Perform initial UI update
  updateAllUI();

  // Draw the initial empty board
  drawBoard();

  console.log("UI initialization complete");
  return true;
}

/**
 * Cache references to frequently accessed DOM elements
 * This improves performance by avoiding repeated document.getElementById calls
 */
function cacheDOMElements() {
  // Game status displays
  uiElements.currentPlayer = document.getElementById("currentPlayer");
  uiElements.gameScore = document.getElementById("gameScore");
  uiElements.aiStats = document.getElementById("aiStats");

  // Game controls
  uiElements.boardSizeSelector = document.getElementById("boardSize");
  uiElements.passButton = document.getElementById("pass");
  uiElements.resetButton = document.getElementById("reset");

  // AI settings
  uiElements.algorithmRadios = document.querySelectorAll(
    'input[name="algorithm"]'
  );
  uiElements.depthSlider = document.getElementById("depth");
  uiElements.depthValue = document.getElementById("depthValue");
  uiElements.gameModeRadios = document.querySelectorAll(
    'input[name="gameMode"]'
  );

  // Log any missing elements for debugging
  for (const [key, element] of Object.entries(uiElements)) {
    if (!element || element.length === 0) {
      console.warn(`UI element not found: ${key}`);
    }
  }
}

/**
 * Set up all event listeners for user interface interactions
 * Centralizes event handling logic for easier maintenance
 */
function setupEventListeners() {
  // Canvas interactions for game moves
  if (canvas) {
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvas.addEventListener("mouseleave", handleCanvasMouseLeave);

    // Prevent context menu on right-click
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // Game control buttons
  if (uiElements.passButton) {
    uiElements.passButton.addEventListener("click", handlePassButtonClick);
  }

  if (uiElements.resetButton) {
    uiElements.resetButton.addEventListener("click", handleResetButtonClick);
  }

  // Board size selection
  if (uiElements.boardSizeSelector) {
    uiElements.boardSizeSelector.addEventListener(
      "change",
      handleBoardSizeChange
    );
  }

  // AI algorithm selection
  uiElements.algorithmRadios.forEach((radio) => {
    radio.addEventListener("change", handleAlgorithmChange);
  });

  // AI depth setting
  if (uiElements.depthSlider) {
    uiElements.depthSlider.addEventListener("input", handleDepthChange);
  }

  // Game mode selection
  uiElements.gameModeRadios.forEach((radio) => {
    radio.addEventListener("change", handleGameModeChange);
  });

  console.log("Event listeners set up successfully");
}

// =============================================================================
// BOARD RENDERING AND VISUAL EFFECTS
// =============================================================================

/**
 * Main board drawing function
 * Renders the complete game board with all visual elements
 * This is called whenever the board needs to be redrawn
 */
function drawBoard() {
  if (!canvas || !ctx) {
    console.error("Canvas or context not available for drawing");
    return;
  }

  // Calculate layout dimensions
  const layout = calculateBoardLayout();

  // Clear and prepare canvas
  clearCanvas();

  // Draw background with wood grain effect
  drawBackground(layout);

  // Draw grid lines
  drawGrid(layout);

  // Draw star points (handicap markers)
  drawStarPoints(layout);

  // Draw all stones on the board
  drawStones(layout);

  // Draw hover preview if active
  if (hoverPreview.isVisible) {
    drawHoverPreview(layout);
  }
}

/**
 * Calculate board layout dimensions based on canvas size
 * Returns an object with all layout measurements
 *
 * @returns {Object} Layout configuration object
 */
function calculateBoardLayout() {
  const canvasSize = Math.min(canvas.width, canvas.height);
  const cellSize = canvasSize / (BOARD_SIZE + 1); // Add padding
  const margin = cellSize;
  const boardWidth = (BOARD_SIZE - 1) * cellSize;

  return {
    canvasSize,
    cellSize,
    margin,
    boardWidth,
    stoneRadius: Math.min(cellSize * 0.4, visualConfig.layout.stoneRadius),
  };
}

/**
 * Clear the entire canvas
 */
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw the wooden board background with grain texture
 *
 * @param {Object} layout - Layout configuration
 */
function drawBackground(layout) {
  // Create realistic wood grain gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  visualConfig.boardColors.backgroundGradient.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle wood grain texture
  ctx.globalAlpha = 0.1;

  // Vertical grain lines
  for (let i = 0; i < canvas.width; i += 20) {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(i, 0, 2, canvas.height);
  }

  // Horizontal grain lines
  for (let i = 0; i < canvas.height; i += 15) {
    ctx.fillStyle = "#A0522D";
    ctx.fillRect(0, i, canvas.width, 1);
  }

  ctx.globalAlpha = 1.0; // Reset opacity
}

/**
 * Draw the grid lines for the Go board
 *
 * @param {Object} layout - Layout configuration
 */
function drawGrid(layout) {
  ctx.strokeStyle = visualConfig.boardColors.gridLines;
  ctx.lineWidth = visualConfig.layout.gridLineWidth;
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 1;

  // Draw vertical and horizontal lines
  for (let i = 0; i < BOARD_SIZE; i++) {
    const pos = layout.margin + i * layout.cellSize;

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(pos, layout.margin);
    ctx.lineTo(pos, layout.margin + layout.boardWidth);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(layout.margin, pos);
    ctx.lineTo(layout.margin + layout.boardWidth, pos);
    ctx.stroke();
  }

  // Reset shadow for other elements
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

/**
 * Draw star points (handicap markers) on the board
 * Star point positions depend on board size
 *
 * @param {Object} layout - Layout configuration
 */
function drawStarPoints(layout) {
  ctx.fillStyle = visualConfig.boardColors.starPoints;

  const starPositions = getStarPointPositions();

  for (const [row, col] of starPositions) {
    const x = layout.margin + col * layout.cellSize;
    const y = layout.margin + row * layout.cellSize;

    ctx.beginPath();
    ctx.arc(x, y, visualConfig.layout.starPointRadius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Get star point positions based on board size
 * Different board sizes have different standard star point patterns
 *
 * @returns {Array} Array of [row, col] positions for star points
 */
function getStarPointPositions() {
  const positions = [];

  if (BOARD_SIZE === 19) {
    // Standard 19x19 star points
    const points = [3, 9, 15];
    for (const row of points) {
      for (const col of points) {
        positions.push([row, col]);
      }
    }
  } else if (BOARD_SIZE === 13) {
    // Standard 13x13 star points
    const points = [3, 6, 9];
    for (const row of points) {
      for (const col of points) {
        positions.push([row, col]);
      }
    }
  } else if (BOARD_SIZE === 9) {
    // Standard 9x9 star points
    positions.push([2, 2], [2, 6], [4, 4], [6, 2], [6, 6]);
  }

  return positions;
}

/**
 * Draw all stones currently on the board
 *
 * @param {Object} layout - Layout configuration
 */
function drawStones(layout) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const stone = game.board[row][col];
      if (stone !== EMPTY) {
        drawStone(layout, row, col, stone, false);
      }
    }
  }
}

/**
 * Draw a single stone at the specified position
 *
 * @param {Object} layout - Layout configuration
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @param {number} stoneColor - BLACK or WHITE
 * @param {boolean} isPreview - Whether this is a hover preview
 */
function drawStone(layout, row, col, stoneColor, isPreview = false) {
  const x = layout.margin + col * layout.cellSize;
  const y = layout.margin + row * layout.cellSize;

  const config =
    stoneColor === BLACK
      ? visualConfig.stones.black
      : visualConfig.stones.white;

  // Set up stone appearance
  if (isPreview) {
    ctx.globalAlpha = visualConfig.stones.preview.opacity;
  }

  // Draw stone shadow
  ctx.shadowColor = config.shadowColor;
  ctx.shadowBlur = visualConfig.layout.shadowBlur;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Draw stone body
  ctx.fillStyle = config.fill;
  ctx.beginPath();
  ctx.arc(x, y, layout.stoneRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Draw stone border
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = config.stroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Reset opacity
  if (isPreview) {
    ctx.globalAlpha = 1.0;
  }
}

/**
 * Draw hover preview stone
 *
 * @param {Object} layout - Layout configuration
 */
function drawHoverPreview(layout) {
  if (hoverPreview.row >= 0 && hoverPreview.col >= 0) {
    // Determine which player's stone to preview
    const previewColor = game.currentPlayer;
    drawStone(layout, hoverPreview.row, hoverPreview.col, previewColor, true);
  }
}

// =============================================================================
// MOUSE EVENT HANDLING
// =============================================================================

/**
 * Handle mouse clicks on the game board
 * Converts screen coordinates to board coordinates and attempts to make a move
 *
 * @param {MouseEvent} event - Mouse click event
 */
function handleCanvasClick(event) {
  if (game.gameOver) {
    console.log("Game is over - click ignored");
    return;
  }

  // Don't allow moves if it's AI's turn
  if (shouldAIMove()) {
    console.log("AI's turn - human click ignored");
    return;
  }

  const coordinates = getMouseBoardCoordinates(event);
  if (!coordinates) return;

  const { row, col } = coordinates;

  console.log(`Human attempts move at (${row}, ${col})`);

  // Attempt to make the move
  const success = makeMove(row, col, game.currentPlayer);

  if (success) {
    // Clear hover preview since move was made
    hoverPreview.isVisible = false;

    // Update UI to reflect the move
    updateAllUI();
    drawBoard();

    // Check if AI should move next
    setTimeout(() => {
      if (shouldAIMove() && !game.gameOver) {
        makeAIMove().then(() => {
          updateAllUI();
          drawBoard();
        });
      }
    }, 300); // Small delay for better UX
  } else {
    console.log("Illegal move attempted");
    // Could add visual feedback for illegal move here
  }
}

/**
 * Handle mouse movement over the board for hover preview
 *
 * @param {MouseEvent} event - Mouse move event
 */
function handleCanvasMouseMove(event) {
  if (game.gameOver || shouldAIMove()) {
    // Hide preview if game over or AI's turn
    if (hoverPreview.isVisible) {
      hoverPreview.isVisible = false;
      drawBoard();
    }
    return;
  }

  const coordinates = getMouseBoardCoordinates(event);

  if (coordinates) {
    const { row, col } = coordinates;

    // Check if this is a new position
    if (hoverPreview.row !== row || hoverPreview.col !== col) {
      // Validate that this would be a legal move
      if (isLegalMove(game.board, row, col, game.currentPlayer)) {
        hoverPreview.row = row;
        hoverPreview.col = col;
        hoverPreview.isVisible = true;
        hoverPreview.player = game.currentPlayer;
        drawBoard(); // Redraw with preview
      } else {
        // Illegal move position - hide preview
        if (hoverPreview.isVisible) {
          hoverPreview.isVisible = false;
          drawBoard();
        }
      }
    }
  } else {
    // Mouse outside valid area
    if (hoverPreview.isVisible) {
      hoverPreview.isVisible = false;
      drawBoard();
    }
  }
}

/**
 * Handle mouse leaving the canvas area
 *
 * @param {MouseEvent} event - Mouse leave event
 */
function handleCanvasMouseLeave(event) {
  if (hoverPreview.isVisible) {
    hoverPreview.isVisible = false;
    drawBoard();
  }
}

/**
 * Convert mouse event coordinates to board grid coordinates
 *
 * @param {MouseEvent} event - Mouse event
 * @returns {Object|null} {row, col} coordinates or null if outside board
 */
function getMouseBoardCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const layout = calculateBoardLayout();

  // Convert to board coordinates
  const boardX = x - layout.margin;
  const boardY = y - layout.margin;

  // Find nearest intersection
  const col = Math.round(boardX / layout.cellSize);
  const row = Math.round(boardY / layout.cellSize);

  // Check if within board bounds
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return null;
  }

  // Check if close enough to intersection
  const exactX = col * layout.cellSize;
  const exactY = row * layout.cellSize;
  const distance = Math.sqrt((boardX - exactX) ** 2 + (boardY - exactY) ** 2);

  if (distance > visualConfig.layout.hoverTolerance) {
    return null;
  }

  return { row, col };
}

// =============================================================================
// UI STATUS UPDATES
// =============================================================================

/**
 * Update all UI elements to reflect current game state
 * This is the main function for keeping the UI in sync with the game
 */
function updateAllUI() {
  updatePlayerStatus();
  updateScoreDisplay();
  updateAIStatsDisplay();
  updateControlStates();
}

/**
 * Update the current player status display
 * Shows whose turn it is and what type of player (Human/AI)
 */
function updatePlayerStatus() {
  if (!uiElements.currentPlayer) return;

  const playerName = game.currentPlayer === BLACK ? "Black" : "White";
  let statusText = "";
  let statusColor = "";

  if (game.gameOver) {
    statusText = "Game Over";
    statusColor = "#e74c3c"; // Red
  } else {
    // Determine player type based on game mode
    switch (aiSettings.gameMode) {
      case "humanVsAi":
        statusText =
          game.currentPlayer === BLACK
            ? `${playerName} (Human) to play`
            : `${playerName} (AI) to play`;
        break;
      case "aiVsHuman":
        statusText =
          game.currentPlayer === BLACK
            ? `${playerName} (AI) to play`
            : `${playerName} (Human) to play`;
        break;
      case "humanVsHuman":
        statusText = `${playerName} (Human) to play`;
        break;
      default:
        statusText = `${playerName} to play`;
    }

    // Color coding for current player
    statusColor = game.currentPlayer === BLACK ? "#27ae60" : "#3498db";
  }

  uiElements.currentPlayer.textContent = statusText;
  uiElements.currentPlayer.style.color = statusColor;
}

/**
 * Update the score display
 * Shows current stone count and captured stones for each player
 */
function updateScoreDisplay() {
  if (!uiElements.gameScore) return;

  // Count stones on board
  const blackStones = game.board.flat().filter((cell) => cell === BLACK).length;
  const whiteStones = game.board.flat().filter((cell) => cell === WHITE).length;

  // Calculate total scores including captures
  const blackTotal = blackStones + game.captured[BLACK];
  const whiteTotal = whiteStones + game.captured[WHITE];

  uiElements.gameScore.textContent = `Black: ${blackTotal} | White: ${whiteTotal}`;

  // Add capture information if any captures have occurred
  if (game.captured[BLACK] > 0 || game.captured[WHITE] > 0) {
    uiElements.gameScore.title =
      `Black: ${blackStones} stones + ${game.captured[BLACK]} captured\n` +
      `White: ${whiteStones} stones + ${game.captured[WHITE]} captured`;
  } else {
    uiElements.gameScore.title = "";
  }
}

/**
 * Update AI performance statistics display
 * Shows algorithm info, nodes evaluated, time taken, etc.
 */
function updateAIStatsDisplay() {
  if (!uiElements.aiStats) return;

  const stats = getAIStats();

  if (stats.nodesEvaluated > 0) {
    const algorithmName =
      aiSettings.algorithm === "minimax" ? "Minimax" : "Alpha-Beta";

    uiElements.aiStats.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Algorithm:</span>
                <span class="stat-value">${algorithmName}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Nodes:</span>
                <span class="stat-value">${stats.nodesEvaluated.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Time:</span>
                <span class="stat-value">${stats.timeUsed.toFixed(1)}ms</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Rate:</span>
                <span class="stat-value">${stats.nodesPerSecond.toLocaleString()}/s</span>
            </div>
        `;
  } else {
    uiElements.aiStats.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Algorithm:</span>
                <span class="stat-value">-</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Nodes:</span>
                <span class="stat-value">-</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Time:</span>
                <span class="stat-value">-</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Rate:</span>
                <span class="stat-value">-</span>
            </div>
        `;
  }
}

/**
 * Update control button states based on game state
 * Enable/disable buttons as appropriate
 */
function updateControlStates() {
  // Pass button - enabled only during human player's turn
  if (uiElements.passButton) {
    uiElements.passButton.disabled = game.gameOver || shouldAIMove();
  }

  // Reset button - always enabled
  if (uiElements.resetButton) {
    uiElements.resetButton.disabled = false;
  }

  // Board size selector - disabled during active game
  if (uiElements.boardSizeSelector) {
    const gameInProgress =
      !game.gameOver &&
      game.board.some((row) => row.some((cell) => cell !== EMPTY));
    uiElements.boardSizeSelector.disabled = gameInProgress;
  }
}

// =============================================================================
// EVENT HANDLER FUNCTIONS
// =============================================================================

/**
 * Handle pass button click
 */
function handlePassButtonClick() {
  if (!game.gameOver && !shouldAIMove()) {
    console.log("Human passes");
    passMove();
    updateAllUI();

    // Check if AI should move after pass
    setTimeout(() => {
      if (shouldAIMove() && !game.gameOver) {
        makeAIMove().then(() => {
          updateAllUI();
          drawBoard();
        });
      }
    }, 300);
  }
}

/**
 * Handle reset button click
 */
function handleResetButtonClick() {
  console.log("Game reset requested");
  resetGame();
  updateAllUI();
  drawBoard();

  // If AI should start first, trigger AI move
  if (shouldAIMove()) {
    setTimeout(() => {
      makeAIMove().then(() => {
        updateAllUI();
        drawBoard();
      });
    }, 500);
  }
}

/**
 * Handle board size change
 *
 * @param {Event} event - Change event
 */
function handleBoardSizeChange(event) {
  const newSize = parseInt(event.target.value);
  console.log(`Board size changed to ${newSize}x${newSize}`);

  BOARD_SIZE = newSize;
  resetGame();
  updateAllUI();
  drawBoard();
}

/**
 * Handle AI algorithm change
 *
 * @param {Event} event - Change event
 */
function handleAlgorithmChange(event) {
  const algorithm = event.target.value;
  console.log(`AI algorithm changed to: ${algorithm}`);
  setAIAlgorithm(algorithm);
}

/**
 * Handle AI depth change
 *
 * @param {Event} event - Input event
 */
function handleDepthChange(event) {
  const depth = parseInt(event.target.value);
  setAIDepth(depth);

  if (uiElements.depthValue) {
    uiElements.depthValue.textContent = depth;
  }

  console.log(`AI search depth changed to: ${depth}`);
}

/**
 * Handle game mode change
 *
 * @param {Event} event - Change event
 */
function handleGameModeChange(event) {
  const oldMode = aiSettings.gameMode;
  const newMode = event.target.value;

  console.log(`Game mode changed from ${oldMode} to ${newMode}`);

  setGameMode(newMode);

  // Reset game when mode changes
  resetGame();
  updateAllUI();
  drawBoard();

  // Show user feedback
  const modeNames = {
    humanVsAi: "Human vs AI",
    aiVsHuman: "AI vs Human",
    humanVsHuman: "Human vs Human",
  };

  console.log(`New game started: ${modeNames[newMode]}`);

  // If AI should start, trigger AI move
  if (shouldAIMove()) {
    setTimeout(() => {
      makeAIMove().then(() => {
        updateAllUI();
        drawBoard();
      });
    }, 500);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Show a temporary message to the user
 *
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'info', 'success', 'warning', 'error'
 * @param {number} duration - How long to show (milliseconds)
 */
function showUserMessage(message, type = "info", duration = 3000) {
  // This is a placeholder for a user notification system
  // Could be implemented as a toast notification, modal, etc.
  console.log(`${type.toUpperCase()}: ${message}`);

  // For now, just use alert for important messages
  if (type === "error") {
    alert(message);
  }
}

/**
 * Resize canvas to fit container
 * Call this if the layout changes or window is resized
 */
function resizeCanvas() {
  if (!canvas) return;

  // Get container size
  const container = canvas.parentElement;
  if (!container) return;

  const size = Math.min(container.clientWidth, container.clientHeight, 500);

  canvas.width = size;
  canvas.height = size;

  // Redraw after resize
  drawBoard();
}

// =============================================================================
// EXPORT FUNCTIONS FOR OTHER MODULES
// =============================================================================

// These functions will be available to other modules
