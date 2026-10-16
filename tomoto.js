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
let targetTime = null;      // 記錄結束時間點（解決背景計時）

// 讀取 localStorage 內的資料
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
    taskInput.value = '';
});

function saveAndRenderTasks() {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    if (!taskList) return;
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

window.toggleTask = function(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveAndRenderTasks();
};

window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRenderTasks();
};


// ==========================================
// 功能二：支援背景計時的 25 分鐘倒數
// ==========================================
startBtn.addEventListener('click', () => {
    if (isRunning) return; 
    isRunning = true;

    // 計算絕對結束時間點
    targetTime = Date.now() + totalSeconds * 1000;

    timerId = setInterval(() => {
        const now = Date.now();
        const remainingMs = targetTime - now;
        totalSeconds = Math.ceil(remainingMs / 1000);

        if (totalSeconds > 0) {
            updateTimerDisplay();
        } else {
            // 倒數結束
            clearInterval(timerId);
            isRunning = false;
            totalSeconds = 0;
            updateTimerDisplay();
            
            addRecord("完成了一次 25 分鐘專注");
            alert('恭喜完成 25 分鐘專注！已為您寫入紀錄。');

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
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    if (timerDisplay) {
        timerDisplay.innerText = `${formattedMinutes}:${formattedSeconds}`;
    }
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

    records.unshift(newRecord);
    localStorage.setItem('pomodoro_records', JSON.stringify(records));
    renderRecords();
}

function renderRecords() {
    if (!recordList) return;
    recordList.innerHTML = '';
    records.forEach(record => {
        const li = document.createElement('li');
        li.innerText = `[${record.time}] ${record.text}`;
        recordList.appendChild(li);
    });
}
