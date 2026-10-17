// GDGoC Task Manager
// All data is stored in the browser using localStorage, so no server is needed.

const STORAGE_KEY = "gdgoc-task-manager-v1";
const STATUSES = { todo: "To Do", progress: "In Progress", done: "Done" };

// ---------- Helpers ----------

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(n) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return toDateString(date);
}

function makeId(prefix) {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

// Stops user text from being treated as HTML
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Data ----------

function defaultData() {
  return {
    members: [
      { id: "m1", name: "Vedant", role: "Lead" },
      { id: "m2", name: "Aman", role: "Member" },
      { id: "m3", name: "Riya", role: "Member" },
      { id: "m4", name: "Kunal", role: "Member" }
    ],
    tasks: [
      { id: "t1", title: "Set up registration form for Web Dev workshop", description: "Google Form with name, year and branch", assignee: "m2", deadline: addDays(2), priority: "High", status: "progress" },
      { id: "t2", title: "Design poster for Web Dev workshop", description: "For Instagram and college WhatsApp groups", assignee: "m3", deadline: addDays(3), priority: "Medium", status: "todo" },
      { id: "t3", title: "Book seminar hall for hackathon", description: "Talk to the department office", assignee: "m1", deadline: addDays(-1), priority: "High", status: "todo" },
      { id: "t4", title: "Prepare HTML & CSS basics slides", description: "", assignee: "m4", deadline: addDays(5), priority: "Medium", status: "todo" },
      { id: "t5", title: "Update events page on GDGoC website", description: "", assignee: "m2", deadline: addDays(7), priority: "Low", status: "todo" },
      { id: "t6", title: "Collect feedback from last session", description: "Share results in the core team group", assignee: "m3", deadline: addDays(-3), priority: "Low", status: "done" }
    ]
  };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.warn("Could not load saved data", error);
  }
  return defaultData();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Could not save data", error);
  }
}

let data = loadData();
let currentUserId = data.members[0].id;
let filter = "all";

function getMember(id) {
  return data.members.find(member => member.id === id);
}

function currentUser() {
  return getMember(currentUserId);
}

function isLead() {
  return currentUser().role === "Lead";
}

// A Lead can change any task. A Member can only change tasks assigned to them.
function canChangeStatus(task) {
  return isLead() || task.assignee === currentUserId;
}

function deadlineInfo(task) {
  if (task.status === "done") return { text: "Completed", cls: "ok" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.deadline + "T00:00:00");
  const days = Math.round((due - today) / 86400000);

  if (days < 0) return { text: `Overdue by ${-days} day${days === -1 ? "" : "s"}`, cls: "overdue" };
  if (days === 0) return { text: "Due today", cls: "soon" };
  if (days <= 2) return { text: `Due in ${days} day${days === 1 ? "" : "s"}`, cls: "soon" };
  return { text: `Due in ${days} days`, cls: "ok" };
}

// ---------- Rendering ----------

function renderUserSelect() {
  const select = document.getElementById("current-user");
  select.innerHTML = data.members
    .map(m => `<option value="${m.id}">${escapeHTML(m.name)} (${m.role})</option>`)
    .join("");
  select.value = currentUserId;
}

function renderMemberOptions() {
  document.getElementById("task-assignee").innerHTML = data.members
    .map(m => `<option value="${m.id}">${escapeHTML(m.name)}</option>`)
    .join("");

  const filterSelect = document.getElementById("filter");
  filterSelect.innerHTML =
    `<option value="all">All tasks</option><option value="mine">My tasks</option>` +
    data.members.map(m => `<option value="${m.id}">Assigned to ${escapeHTML(m.name)}</option>`).join("");
  filterSelect.value = filter;
}

function renderRole() {
  document.getElementById("role-note").textContent = isLead()
    ? "You are a Lead: you can create, assign and delete tasks, and update any task's status."
    : "You are a Member: you can update the status of tasks assigned to you.";

  document.getElementById("lead-panel").classList.toggle("hidden", !isLead());
}

function renderStats() {
  const tasks = data.tasks;
  document.getElementById("stat-total").textContent = tasks.length;
  document.getElementById("stat-todo").textContent = tasks.filter(t => t.status === "todo").length;
  document.getElementById("stat-progress").textContent = tasks.filter(t => t.status === "progress").length;
  document.getElementById("stat-done").textContent = tasks.filter(t => t.status === "done").length;
  document.getElementById("stat-overdue").textContent = tasks.filter(t => deadlineInfo(t).cls === "overdue").length;
}

function renderTeam() {
  document.getElementById("team-list").innerHTML = data.members
    .map(m => {
      const open = data.tasks.filter(t => t.assignee === m.id && t.status !== "done").length;
      return `<li><span>${escapeHTML(m.name)}<small>${m.role}</small></span><span>${open} open</span></li>`;
    })
    .join("");
}

function taskCard(task) {
  const member = getMember(task.assignee);
  const due = deadlineInfo(task);
  const editable = canChangeStatus(task);

  const options = Object.entries(STATUSES)
    .map(([value, label]) => `<option value="${value}" ${value === task.status ? "selected" : ""}>${label}</option>`)
    .join("");

  return `
    <article class="task ${due.cls}">
      <div class="task-top">
        <h4>${escapeHTML(task.title)}</h4>
        <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
      </div>
      ${task.description ? `<p class="desc">${escapeHTML(task.description)}</p>` : ""}
      <p class="meta">Assigned to: ${member ? escapeHTML(member.name) : "Unassigned"}</p>
      <p class="meta ${due.cls}">Deadline: ${task.deadline} (${due.text})</p>
      <div class="task-actions">
        <select class="status-select" data-id="${task.id}" ${editable ? "" : "disabled"}
          title="${editable ? "Change status" : "Only a Lead or the assigned member can change this"}">
          ${options}
        </select>
        ${isLead() ? `<button class="delete-btn" data-id="${task.id}" type="button">Delete</button>` : ""}
      </div>
    </article>`;
}

function renderBoard() {
  let tasks = data.tasks;
  if (filter === "mine") tasks = tasks.filter(t => t.assignee === currentUserId);
  else if (filter !== "all") tasks = tasks.filter(t => t.assignee === filter);

  // Closest deadline first
  tasks = [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));

  for (const status in STATUSES) {
    const items = tasks.filter(t => t.status === status);
    document.getElementById(`count-${status}`).textContent = items.length;
    document.getElementById(`list-${status}`).innerHTML = items.length
      ? items.map(taskCard).join("")
      : `<p class="empty">No tasks here</p>`;
  }
}

function render() {
  renderUserSelect();
  renderMemberOptions();
  renderRole();
  renderStats();
  renderTeam();
  renderBoard();
}

// ---------- Events ----------

document.getElementById("current-user").addEventListener("change", event => {
  currentUserId = event.target.value;
  render();
});

document.getElementById("filter").addEventListener("change", event => {
  filter = event.target.value;
  renderBoard();
});

document.getElementById("task-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!isLead()) return;

  const title = document.getElementById("task-title").value.trim();
  const deadline = document.getElementById("task-deadline").value;
  if (!title || !deadline) return;

  data.tasks.push({
    id: makeId("t"),
    title: title,
    description: document.getElementById("task-desc").value.trim(),
    assignee: document.getElementById("task-assignee").value,
    deadline: deadline,
    priority: document.getElementById("task-priority").value,
    status: "todo"
  });

  saveData();
  event.target.reset();
  document.getElementById("task-deadline").value = addDays(3);
  render();
});

document.getElementById("member-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!isLead()) return;

  const name = document.getElementById("member-name").value.trim();
  if (!name) return;

  data.members.push({
    id: makeId("m"),
    name: name,
    role: document.getElementById("member-role").value
  });

  saveData();
  event.target.reset();
  render();
});

// One listener for the whole board handles every task card
const board = document.querySelector(".board");

board.addEventListener("change", event => {
  if (!event.target.classList.contains("status-select")) return;
  const task = data.tasks.find(t => t.id === event.target.dataset.id);
  if (task && canChangeStatus(task)) {
    task.status = event.target.value;
    saveData();
    render();
  }
});

board.addEventListener("click", event => {
  if (!event.target.classList.contains("delete-btn") || !isLead()) return;
  if (confirm("Delete this task?")) {
    data.tasks = data.tasks.filter(t => t.id !== event.target.dataset.id);
    saveData();
    render();
  }
});

document.getElementById("reset-btn").addEventListener("click", () => {
  if (confirm("This will remove your changes and load the demo data again. Continue?")) {
    data = defaultData();
    currentUserId = data.members[0].id;
    filter = "all";
    saveData();
    render();
  }
});

// ---------- Start ----------
document.getElementById("task-deadline").value = addDays(3);
render();
