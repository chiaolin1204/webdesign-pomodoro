// --- 1. 抓取 HTML 元素 ---
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const recordList = document.getElementById('record-list');

// --- 2. 狀態變數設定 ---
let totalSeconds = 25 * 60; // 25分鐘 = 1500秒
let timerId = null;         // 計時器 ID
let isRunning = false;      // 是否正在倒數

// 讀取 localStorage 內的資料（確保重新整理後資料還在）
let tasks = JSON.parse(localStorage.getItem('pomodoro_tasks')) || [];
let records = JSON.parse(localStorage.getItem('pomodoro_records')) || [];

// 初始化：畫面載入時先渲染一次清單與紀錄
renderTasks();
renderRecords();
updateTimerDisplay();


// ==========================================
// 功能一：新增與顯示待辦任務
// ==========================================
addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (!taskText) {
        alert('請輸入任務內容！');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);
    saveAndRenderTasks();
    taskInput.value = ''; // 清空輸入框
});

function saveAndRenderTasks() {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="${task.completed ? 'text-decoration: line-through; color: gray;' : ''}">${task.text}</span>
            <button onclick="toggleTask(${task.id})">${task.completed ? '取消完成' : '完成'}</button>
            <button onclick="deleteTask(${task.id})">刪除</button>
        `;
        taskList.appendChild(li);
    });
}

// 全域函式供 HTML 的 onclick 呼叫
window.toggleTask = function(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveAndRenderTasks();
};

window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRenderTasks();
};


// ==========================================
// 功能二：25分鐘倒數計時與暫停、重置
// ==========================================
startBtn.addEventListener('click', () => {
    if (isRunning) return; // 避免重複點擊加速
    isRunning = true;

    timerId = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateTimerDisplay();
        } else {
            // 倒數結束
            clearInterval(timerId);
            isRunning = false;
            
            // 觸發功能三：寫入專注紀錄
            addRecord("完成了一次 25 分鐘專注");
            alert('恭喜完成 25 分鐘專注！已為您寫入紀錄。');

            // 重置時間
            totalSeconds = 25 * 60;
            updateTimerDisplay();
        }
    }, 1000);
});

pauseBtn.addEventListener('click', () => {
    clearInterval(timerId);
    isRunning = false;
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    isRunning = false;
    totalSeconds = 25 * 60;
    updateTimerDisplay();
});

function updateTimerDisplay() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // 格式化補零 (例如 05:09)
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    timerDisplay.innerText = `${formattedMinutes}:${formattedSeconds}`;
}


// ==========================================
// 功能三：倒數結束後，寫入一筆「專注紀錄」
// ==========================================
function addRecord(content) {
    const now = new Date();
    const timeString = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newRecord = {
        text: content,
        time: timeString
    };

    records.unshift(newRecord); // 將最新紀錄排在最上方
    localStorage.setItem('pomodoro_records', JSON.stringify(records));
    renderRecords();
}

function renderRecords() {
    recordList.innerHTML = '';
    records.forEach(record => {
        const li = document.createElement('li');
        li.innerText = `[${record.time}] ${record.text}`;
        recordList.appendChild(li);
    });
}