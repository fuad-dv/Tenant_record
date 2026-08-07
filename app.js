// === 1. FIREBASE SETUP & IMPORTS ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"; 
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAih5VqemWBx7hrY3DKmqrHnP4zEcMs1pY", // Ekhane tomar API key boshabe
  authDomain: "tenant-5d21f.firebaseapp.com",
  projectId: "tenant-5d21f",
  storageBucket: "tenant-5d21f.firebasestorage.app",
  messagingSenderId: "421609725285",
  appId: "1:421609725285:web:c799ca3eb9ec02dc1a958c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

// Global Variable for Property Name
let globalPropertyName = "PROPERTY NAME";

// === 2. DOM ELEMENTS ===
const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');

const mainContent = document.querySelector('.main-content');
const sidebar = document.querySelector('.sidebar');

const linkDashboard = document.getElementById('link-dashboard');
const linkAddTenant = document.getElementById('link-add-tenant');
const linkTenantList = document.getElementById('link-tenant-list');
const linkCollectRent = document.getElementById('link-collect-rent');
const linkSettings = document.getElementById('link-settings'); 

const secDashboard = document.getElementById('sec-dashboard');
const secAddTenant = document.getElementById('sec-add-tenant');
const secTenantList = document.getElementById('sec-tenant-list');
const secCollectRent = document.getElementById('sec-collect-rent');
const secSettings = document.getElementById('sec-settings'); 

const tenantForm = document.getElementById('tenant-form');
const rentForm = document.getElementById('rent-form');
const settingsForm = document.getElementById('settings-form'); 
const tenantTableBody = document.getElementById('tenant-table-body');
const selectTenant = document.getElementById('select-tenant');
const searchTenant = document.getElementById('search-tenant');

const historyModal = document.getElementById('history-modal');
const closeModal = document.getElementById('close-modal');
const historyTableBody = document.getElementById('history-table-body');
const modalTenantName = document.getElementById('modal-tenant-name');


// === 3. AUTHENTICATION LOGIC ===
mainContent.style.display = 'none';
sidebar.style.display = 'none';

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.classList.add('hidden-login');
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
        loadSettings(); 
        loadTenants(); 
    } else {
        loginScreen.classList.remove('hidden-login');
        mainContent.style.display = 'none';
        sidebar.style.display = 'none';
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Logging in...";
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            loginError.style.display = 'none';
            loginForm.reset();
        } catch (error) {
            loginError.style.display = 'block';
        } finally {
            submitBtn.innerText = "Login to Dashboard";
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
        e.preventDefault();
        try { await signOut(auth); } catch (error) {}
    });
}


// === 4. NAVIGATION LOGIC ===
function hideAllSections() {
    secDashboard.classList.remove('active'); secDashboard.classList.add('hidden');
    secAddTenant.classList.remove('active'); secAddTenant.classList.add('hidden');
    secTenantList.classList.remove('active'); secTenantList.classList.add('hidden');
    secCollectRent.classList.remove('active'); secCollectRent.classList.add('hidden');
    if(secSettings) { secSettings.classList.remove('active'); secSettings.classList.add('hidden'); }
}

linkDashboard.addEventListener('click', () => { hideAllSections(); secDashboard.classList.remove('hidden'); secDashboard.classList.add('active'); loadTenants(); });
linkAddTenant.addEventListener('click', () => { hideAllSections(); secAddTenant.classList.remove('hidden'); secAddTenant.classList.add('active'); });
linkTenantList.addEventListener('click', () => { hideAllSections(); secTenantList.classList.remove('hidden'); secTenantList.classList.add('active'); loadTenants(); });
linkCollectRent.addEventListener('click', () => { hideAllSections(); secCollectRent.classList.remove('hidden'); secCollectRent.classList.add('active'); populateTenantDropdown(); });
if(linkSettings) {
    linkSettings.addEventListener('click', () => { hideAllSections(); secSettings.classList.remove('hidden'); secSettings.classList.add('active'); });
}

if(closeModal) { closeModal.addEventListener('click', () => { historyModal.classList.add('hidden'); }); }


// === 5. SETTINGS LOGIC (Load & Save) ===
async function loadSettings() {
    try {
        const docRef = doc(db, "settings", "config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            globalPropertyName = docSnap.data().propertyName;
            if(document.getElementById('setting-property-name')) {
                document.getElementById('setting-property-name').value = globalPropertyName;
            }
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = settingsForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Saving...";
        
        const newName = document.getElementById('setting-property-name').value;
        try {
            await setDoc(doc(db, "settings", "config"), { propertyName: newName }, { merge: true });
            globalPropertyName = newName;
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            submitBtn.innerText = "Save Settings";
        }
    });
}


// === 6. TENANT REGISTRATION FORM ===
if (tenantForm) {
    tenantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = tenantForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Registering...";
        const name = document.getElementById('tenant-name').value;
        const phone = document.getElementById('tenant-phone').value;
        const nid = document.getElementById('tenant-nid').value;
        const rent = document.getElementById('tenant-rent').value;
        const meter = document.getElementById('tenant-meter').value;
        try {
            await addDoc(collection(db, "tenants"), { name: name, phone: phone, nid: nid, rent: Number(rent), meter: meter, status: "active", registrationDate: new Date().toLocaleDateString() });
            alert("New tenant registered successfully!");
            tenantForm.reset();
        } catch (error) {} finally { submitBtn.innerText = "Register Tenant"; }
    });
}


// === 7. LOAD TENANTS ===
async function loadTenants() {
    if(!tenantTableBody) return;
    tenantTableBody.innerHTML = "<tr><td colspan='5'>Loading Data...</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "tenants"));
        tenantTableBody.innerHTML = ""; 
        let totalTenants = 0; let totalRent = 0;
        querySnapshot.forEach((doc) => {
            const tenant = doc.data();
            const tenantId = doc.id; 
            const status = tenant.status || 'active';
            const isActive = status === 'active';
            if (isActive) { totalTenants++; totalRent += tenant.rent; }
            const tr = document.createElement('tr');
            tr.className = isActive ? '' : 'inactive-row';
            tr.innerHTML = `
                <td>
                    <strong>${tenant.name}</strong> 
                    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">${isActive ? 'Active' : 'Inactive'}</span> <br>
                    <small style="color: gray;">Meter: ${tenant.meter || 'N/A'}</small>
                </td>
                <td>${tenant.phone}</td>
                <td>${tenant.nid}</td>
                <td>৳ ${tenant.rent}</td>
                <td>
                    <!-- Ekhane data-nid jukto kora hoyeche jeno print er somoy pass kora jay -->
                    <button class="btn-view" data-id="${tenantId}" data-name="${tenant.name}" data-nid="${tenant.nid || 'N/A'}">View History</button>
                    <button class="btn-toggle-status" data-id="${tenantId}" data-status="${status}">${isActive ? 'Make Inactive' : 'Make Active'}</button>
                </td>
            `;
            tenantTableBody.appendChild(tr);
        });
        if(document.getElementById('total-tenants')) document.getElementById('total-tenants').innerText = totalTenants;
        if(document.getElementById('total-rent')) document.getElementById('total-rent').innerText = totalRent;

        // View history te NID receive korar jonno ektu update kora hoyeche
        document.querySelectorAll('.btn-view').forEach(button => { 
            button.addEventListener('click', (e) => { 
                loadTenantHistory(e.target.getAttribute('data-id'), e.target.getAttribute('data-name'), e.target.getAttribute('data-nid')); 
            }); 
        });
        document.querySelectorAll('.btn-toggle-status').forEach(button => { button.addEventListener('click', (e) => { toggleTenantStatus(e.target.getAttribute('data-id'), e.target.getAttribute('data-status')); }); });
    } catch (error) {}
}

async function toggleTenantStatus(tenantId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if(confirm(`Are you sure you want to mark this tenant as ${newStatus}?`)) {
        try { await updateDoc(doc(db, "tenants", tenantId), { status: newStatus }); loadTenants(); } catch(error) {}
    }
}

if (searchTenant) {
    searchTenant.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('#tenant-table-body tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none'; });
    });
}


// === 8. LOAD TENANT RENT HISTORY & PRINT LOGIC (POS Update) ===
async function loadTenantHistory(tenantId, tenantName, tenantNid) {
    if(!historyModal) return;
    historyModal.classList.remove('hidden');
    modalTenantName.innerText = tenantName;
    historyTableBody.innerHTML = "<tr><td colspan='6'>History Loading...</td></tr>";
    try {
        const q = query(collection(db, "rent_records"), where("tenantId", "==", tenantId));
        const querySnapshot = await getDocs(q);
        historyTableBody.innerHTML = ""; 
        if (querySnapshot.empty) { historyTableBody.innerHTML = "<tr><td colspan='6'>No rental history found!</td></tr>"; return; }
        querySnapshot.forEach((doc) => {
            const record = doc.data();
            const invoiceNo = record.invoiceId || 'N/A'; 
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family: monospace; font-weight: bold;">${invoiceNo}</td>
                <td>${record.rentMonth}</td>
                <td style="color: green; font-weight: bold;">৳ ${record.paidAmount}</td>
                <td style="color: red;">৳ ${record.dueAmount}</td>
                <td>${record.paymentDate}</td>
                <td>
                    <!-- Print button e ekhon NID o pass kora hocche -->
                    <button class="btn-print" onclick="printInvoice('${invoiceNo}', '${record.rentMonth}', ${record.paidAmount}, ${record.dueAmount}, '${tenantName}', '${tenantNid}')">Print Receipt</button>
                </td>
            `;
            historyTableBody.appendChild(tr);
        });
    } catch (error) {}
}

window.printInvoice = function(invoiceNo, month, paidAmount, dueAmount, tenantName, tenantNid) {
    // Dynamic Settings Title
    const titleElement = document.getElementById('inv-property-title');
    if(titleElement) titleElement.innerText = globalPropertyName;

    // Real-time Date and Time setup
    const now = new Date();
    const realDate = now.toLocaleDateString();
    const realTime = now.toLocaleTimeString();

    // Calculations (Rent + Default Gas Bill)
    const fixedGasBill = 1080;
    const finalTotal = Number(paidAmount) + fixedGasBill;

    // Setting values to POS Template HTML IDs
    document.getElementById('inv-no').innerText = invoiceNo;
    document.getElementById('inv-date').innerText = realDate;
    document.getElementById('inv-time').innerText = realTime;
    document.getElementById('inv-tenant-name').innerText = tenantName;
    document.getElementById('inv-nid').innerText = tenantNid;
    document.getElementById('inv-month').innerText = month;
    
    document.getElementById('inv-rent').innerText = paidAmount;
    document.getElementById('inv-due').innerText = dueAmount;
    document.getElementById('inv-total-paid').innerText = finalTotal;

    // Generate Dynamic QR Code using public API
    const qrData = `Invoice:${invoiceNo} | Tenant:${tenantName} | Total:${finalTotal}`;
    document.getElementById('qr-code-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    // Timeout dewa hoyeche jeno QR code ta load howar somoy pay, tarpor print window asbe
    setTimeout(() => {
        window.print();
    }, 500);
}


// === 9. POPULATE DROPDOWN & RENT SUBMIT ===
async function populateTenantDropdown() {
    if(!selectTenant) return;
    selectTenant.innerHTML = '<option value="">-- Select Tenant --</option>';
    try {
        const querySnapshot = await getDocs(collection(db, "tenants"));
        querySnapshot.forEach((doc) => {
            const tenant = doc.data();
            if (tenant.status !== 'inactive') {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${tenant.name} (Meter: ${tenant.meter || 'N/A'})`;
                selectTenant.appendChild(option);
            }
        });
    } catch (error) {}
}

if (rentForm) {
    rentForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const submitBtn = rentForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Saving Record...";
        const tenantId = document.getElementById('select-tenant').value;
        const rentMonth = document.getElementById('rent-month').value;
        const paidAmount = document.getElementById('paid-amount').value;
        const dueAmount = document.getElementById('due-amount').value;
        if (!tenantId) { alert("Please select a tenant!"); submitBtn.innerText = "Save Rent Record"; return; }

        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000); 
        const generatedInvoiceId = `INV-${year}-${randomNum}`;
        try {
            await addDoc(collection(db, "rent_records"), { tenantId: tenantId, invoiceId: generatedInvoiceId, rentMonth: rentMonth, paidAmount: Number(paidAmount), dueAmount: Number(dueAmount), paymentDate: new Date().toLocaleDateString(), timestamp: new Date() });
            alert(`Rent saved successfully! Invoice No: ${generatedInvoiceId}`);
            rentForm.reset(); 
        } catch (error) {} finally { submitBtn.innerText = "Save Rent Record"; }
    });
}
