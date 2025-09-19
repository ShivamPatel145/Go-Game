# Go Game Web Application

## Project Overview

This is a complete web-based Go (Weiqi/Baduk) game featuring an intelligent AI opponent, built with modern JavaScript modules and comprehensive documentation. The codebase has been carefully organized into logical modules to make it easy to understand, modify, and extend.

## File Structure

```
go_web/
├── index.html          # Main HTML file with module imports
├── style.css           # Complete CSS with detailed comments
├── js/                 # Modular JavaScript architecture
│   ├── main.js         # Application coordinator
│   ├── gameLogic.js    # Core game mechanics
│   ├── aiLogic.js      # AI algorithms and decision making
│   ├── uiComponents.js # User interface and rendering
│   ├── utils.js        # Helper functions and utilities
│   └── gameHistory.js  # Statistics and game tracking
└── README.md           # This documentation file
```

## Module Descriptions

### main.js - Application Coordinator
**Purpose**: Central control hub that orchestrates all other modules

**Key Functions**:
- initializeApplication() - Sets up the entire game
- coordinateGameTurn() - Manages game flow and player turns
- handleGameEnd() - Processes game completion
- Error handling and recovery mechanisms

**Dependencies**: All other modules
**When to modify**: Adding new game modes, changing overall game flow

### gameLogic.js - Core Game Mechanics
**Purpose**: Implements all Go game rules and board state management

**Key Functions**:
- initializeBoard() - Creates empty game board
- makeMove() - Validates and executes moves
- getGroup() - Finds connected stone groups
- countLiberties() - Calculates breathing spaces
- removeCapturedGroups() - Handles stone captures
- calculateScore() - Determines final game score

**Dependencies**: utils.js
**When to modify**: Changing game rules, adding new board sizes, modifying scoring

### aiLogic.js - AI Intelligence
**Purpose**: Computer opponent with multiple difficulty levels

**Key Algorithms**:
- Minimax: Classic game tree search algorithm
- Alpha-Beta Pruning: Optimization for faster AI decisions
- Position Evaluation: Heuristic scoring for board positions

**Key Functions**:
- findBestMove() - Main AI decision function
- minimax() - Basic minimax implementation
- minimaxAlphaBeta() - Optimized version with pruning
- evaluatePosition() - Board position scoring

**Dependencies**: gameLogic.js
**When to modify**: Adjusting AI difficulty, improving evaluation function

### uiComponents.js - User Interface
**Purpose**: All visual rendering and user interaction handling

**Key Functions**:
- drawBoard() - Renders the game board on canvas
- handleCanvasClick() - Processes user clicks
- updateAllUI() - Refreshes entire interface
- showGameResult() - Displays game end information
- calculateBoardLayout() - Handles responsive board sizing

**Dependencies**: gameLogic.js, utils.js
**When to modify**: Changing visual design, adding animations, new UI features

### utils.js - Helper Functions
**Purpose**: Shared utilities used across all modules

**Key Functions**:
- deepCopy() - Creates deep copies of objects
- PerformanceTimer class - Measures execution time
- isValidCoordinate() - Validates board positions
- localStorage helpers - Data persistence functions

**Dependencies**: None (provides services to others)
**When to modify**: Adding new utility functions, performance improvements

### gameHistory.js - Statistics & Tracking
**Purpose**: Game statistics, history, and achievement system

**Key Functions**:
- recordGameResult() - Saves completed games
- getGameStatistics() - Calculates win/loss stats
- saveGameHistory() - Persists data to localStorage
- getAchievements() - Tracks player milestones

**Dependencies**: utils.js
**When to modify**: Adding new statistics, achievement system, data export

## How the Game Works

### Game Flow
1. **Initialization** (main.js)
   - Load all modules
   - Set up event listeners
   - Initialize game board
   - Configure AI settings

2. **Player Turn** (gameLogic.js + uiComponents.js)
   - Player clicks on board
   - Validate move legality
   - Update board state
   - Render changes

3. **AI Turn** (aiLogic.js)
   - Analyze current position
   - Use minimax algorithm to find best move
   - Execute AI move
   - Update board and UI

4. **Game End** (gameHistory.js)
   - Calculate final scores
   - Record game statistics
   - Show results to player

### AI Difficulty Levels
- **Depth 1-2**: Beginner (looks 1-2 moves ahead)
- **Depth 3-4**: Intermediate (considers short-term tactics)
- **Depth 5-6**: Advanced (strategic planning)
- **Depth 7+**: Expert (deep positional analysis)

## How to Modify the Code

### Adding New Features

#### 1. New Game Mode
**Files to modify**: main.js, gameLogic.js, uiComponents.js
```javascript
// In gameLogic.js
function initializeBoardSize(size) {
    // New board size logic
}

// In uiComponents.js
function drawCustomBoard() {
    // Custom rendering logic
}
```

#### 2. Enhanced AI
**Files to modify**: aiLogic.js
```javascript
// Add new evaluation criteria
function evaluatePosition(board) {
    // Your improved evaluation logic
    const territoryScore = evaluateTerritory(board);
    const influenceScore = evaluateInfluence(board);
    return territoryScore + influenceScore;
}
```

#### 3. New UI Elements
**Files to modify**: uiComponents.js, style.css, index.html
```javascript
// In uiComponents.js
function createNewUIElement() {
    // Create and style new elements
}
```

### Understanding the Code

#### Key Data Structures
```javascript
// Board representation (in gameLogic.js)
const board = [
    [0, 0, 1], // 0 = empty, 1 = black, 2 = white
    [2, 1, 0],
    [0, 0, 0]
];

// Move object
const move = {
    row: 3,
    col: 5,
    player: 1, // 1 = black, 2 = white
    timestamp: Date.now()
};
```

#### Algorithm Explanations
The AI uses **minimax with alpha-beta pruning**:
1. **Minimax**: Explores all possible moves to a certain depth
2. **Alpha-Beta**: Eliminates branches that won't affect the final decision
3. **Evaluation**: Scores positions based on territory, captures, and influence

## Development Guidelines

### Code Style
- **Comments**: Every major function is documented
- **Modularity**: Each file has a single responsibility
- **ES6+**: Modern JavaScript features used throughout
- **Error Handling**: Comprehensive error checking and recovery

### Testing Your Changes
1. Open index.html in a web browser
2. Test basic gameplay (placing stones, captures)
3. Test AI at different difficulty levels
4. Check responsive design on mobile
5. Verify statistics tracking works

### Performance Considerations
- AI depth affects performance exponentially
- Canvas rendering is optimized for smooth gameplay
- localStorage used for data persistence
- Responsive design ensures good mobile performance

## Common Modifications

### Change Board Size
```javascript
// In gameLogic.js
const BOARD_SIZE = 13; // Change from 9 to 13 or 19
```

### Adjust AI Difficulty
```javascript
// In aiLogic.js
function evaluatePosition(board) {
    // Add more sophisticated evaluation criteria
    const newFactor = calculateNewFactor(board);
    return existingScore + newFactor;
}
```

### Add New Statistics
```javascript
// In gameHistory.js
function recordGameResult(result) {
    // Add new tracking metrics
    const stats = getGameStatistics();
    stats.newMetric = calculateNewMetric(result);
    saveGameHistory(stats);
}
```

## Getting Started

1. **Understanding**: Read through this README
2. **Exploration**: Open each .js file and read the comments
3. **Experimentation**: Make small changes and test them
4. **Extension**: Add your own features using the existing patterns

## Contributing

When making changes:
1. **Follow the modular structure** - keep related code together
2. **Add comments** - explain your changes for future developers
3. **Test thoroughly** - ensure your changes don't break existing functionality
4. **Update documentation** - modify this README if you add major features

This codebase is designed to be educational and extensible. Each module is thoroughly documented to help you understand how modern web applications are structured and how game AI algorithms work in practice.