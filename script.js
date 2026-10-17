const form = document.getElementById("todo_form");
const inputBox = document.getElementById("input_box");
const courseInput = document.getElementById("course_input");
const dueDateInput = document.getElementById("due_date");
const list = document.getElementById("list");
const emptyState = document.getElementById("empty-state");
const emptyStateTitle = document.getElementById("empty-state-title");
const emptyStateDesc = document.getElementById("empty-state-desc");
const deadlineBanner = document.getElementById("deadline-banner");

const searchInput = document.getElementById("search_input");
const sortSelect = document.getElementById("sort_select");
const filterTabs = document.querySelectorAll(".tab-btn");
const countAll = document.getElementById("count-all");
const countActive = document.getElementById("count-active");
const countCompleted = document.getElementById("count-completed");

const progressBarFill = document.getElementById("progress-bar-fill");
const progressPercentage = document.getElementById("progress-percentage");
const progressStatusText = document.getElementById("progress-status-text");
const itemsLeftText = document.getElementById("items-left-text");
const clearCompletedBtn = document.getElementById("clear_completed_btn");

const currentDateEl = document.getElementById("current-date");
const themeToggleBtn = document.getElementById("theme-toggle");
const iconSun = document.getElementById("icon-sun");
const iconMoon = document.getElementById("icon-moon");
const toastContainer = document.getElementById("toast-container");
const confettiCanvas = document.getElementById("confetti-canvas");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let currentSort = "created";
let searchQuery = "";
let editingTaskId = null;

function initDateHeader() {
    try {
        const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
        const now = new Date();
        const dateStr = now.toLocaleDateString("id-ID", options);
        if (currentDateEl) {
            currentDateEl.textContent = `${dateStr} • Rencanakan tugas kuliahmu dengan rapi`;
        }
    } catch {
        if (currentDateEl) currentDateEl.textContent = "Rencanakan tugas kuliahmu dengan rapi";
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("todo_theme") || "dark";
    setTheme(savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        showToast(`Beralih ke mode ${newTheme === "dark" ? "gelap" : "terang"}`, "info");
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("todo_theme", theme);
    if (theme === "light") {
        iconSun.style.display = "none";
        iconMoon.style.display = "block";
    } else {
        iconSun.style.display = "block";
        iconMoon.style.display = "none";
    }
}

function showToast(message, type = "info", duration = 3000) {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconSvg = "";
    if (type === "success") {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === "danger") {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === "warning") {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-text">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(12px) scale(0.95)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getDeadlineInfo(dueDateStr, isCompleted) {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    if (isNaN(due.getTime())) return null;

    const formattedTime = due.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const formattedDate = due.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    if (isCompleted) {
        return {
            state: "completed",
            badgeClass: "completed",
            text: `Deadline: ${formattedDate}, ${formattedTime}`,
            icon: "✓"
        };
    }

    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs < 0) {
        const absHours = Math.abs(diffHours);
        let overdueText = "";
        if (absHours < 1) {
            overdueText = `Terlewat baru saja (${formattedTime})`;
        } else if (absHours < 24) {
            overdueText = `Terlewat ${Math.floor(absHours)} jam (${formattedTime})`;
        } else {
            const days = Math.floor(absHours / 24);
            overdueText = `Terlewat ${days} hari lalu (${formattedDate})`;
        }
        return {
            state: "overdue",
            badgeClass: "overdue",
            text: overdueText,
            icon: "🚨",
            isOverdue: true
        };
    } else if (diffHours <= 12) {
        const hours = Math.floor(diffHours);
        const mins = Math.max(0, Math.floor(diffMinutes % 60));
        const timeLeft = hours > 0 ? `${hours} jam ${mins} mnt` : `${mins} menit`;
        return {
            state: "urgent",
            badgeClass: "urgent",
            text: `Mendesak! Sisa ${timeLeft} (${formattedTime})`,
            icon: "⚡",
            isUrgent: true
        };
    } else if (diffHours <= 24) {
        const hours = Math.floor(diffHours);
        return {
            state: "today",
            badgeClass: "today",
            text: `Hari ini, ${formattedTime} (sisa ${hours} jam)`,
            icon: "🕒"
        };
    } else if (diffDays <= 2) {
        return {
            state: "tomorrow",
            badgeClass: "tomorrow",
            text: `Besok, ${formattedTime}`,
            icon: "📅"
        };
    } else {
        const days = Math.ceil(diffDays);
        return {
            state: "upcoming",
            badgeClass: "upcoming",
            text: `${days} hari lagi (${formattedDate}, ${formattedTime})`,
            icon: "📆"
        };
    }
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    if (countAll) countAll.textContent = total;
    if (countActive) countActive.textContent = active;
    if (countCompleted) countCompleted.textContent = completed;

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;

    if (progressStatusText) {
        if (total === 0) {
            progressStatusText.textContent = "Belum ada tugas kuliah. Tambahkan tugas pertamamu!";
        } else if (completed === total) {
            progressStatusText.textContent = "Luar biasa! Semua tugas telah terselesaikan 🎉";
        } else if (completed === 0) {
            progressStatusText.textContent = `0 dari ${total} tugas selesai. Ayo mulai selesaikan!`;
        } else {
            progressStatusText.textContent = `${completed} dari ${total} tugas selesai (${percentage}%). Terus semangat!`;
        }
    }

    if (itemsLeftText) {
        itemsLeftText.textContent = `${active} tugas aktif tersisa`;
    }

    if (clearCompletedBtn) {
        clearCompletedBtn.style.display = completed > 0 ? "inline-block" : "none";
    }

    // Check deadlines for active tasks to show deadline alert banner
    if (deadlineBanner) {
        let overdueCount = 0;
        let urgentCount = 0;

        tasks.forEach(task => {
            if (!task.completed && task.dueDate) {
                const info = getDeadlineInfo(task.dueDate, false);
                if (info && info.state === "overdue") overdueCount++;
                else if (info && (info.state === "urgent" || info.state === "today")) urgentCount++;
            }
        });

        if (overdueCount > 0) {
            deadlineBanner.style.display = "flex";
            deadlineBanner.className = "deadline-banner banner-overdue";
            deadlineBanner.innerHTML = `
                <span>🚨</span>
                <span><strong>Perhatian:</strong> Ada <strong>${overdueCount} tugas</strong> yang telah melewati batas deadline!</span>
            `;
        } else if (urgentCount > 0) {
            deadlineBanner.style.display = "flex";
            deadlineBanner.className = "deadline-banner banner-urgent";
            deadlineBanner.innerHTML = `
                <span>⚡</span>
                <span><strong>Mendesak:</strong> Ada <strong>${urgentCount} tugas</strong> yang memiliki deadline hari ini!</span>
            `;
        } else {
            deadlineBanner.style.display = "none";
        }
    }
}

function renderTasks() {
    list.innerHTML = "";

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        filteredTasks = filteredTasks.filter(task => {
            const matchesText = task.text.toLowerCase().includes(query);
            const courseName = (task.course || task.category || "").toLowerCase();
            const matchesCourse = courseName.includes(query);
            return matchesText || matchesCourse;
        });
    }

    // Sorting
    filteredTasks.sort((a, b) => {
        if (currentSort === "deadline") {
            // Completed tasks at the end
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            // Tasks with dueDate first
            if (!a.dueDate && b.dueDate) return 1;
            if (a.dueDate && !b.dueDate) return -1;
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return (b.id || 0) - (a.id || 0);
        } else {
            // Default: newest first
            return (b.id || 0) - (a.id || 0);
        }
    });

    if (filteredTasks.length === 0) {
        emptyState.style.display = "flex";
        if (tasks.length === 0) {
            emptyStateTitle.textContent = "Belum Ada Tugas Kuliah";
            emptyStateDesc.textContent = "Tuliskan tugas dan mata kuliah pada kolom di atas untuk mulai mencatat!";
        } else if (searchQuery.trim() !== "") {
            emptyStateTitle.textContent = "Tugas Tidak Ditemukan";
            emptyStateDesc.textContent = `Tidak ada tugas atau mata kuliah yang cocok dengan kata kunci "${searchQuery}".`;
        } else if (currentFilter === "active") {
            emptyStateTitle.textContent = "Tidak Ada Tugas Aktif";
            emptyStateDesc.textContent = "Bagus sekali! Semua tugas kuliahmu saat ini sudah selesai.";
        } else if (currentFilter === "completed") {
            emptyStateTitle.textContent = "Belum Ada Tugas Selesai";
            emptyStateDesc.textContent = "Selesaikan tugas kuliahmu dan tandai untuk mencatat progres!";
        }
    } else {
        emptyState.style.display = "none";
    }

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        const course = task.course || task.category || "";
        const deadlineInfo = getDeadlineInfo(task.dueDate, task.completed);

        let urgencyClass = "";
        if (deadlineInfo && !task.completed) {
            if (deadlineInfo.isOverdue) urgencyClass = "is-overdue";
            else if (deadlineInfo.isUrgent) urgencyClass = "is-urgent";
        }

        li.className = `task-item ${task.completed ? "checked" : ""} ${urgencyClass}`.trim();
        li.setAttribute("data-id", task.id);

        const isEditing = editingTaskId === task.id;

        li.innerHTML = `
            <div class="task-left-section">
                <button type="button" class="custom-checkbox" aria-label="${task.completed ? "Tandai belum selesai" : "Tandai selesai"}" data-action="toggle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </button>
                <div class="task-content-wrap">
                    ${
                        isEditing
                            ? `<input type="text" class="task-edit-input" value="${escapeHtml(task.text)}" data-action="save-edit" autofocus />`
                            : `<span class="task-title" data-action="toggle">${escapeHtml(task.text)}</span>`
                    }
                    <div class="task-meta-row">
                        ${
                            course
                                ? `<span class="badge badge-course">
                                    🎓 ${escapeHtml(course)}
                                   </span>`
                                : ""
                        }
                        ${
                            deadlineInfo
                                ? `<span class="badge badge-deadline ${deadlineInfo.badgeClass}">
                                    ${deadlineInfo.icon} ${escapeHtml(deadlineInfo.text)}
                                   </span>`
                                : ""
                        }
                    </div>
                </div>
            </div>

            <div class="task-actions">
                ${
                    isEditing
                        ? `<button type="button" class="btn-task-action btn-task-edit" title="Simpan Perubahan" data-action="confirm-edit" aria-label="Simpan perubahan">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                           </button>`
                        : `<button type="button" class="btn-task-action btn-task-edit" title="Edit Tugas" data-action="edit" aria-label="Edit tugas">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                           </button>`
                }
                <button type="button" class="btn-task-action btn-task-delete" title="Hapus Tugas" data-action="delete" aria-label="Hapus tugas">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        list.appendChild(li);

        if (isEditing) {
            const editInput = li.querySelector(".task-edit-input");
            if (editInput) {
                editInput.focus();
                editInput.setSelectionRange(editInput.value.length, editInput.value.length);
            }
        }
    });

    updateStats();
}

function saveAndRender() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const taskText = inputBox.value.trim();

    if (taskText === "") {
        showToast("Mohon tuliskan isi tugas yang ingin kamu buat", "warning");
        inputBox.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        course: courseInput ? courseInput.value.trim() : "",
        dueDate: dueDateInput ? dueDateInput.value : "",
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    inputBox.value = "";
    if (courseInput) courseInput.value = "";
    if (dueDateInput) dueDateInput.value = "";

    saveAndRender();
    showToast("Tugas kuliah berhasil ditambahkan!", "success");
});

list.addEventListener("click", function (e) {
    const actionBtn = e.target.closest("[data-action]");
    const li = e.target.closest("li.task-item");
    if (!li) return;

    const taskId = parseInt(li.getAttribute("data-id"));
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const action = actionBtn ? actionBtn.getAttribute("data-action") : null;

    if (action === "toggle") {
        const wasCompleted = tasks[taskIndex].completed;
        tasks[taskIndex].completed = !wasCompleted;

        saveAndRender();

        if (!wasCompleted) {
            showToast("Tugas selesai! Kerja bagus 👏", "success");
            const allDone = tasks.length > 0 && tasks.every(t => t.completed);
            if (allDone) {
                triggerConfetti();
                showToast("🎉 Hebat! Semua tugas telah terselesaikan!", "success", 4000);
            }
        }
    } else if (action === "edit") {
        editingTaskId = taskId;
        renderTasks();
    } else if (action === "confirm-edit") {
        const editInput = li.querySelector(".task-edit-input");
        if (editInput) {
            const newText = editInput.value.trim();
            if (newText !== "") {
                tasks[taskIndex].text = newText;
                showToast("Tugas berhasil diperbarui", "info");
            }
        }
        editingTaskId = null;
        saveAndRender();
    } else if (action === "delete") {
        li.style.transform = "translateX(20px)";
        li.style.opacity = "0";
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            if (editingTaskId === taskId) editingTaskId = null;
            saveAndRender();
            showToast("Tugas telah dihapus", "danger");
        }, 200);
    }
});

list.addEventListener("keydown", function (e) {
    if (e.target.classList.contains("task-edit-input")) {
        const li = e.target.closest("li.task-item");
        if (!li) return;
        const taskId = parseInt(li.getAttribute("data-id"));
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (e.key === "Enter") {
            e.preventDefault();
            const newText = e.target.value.trim();
            if (newText !== "" && taskIndex !== -1) {
                tasks[taskIndex].text = newText;
                showToast("Tugas berhasil diperbarui", "info");
            }
            editingTaskId = null;
            saveAndRender();
        } else if (e.key === "Escape") {
            editingTaskId = null;
            renderTasks();
        }
    }
});

if (searchInput) {
    searchInput.addEventListener("input", function (e) {
        searchQuery = e.target.value;
        renderTasks();
    });
}

if (sortSelect) {
    sortSelect.addEventListener("change", function (e) {
        currentSort = e.target.value;
        renderTasks();
    });
}

filterTabs.forEach(tab => {
    tab.addEventListener("click", function () {
        filterTabs.forEach(t => {
            t.classList.remove("active");
            t.setAttribute("aria-selected", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");

        currentFilter = this.getAttribute("data-filter");
        renderTasks();
    });
});

if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", function () {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;

        tasks = tasks.filter(t => !t.completed);
        saveAndRender();
        showToast(`${completedCount} tugas selesai telah dibersihkan`, "info");
    });
}

function triggerConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext("2d");
    if (!ctx) return;

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ["#38bdf8", "#7dd3fc", "#0ea5e9", "#06b6d4", "#bae6fd", "#10b981"];

    for (let i = 0; i < 90; i++) {
        confettiPieces.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 - 50,
            r: Math.random() * 6 + 4,
            d: Math.random() * 80 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.7) * 14,
            gravity: 0.28,
            alpha: 1
        });
    }

    let animationFrame;
    const startTime = Date.now();

    function renderConfetti() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        let activeCount = 0;
        confettiPieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.tiltAngle += p.tiltAngleIncremental;
            p.tilt = Math.sin(p.tiltAngle) * 15;

            if (Date.now() - startTime > 1500) {
                p.alpha -= 0.02;
            }

            if (p.alpha > 0 && p.y < window.innerHeight) {
                activeCount++;
                ctx.beginPath();
                ctx.lineWidth = p.r / 2;
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.moveTo(p.x + p.tilt + p.r, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                ctx.stroke();
            }
        });

        ctx.globalAlpha = 1;

        if (activeCount > 0 && Date.now() - startTime < 3500) {
            animationFrame = requestAnimationFrame(renderConfetti);
        } else {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            cancelAnimationFrame(animationFrame);
        }
    }

    renderConfetti();
}

window.addEventListener("resize", () => {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
});

// Periodic update every 60 seconds so deadline countdowns stay fresh
setInterval(() => {
    updateStats();
    // re-render if active tasks have deadlines to update relative countdown text
    const hasActiveDeadlines = tasks.some(t => !t.completed && t.dueDate);
    if (hasActiveDeadlines) {
        renderTasks();
    }
}, 60000);

initDateHeader();
initTheme();
renderTasks();