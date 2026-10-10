"use strict";

// All client data is stored locally in IndexedDB.
const DATABASE_NAME = "personal-training-tracker-v1";
const STORE_NAME = "clients";
let databasePromise;
let clients = [];
let toastTimer;

const $ = (id) => document.getElementById(id);

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("Local storage is not supported by this browser."));
        return;
      }
      const request = indexedDB.open(DATABASE_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Close other windows running this app and try again."));
    });
  }
  return databasePromise;
}

async function listClients() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveClient(client) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(client);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Could not save."));
  });
}

// Reads and updates happen in the same transaction: repeated quick taps
// cannot accidentally overwrite a session update.
async function adjustSessions(id, delta) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    let changed = false;
    request.onsuccess = () => {
      const client = request.result;
      if (!client) return;
      const updated = client.sessions + delta;
      if (updated < 0 || updated > 100000) return;
      store.put({ ...client, sessions: updated, updatedAt: new Date().toISOString() });
      changed = true;
    };
    tx.oncomplete = () => resolve(changed);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Could not update the sessions."));
  });
}

async function removeClient(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Could not delete the client."));
  });
}

async function replaceAllClients(items) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    items.forEach(item => store.put(item));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Could not restore the backup."));
  });
}

// Keep the app's display at its fitted phone-screen size.
// This does not interfere with normal one-finger scrolling or operating-system accessibility zoom.
function preventPagePinchZoom() {
  for (const type of ["gesturestart", "gesturechange"]) {
    document.addEventListener(type, event => event.preventDefault(), { passive: false });
  }
  document.addEventListener("touchmove", event => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });
}

function toast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => { $("toast").hidden = true; }, 3300);
}

function buildClientCard(client) {
  const card = document.createElement("article");
  card.className = "client-card";
  const headingRow = document.createElement("div");
  headingRow.className = "client-main";
  const name = document.createElement("h3");
  name.className = "client-name";
  name.textContent = `${client.firstName} ${client.lastName}`;
  const remaining = document.createElement("span");
  remaining.className = `remaining${client.sessions === 0 ? " zero" : ""}`;
  const number = document.createElement("b");
  number.textContent = String(client.sessions);
  remaining.append(number, " sessions left");
  headingRow.append(name, remaining);

  const actions = document.createElement("div");
  actions.className = "card-actions";
  const button = (label, action, extraClass, disabled = false) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = `button ${extraClass}`;
    el.textContent = label;
    el.dataset.action = action;
    el.dataset.id = client.id;
    el.disabled = disabled;
    return el;
  };
  actions.append(
    button("− Use session", "minus", "button-primary", client.sessions === 0),
    button("+ Add sessions", "plus", "button-outline", client.sessions >= 100000),
    button("Delete", "delete", "button-danger remove-button")
  );
  card.append(headingRow, actions);
  return card;
}

function render() {
  clients.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "en", { sensitivity: "base" }));
  $("clients-count").textContent = String(clients.length);
  $("sessions-total").textContent = String(clients.reduce((sum, client) => sum + client.sessions, 0));
  const q = $("search-input").value.trim().toLocaleLowerCase("en");
  const visible = clients.filter(client => `${client.firstName} ${client.lastName}`.toLocaleLowerCase("en").includes(q));
  const list = $("client-list");
  list.replaceChildren(...visible.map(buildClientCard));
  $("empty-message").hidden = visible.length > 0;
  $("empty-message").textContent = clients.length === 0
    ? "No clients yet. Tap “New” to add your first client."
    : "No clients match your search.";
}

async function refresh() {
  clients = await listClients();
  render();
}

function showForm(show) {
  $("form-panel").hidden = !show;
  // Start with an empty form for every client. Never inherit a previous package size.
  $("client-form").reset();
  $("session-count").value = "";
  if (show) $("first-name").focus();
}

function validClient(input) {
  return input && typeof input.id === "string" && input.id.length > 0 && input.id.length <= 128
    && typeof input.firstName === "string" && input.firstName.trim().length > 0 && input.firstName.length <= 100
    && typeof input.lastName === "string" && input.lastName.trim().length > 0 && input.lastName.length <= 100
    && Number.isSafeInteger(input.sessions) && input.sessions >= 0 && input.sessions <= 100000;
}

function downloadBackup() {
  // The backup is unencrypted JSON. Store it securely.
  const data = {
    format: "personal-training-tracker",
    version: 1,
    exportedAt: new Date().toISOString(),
    clients: clients.map(({ id, firstName, lastName, sessions, createdAt, updatedAt }) => ({
      id, firstName, lastName, sessions, createdAt, updatedAt
    }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pt-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
  toast("Backup created. Keep the file safe.");
}

async function restoreBackup(file) {
  if (!file) return;
  if (file.size > 3_000_000) throw new Error("The backup file is too large.");
  let parsed;
  try { parsed = JSON.parse(await file.text()); }
  catch { throw new Error("This file does not contain valid JSON."); }
  if (!parsed || parsed.format !== "personal-training-tracker" || parsed.version !== 1
    || !Array.isArray(parsed.clients) || parsed.clients.length > 10000
    || !parsed.clients.every(validClient)
    || new Set(parsed.clients.map(c => c.id)).size !== parsed.clients.length) {
    throw new Error("This is not a valid PT Tracker backup.");
  }
  if (!confirm(`WARNING: This will replace all ${clients.length} current clients with ${parsed.clients.length} clients from the backup. Make sure to back up your current data first. Continue?`)) return;
  const cleanItems = parsed.clients.map(item => ({
    id: item.id, firstName: item.firstName.trim(), lastName: item.lastName.trim(),
    sessions: item.sessions, createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : ""
  }));
  await replaceAllClients(cleanItems);
  await refresh();
  toast(`${cleanItems.length} clients restored.`);
}

async function main() {
  preventPagePinchZoom();
  await refresh();
  $("add-button").addEventListener("click", () => showForm($("form-panel").hidden));
  $("cancel-button").addEventListener("click", () => showForm(false));
  $("search-input").addEventListener("input", render);

  $("client-form").addEventListener("submit", async event => {
    event.preventDefault();
    const firstName = $("first-name").value.trim();
    const lastName = $("last-name").value.trim();
    const sessionEntry = $("session-count").value.trim();
    if (sessionEntry === "") {
      alert("Enter the starting number of sessions for this client.");
      $("session-count").focus();
      return;
    }
    const sessions = Number(sessionEntry);
    const client = {
      id: crypto.randomUUID(), firstName, lastName, sessions,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    if (!validClient(client)) { alert("Enter a valid name and a whole number of sessions (0 to 100,000)."); return; }
    try {
      await saveClient(client);
      await refresh();
      showForm(false);
      toast(`${firstName} ${lastName} added.`);
    } catch(error) { alert(`Could not save: ${error.message}`); }
  });

  $("client-list").addEventListener("click", async event => {
    const target = event.target.closest("button[data-action]");
    if (!target) return;
    const { id, action } = target.dataset;
    const client = clients.find(c => c.id === id);
    if (!client) return;
    if (action === "delete" && !confirm(`Delete ${client.firstName} ${client.lastName} permanently? You can only restore this client from an earlier backup.`)) return;
    let delta = -1;
    if (action === "plus") {
      const entry = prompt(`How many sessions would you like to add for ${client.firstName} ${client.lastName}?`, "1");
      if (entry === null) return;
      delta = Number(entry);
      if (!Number.isSafeInteger(delta) || delta < 1 || client.sessions + delta > 100000) {
        alert("Enter a whole number of at least 1 (up to 100,000 sessions in total).");
        return;
      }
    }
    target.disabled = true;
    try {
      if (action === "delete") { await removeClient(id); toast("Client deleted."); }
      else {
        const changed = await adjustSessions(id, delta);
        if (changed) toast(action === "minus" ? "1 session used." : `${delta} session${delta === 1 ? "" : "s"} added.`);
      }
      await refresh();
    } catch(error) { alert(`Action failed: ${error.message}`); target.disabled = false; }
  });

  $("export-button").addEventListener("click", downloadBackup);
  $("import-button").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", async event => {
    try { await restoreBackup(event.target.files[0]); }
    catch(error) { alert(`Restore failed: ${error.message}`); }
    finally { event.target.value = ""; }
  });

  if (navigator.storage && navigator.storage.persist) {
    // Persistent storage is not guaranteed.
    navigator.storage.persist().catch(() => {});
  }

  if ("serviceWorker" in navigator) {
    let reloadingForUpdate = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!reloadingForUpdate) {
        reloadingForUpdate = true;
        window.location.reload();
      }
    });
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.warn("Could not enable offline support:", error);
    });
  }
}

main().catch(error => {
  console.error(error);
  alert("Could not open the local database. Make sure you are not using private browsing. " + error.message);
});
