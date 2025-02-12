
// app.js
let timers = JSON.parse(localStorage.getItem("timers")) || [];
let endMessage = localStorage.getItem("endMessage") || "Todos los temporizadores han finalizado";
let currentTimerIndex = 0;
let isRunning = false;
let wakeLock = null;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock liberado');
            });
        } catch (err) {
            console.error(`No se pudo activar Wake Lock: ${err.message}`);
        }
    }
}

function saveTimers() {
    localStorage.setItem("timers", JSON.stringify(timers));
}

function addTimer() {
    let duration = prompt("Duración en segundos:");
    let message = prompt("Mensaje a sintetizar al inicio:");
    if (duration && message) {
        timers.push({ duration: parseInt(duration), message });
        saveTimers();
        renderTimers();
    }
}

function setEndMessage() {
    endMessage = prompt("Mensaje de fin de la secuencia:", endMessage) || endMessage;
    localStorage.setItem("endMessage", endMessage);
}

function renderTimers() {
    let list = document.getElementById("timerList");
    list.innerHTML = "";
    timers.forEach((t, i) => {
        let item = document.createElement("li");
        item.textContent = `Temporizador ${i + 1}: ${t.duration}s - \"${t.message}\"`;
        list.appendChild(item);
    });
}

function startTimers() {
    if (timers.length === 0 || isRunning) return;
    isRunning = true;
    requestWakeLock();
    runTimer(0);
}

function runTimer(index) {
    if (index >= timers.length) {
        speak(endMessage);
        document.getElementById("activeTimer").textContent = "Temporizador activo: Ninguno";
        isRunning = false;
        if (wakeLock) wakeLock.release();
        return;
    }
    currentTimerIndex = index;
    let timer = timers[index];
    document.getElementById("activeTimer").textContent = `Temporizador activo: ${timer.message} (${timer.duration}s)`;
    speak(timer.message);
    let startTime = Date.now();
    let interval = setInterval(() => {
        let elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("activeTimer").textContent = `Temporizador activo: ${timer.message} (${elapsed}/${timer.duration}s)`;
    }, 1000);
    setTimeout(() => {
        clearInterval(interval);
        runTimer(index + 1);
    }, timer.duration * 1000);
}

function resetTimers() {
    timers = [];
    saveTimers();
    renderTimers();
}

function speak(text) {
    let msg = new SpeechSynthesisUtterance(text);
    msg.lang = "es-ES";
    window.speechSynthesis.speak(msg);
}

document.addEventListener("DOMContentLoaded", renderTimers);
