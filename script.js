document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('sudoku-board');
    const newGameBtn = document.getElementById('new-game');
    const checkBtn = document.getElementById('check');
    const solveBtn = document.getElementById('solve');
    const difficultySelect = document.getElementById('difficulty');
    const messageEl = document.getElementById('message');
    
    let sudoku = [];
    let solution = [];
    let selectedCell = null;
    
    // 初始化遊戲
    initGame();
    
    // 事件監聽器
    newGameBtn.addEventListener('click', initGame);
    checkBtn.addEventListener('click', checkSolution);
    solveBtn.addEventListener('click', showSolution);
    
    // 初始化遊戲
    function initGame() {
        messageEl.textContent = '';
        const difficulty = difficultySelect.value;
        generateSudoku(difficulty);
        renderBoard();
    }
    
    // 生成數獨題目
    function generateSudoku(difficulty) {
        // 首先生成一個完整的解決方案
        solution = generateSolution();
        
        // 根據難度決定要移除多少數字
        let cellsToRemove;
        switch(difficulty) {
            case 'easy':
                cellsToRemove = 40;
                break;
            case 'hard':
                cellsToRemove = 60;
                break;
            case 'medium':
            default:
                cellsToRemove = 50;
        }
        
        // 複製解決方案並移除一些數字作為題目
        sudoku = JSON.parse(JSON.stringify(solution));
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (sudoku[row][col] !== 0) {
                sudoku[row][col] = 0;
                removed++;
            }
        }
    }
    
    // 生成一個有效的數獨解決方案
    function generateSolution() {
        // 創建一個空的9x9網格
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // 填充對角線上的3x3方塊（因為它們彼此獨立）
        fillDiagonalBoxes(grid);
        
        // 解決剩餘的網格
        solveSudoku(grid);
        
        return grid;
    }
    
    // 填充對角線上的3x3方塊
    function fillDiagonalBoxes(grid) {
        for (let box = 0; box < 9; box += 3) {
            fillBox(grid, box, box);
        }
    }
    
    // 填充一個3x3方塊
    function fillBox(grid, row, col) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(nums);
        
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                grid[row + i][col + j] = nums[index++];
            }
        }
    }
    
    // 洗牌算法
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 解決數獨
    function solveSudoku(grid) {
        const emptyCell = findEmptyCell(grid);
        if (!emptyCell) return true; // 沒有空格，解決完成
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= 9; num++) {
            if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (solveSudoku(grid)) {
                    return true;
                }
                
                grid[row][col] = 0; // 回溯
            }
        }
        
        return false; // 觸發回溯
    }
    
    // 找到空格
    function findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    // 檢查數字是否有效
    function isValid(grid, row, col, num) {
        // 檢查行
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }
        
        // 檢查列
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }
        
        // 檢查3x3方塊
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) return false;
            }
        }
        
        return true;
    }
    
    // 渲染數獨板
    function renderBoard() {
        board.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (sudoku[row][col] !== 0) {
                    cell.textContent = sudoku[row][col];
                    cell.classList.add('fixed');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.row = row;
                    input.dataset.col = col;
                    
                    input.addEventListener('input', function() {
                        const value = parseInt(this.value);
                        if (value >= 1 && value <= 9) {
                            sudoku[row][col] = value;
                            this.classList.remove('error');
                        } else if (this.value === '') {
                            sudoku[row][col] = 0;
                            this.classList.remove('error');
                        } else {
                            this.classList.add('error');
                        }
                    });
                    
                    input.addEventListener('focus', function() {
                        if (selectedCell) {
                            selectedCell.classList.remove('selected');
                        }
                        selectedCell = this;
                        this.classList.add('selected');
                    });
                    
                    cell.appendChild(input);
                }
                
                board.appendChild(cell);
            }
        }
    }
    
    // 檢查解答
    function checkSolution() {
        let isCorrect = true;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (sudoku[row][col] !== solution[row][col]) {
                    isCorrect = false;
                    const input = board.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
                    if (input) {
                        input.classList.add('error');
                    }
                }
            }
        }
        
        if (isCorrect) {
            messageEl.textContent = '恭喜！解答正確！';
            messageEl.style.color = '#4CAF50';
        } else {
            messageEl.textContent = '解答有誤，請檢查紅色標記的格子';
            messageEl.style.color = 'red';
        }
    }
    
    // 顯示解答
    function showSolution() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                sudoku[row][col] = solution[row][col];
            }
        }
        renderBoard();
        messageEl.textContent = '已顯示解答';
        messageEl.style.color = '#4CAF50';
    }
});