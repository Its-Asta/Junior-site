function toggleMenu() {
  const navMenu = document.getElementById("nav-menu");
  navMenu.classList.toggle("show");
}

function openReservation() {
  const modal = document.getElementById("reservation-modal");
  if (modal) modal.style.display = "flex";
}

function closeReservation() {
  const modal = document.getElementById("reservation-modal");
  if (modal) modal.style.display = "none";
}

const allTables = [1, 2, 3, 4, 5];
let reservations = JSON.parse(localStorage.getItem("dinein_reservations")) || [];

function saveReservations() {
  localStorage.setItem("dinein_reservations", JSON.stringify(reservations));
}

function updateReservationList() {
  const list = document.getElementById("reservationList");
  if (!list) return;
  list.innerHTML = "";
  reservations.forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      Table ${r.table}: <strong>${r.name}</strong>
      <button class="res-btn" onclick="cancelReservation(${i})">❌ Cancel</button>
      <button class="res-btn" onclick="reschedule(${i})">🔁 Reschedule</button>
      <button class="res-btn" onclick="renameReservation(${i})">✏ Rename</button>`;
    list.appendChild(li);
  });
}

function renameReservation(index) {
  const newName = prompt("Enter new name:");
  if (newName) {
    reservations[index].name = newName.trim();
    saveReservations();
    updateReservationList();
  }
}

function cancelReservation(index) {
  if (confirm("Cancel this reservation?")) {
    reservations.splice(index, 1);
    saveReservations();
    updateReservationList();
    if (typeof populateTables === 'function') populateTables();
  }
}

function removeByName(name) {
  reservations = reservations.filter(r => r.name.toLowerCase() !== name.toLowerCase());
  saveReservations();
  document.getElementById("reservation-result").innerHTML = `<p style="color:red;">Reservation for "${name}" cancelled.</p>`;
  if (typeof updateReservationList === 'function') updateReservationList();
  if (typeof populateTables === 'function') populateTables();
}

function reschedule(index) {
  const newTable = prompt("Enter new table number (1–5):");
  if (newTable && allTables.includes(parseInt(newTable))) {
    const taken = reservations.some((r, i) => r.table == newTable && i !== index);
    if (taken) return alert("That table is already reserved.");
    reservations[index].table = newTable;
    saveReservations();
    updateReservationList();
  } else {
    alert("Invalid table number.");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function updateWalletUI() {
  const el = document.getElementById("walletDisplay");
  if (el) {
    const bal = parseInt(localStorage.getItem("wallet_balance")) || 0;
    el.textContent = `Wallet: ₦${bal}`;
  }
}

function addWalletDisplay() {
  if (!document.getElementById("walletDisplay")) {
    const div = document.createElement("div");
    div.id = "walletDisplay";
    div.className = "wallet-box";
    document.body.appendChild(div);
  }
  updateWalletUI();
}

const dineinForm = document.getElementById("dineinForm");
if (dineinForm) {
  dineinForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const table = document.getElementById("tableNumber").value;

    if (!name || !table) {
      alert("❗ Please enter your name and select a table.");
      return;
    }

    const isTaken = reservations.some(r => r.table == table);
    if (isTaken) {
      alert("❗ Table is already reserved.");
      return;
    }

    reservations.push({ name, table });
    saveReservations();
    updateReservationList();
    if (typeof populateTables === "function") populateTables();

    document.getElementById("reservation-result").innerHTML =
      `<p style="color:green;">Reservation confirmed for ${name} at Table ${table} ✅</p>` +
      `<a href="order-dinein.html?name=${encodeURIComponent(name)}&table=${table}" style="margin-top:10px; display:inline-block; background:#2e7d32;color:#fff;padding:8px 12px;border-radius:4px;text-decoration:none;">➡ Order Now</a>`;
    
    dineinForm.reset();
  });
}

function setupDeliveryForm() {
  const form = document.getElementById("deliveryForm");
  if (!form) return;

  const prices = {
    jollof: 4000, burger: 12000, pasta: 17000, salad: 10000,
    sausage: 3000, bread: 15000, coke: 800, fanta: 8500,
    sprite: 800, slushie: 2500
  };

  const fees = {
    Wuse: 1000, Gwarinpa: 1200, Asokoro: 1500,
    Maitama: 1000, Utako: 1100
  };

  document.getElementById("location").addEventListener("change", function () {
    const fee = fees[this.value] || 0;
    document.getElementById("feeInfo").textContent = "Delivery Fee: ₦" + fee;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("fullName").value;
    const location = document.getElementById("location").value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    let total = 0;
    let items = [];

    Object.keys(prices).forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        const qty = parseInt(input.value);
        if (qty > 0) {
          const cost = qty * prices[id];
          total += cost;
          items.push(`${qty} × ${id.charAt(0).toUpperCase() + id.slice(1)} — ₦${cost}`);
        }
      }
    });

    const fee = fees[location] || 0;
    total += fee;

    if (paymentMethod === "wallet") {
      let wallet = parseInt(localStorage.getItem("wallet_balance")) || 0;
      if (wallet < total) {
        alert("❌ Not enough wallet balance.");
        return;
      }
      wallet -= total;
      localStorage.setItem("wallet_balance", wallet);
      updateWalletUI();
      alert("✅ Paid with wallet.");
    } else if (paymentMethod === "card") {
      alert("✅ Card payment successful (simulated). ✅");
    } else if (paymentMethod === "transfer") {
      alert("💳 Transfer to 9110116013 (Simulated Opay Account)");
    } else {
      alert("🛵 Payment will be made on delivery");
    }

    const receipt = `
      <div style="padding:20px;background:#fff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.1);font-family:'Segoe UI';">
        <h2 style="color:#d81b60;margin-bottom:10px;">🧾 Delivery Receipt</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Location:</strong> ${location}</p>
        <ul style="margin-top:10px;">
          ${items.map(i => `<li>${i}</li>`).join("")}
          <li><strong>Delivery Fee:</strong> ₦${fee}</li>
          <li><strong>Payment Method:</strong> ${paymentMethod}</li>
          <li><strong>Total:</strong> ₦${total}</li>
        </ul>
        <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#2e7d32;color:#fff;border:none;border-radius:4px;cursor:pointer;">🖨 Print Receipt</button>
      </div>`;

    document.getElementById("confirmationMsg").innerHTML = receipt;

    const deliveryOrders = JSON.parse(localStorage.getItem("delivery_orders") || "[]");
    deliveryOrders.push({ name, location, items, fee, total, paymentMethod, timestamp: new Date().toISOString() });
    localStorage.setItem("delivery_orders", JSON.stringify(deliveryOrders));
  });
}

function setupDineinForm() {
  const form = document.getElementById("dineinOrderForm");
  if (!form) return;

  const prices = {
    jollof: 4000, burger: 12000, pasta: 17000, salad: 10000,
    sausage: 3000, bread: 15000, coke: 800, fanta: 8500,
    sprite: 800, slushie: 2500
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get("name");
    const table = urlParams.get("table");
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    let total = 0;
    let items = [];

    Object.keys(prices).forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        const qty = parseInt(input.value);
        if (qty > 0) {
          const cost = qty * prices[id];
          total += cost;
          items.push(`${qty} × ${id.charAt(0).toUpperCase() + id.slice(1)} — ₦${cost}`);
        }
      }
    });

    if (paymentMethod === "wallet") {
      let wallet = parseInt(localStorage.getItem("wallet_balance")) || 0;
      if (wallet < total) {
        alert("❌ Not enough wallet balance.");
        return;
      }
      wallet -= total;
      localStorage.setItem("wallet_balance", wallet);
      updateWalletUI();
      alert("✅ Paid with wallet.");
    } else if (paymentMethod === "card") {
      alert("✅ Card payment successful (simulated).");
    } else if (paymentMethod === "transfer") {
      alert("💳 Transfer to 9110116013 (Simulated Opay Account)");
    } else {
      alert("💵 Payment on table (simulated)");
    }

    const receipt = `
      <div style="padding:20px;background:#fff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.1);font-family:'Segoe UI';">
        <h2 style="color:#d81b60;margin-bottom:10px;">🧾 Dine-In Receipt</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Table:</strong> ${table}</p>
        <ul style="margin-top:10px;">
          ${items.map(i => `<li>${i}</li>`).join("")}
          <li><strong>Payment Method:</strong> ${paymentMethod}</li>
          <li><strong>Total:</strong> ₦${total}</li>
        </ul>
        <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#2e7d32;color:#fff;border:none;border-radius:4px;cursor:pointer;">🖨 Print Receipt</button>
      </div>`;

    document.getElementById("confirmationMsg").innerHTML = receipt;

    const dineinOrders = JSON.parse(localStorage.getItem("dinein_orders") || "[]");
    dineinOrders.push({ name, table, items, total, paymentMethod, timestamp: new Date().toISOString() });
    localStorage.setItem("dinein_orders", JSON.stringify(dineinOrders));

    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const currentMode = localStorage.getItem("theme");
  if (currentMode === "dark") document.body.classList.add("dark");

  if (document.getElementById("tableNumber")) {
    const tableSelect = document.getElementById("tableNumber");
    tableSelect.innerHTML = '<option value="">-- Select Available Table --</option>';
    allTables.forEach(t => {
      const isTaken = reservations.some(r => r.table == t);
      const option = document.createElement("option");
      option.value = t;
      option.textContent = `Table ${t}`;
      if (isTaken) option.disabled = true;
      tableSelect.appendChild(option);
    });
  }

  const nameInput = document.getElementById("nameInput");
  const resultBox = document.getElementById("reservation-result");

  if (nameInput && resultBox) {
    nameInput.addEventListener("input", function () {
      const name = this.value.trim().toLowerCase();
      const matches = reservations.filter(r => r.name.toLowerCase().includes(name));

      if (matches.length) {
        resultBox.innerHTML = matches.map(r => `
          <p style="color:green;">Reservation Found ✅</p>
          <p><strong>Name:</strong> ${r.name}</p>
          <p><strong>Table:</strong> ${r.table}</p>
          <a href="order-dinein.html?name=${encodeURIComponent(r.name)}&table=${r.table}"
             style="display:inline-block; margin-top:10px; padding:10px; background:#2e7d32; color:white; border-radius:6px; text-decoration:none;">
             ➡ Proceed to Dine-In Order
          </a><br/><br/>
          <button style="background:#c62828;color:white;padding:8px 12px;border:none;border-radius:4px;cursor:pointer;"
            onclick="removeByName('${r.name}')">❌ Cancel Reservation</button><hr/>`
        ).join("");
      } else {
        resultBox.innerHTML = `<p style="color:red;">No reservation found for "${name}"</p>`;
      }
    });
  }

  setupDeliveryForm();
  addWalletDisplay();
  setupDineinForm();
});

function handleTopupForm() {
  const form = document.getElementById("topupForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const amount = parseInt(document.getElementById("topupAmount").value);
    const method = document.getElementById("topupMethod").value;
    const msg = document.getElementById("topupMessage");

    if (isNaN(amount) || amount <= 0) {
      msg.style.color = "red";
      msg.textContent = "❌ Please enter a valid amount.";
      return;
    }

    if (method === "card") {
      alert("✅ Card payment successful.");
    } else if (method === "transfer") {
      alert("💳 Transfer ₦" + amount + " to 9110116013 (Opay Account)");
    } else if (method === "cash") {
      alert("💵 Cash payment will be handled manually.");
    }

    let balance = parseInt(localStorage.getItem("wallet_balance")) || 0;
    balance += amount;
    localStorage.setItem("wallet_balance", balance);
    updateWalletUI();

    const topups = JSON.parse(localStorage.getItem("wallet_topups") || "[]");
    topups.push({
      method,
      amount,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("wallet_topups", JSON.stringify(topups));

    msg.style.color = "green";
    msg.textContent = "✅ Wallet successfully topped up with ₦" + amount;
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  handleTopupForm();
});
