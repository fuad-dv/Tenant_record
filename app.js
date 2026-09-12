import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"; 
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAih5VqemWBx7hrY3DKmqrHnP4zEcMs1pY", 
  authDomain: "tenant-5d21f.firebaseapp.com",
  projectId: "tenant-5d21f",
  storageBucket: "tenant-5d21f.firebasestorage.app",
  messagingSenderId: "421609725285",
  appId: "1:421609725285:web:c799ca3eb9ec02dc1a958c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

let globalPropertyName = "PROPERTY NAME";

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
const linkCollectAdvance = document.getElementById('link-collect-advance'); 
const linkSettings = document.getElementById('link-settings'); 

const secDashboard = document.getElementById('sec-dashboard');
const secAddTenant = document.getElementById('sec-add-tenant');
const secTenantList = document.getElementById('sec-tenant-list');
const secCollectRent = document.getElementById('sec-collect-rent');
const secCollectAdvance = document.getElementById('sec-collect-advance'); 
const secSettings = document.getElementById('sec-settings'); 

const tenantForm = document.getElementById('tenant-form');
const rentForm = document.getElementById('rent-form');
const advanceForm = document.getElementById('advance-form'); 
const settingsForm = document.getElementById('settings-form'); 
const tenantTableBody = document.getElementById('tenant-table-body');
const selectTenant = document.getElementById('select-tenant');
const selectAdvanceTenant = document.getElementById('select-advance-tenant'); 
const searchTenant = document.getElementById('search-tenant');

const historyModal = document.getElementById('history-modal');
const closeModal = document.getElementById('close-modal');
const historyTableBody = document.getElementById('history-table-body');
const modalTenantName = document.getElementById('modal-tenant-name');

const editModal = document.getElementById('edit-modal');
const closeEditModal = document.getElementById('close-edit-modal');
const editTenantForm = document.getElementById('edit-tenant-form');

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
        } finally { submitBtn.innerText = "Login to Dashboard"; }
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
        e.preventDefault();
        try { await signOut(auth); } catch (error) {}
    });
}

function hideAllSections() {
    secDashboard.classList.remove('active'); secDashboard.classList.add('hidden');
    secAddTenant.classList.remove('active'); secAddTenant.classList.add('hidden');
    secTenantList.classList.remove('active'); secTenantList.classList.add('hidden');
    secCollectRent.classList.remove('active'); secCollectRent.classList.add('hidden');
    if(secCollectAdvance) { secCollectAdvance.classList.remove('active'); secCollectAdvance.classList.add('hidden'); }
    if(secSettings) { secSettings.classList.remove('active'); secSettings.classList.add('hidden'); }
}

linkDashboard.addEventListener('click', () => { hideAllSections(); secDashboard.classList.remove('hidden'); secDashboard.classList.add('active'); loadTenants(); });
linkAddTenant.addEventListener('click', () => { hideAllSections(); secAddTenant.classList.remove('hidden'); secAddTenant.classList.add('active'); });
linkTenantList.addEventListener('click', () => { hideAllSections(); secTenantList.classList.remove('hidden'); secTenantList.classList.add('active'); loadTenants(); });
linkCollectRent.addEventListener('click', () => { hideAllSections(); secCollectRent.classList.remove('hidden'); secCollectRent.classList.add('active'); populateTenantDropdowns(); });
if(linkCollectAdvance) {
    linkCollectAdvance.addEventListener('click', () => { hideAllSections(); secCollectAdvance.classList.remove('hidden'); secCollectAdvance.classList.add('active'); populateTenantDropdowns(); });
}
if(linkSettings) {
    linkSettings.addEventListener('click', () => { hideAllSections(); secSettings.classList.remove('hidden'); secSettings.classList.add('active'); });
}

if(closeModal) { closeModal.addEventListener('click', () => { historyModal.classList.add('hidden'); }); }
if(closeEditModal) { closeEditModal.addEventListener('click', () => { editModal.classList.add('hidden'); }); }

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
    } catch (error) {}
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
        } catch (error) {} finally { submitBtn.innerText = "Save Settings"; }
    });
}

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
            
            const safeNid = tenant.nid || '';
            const safeMeter = tenant.meter || 'N/A';
            
            const tr = document.createElement('tr');
            tr.className = isActive ? '' : 'inactive-row';
            tr.innerHTML = `
                <td>
                    <strong>${tenant.name}</strong> 
                    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">${isActive ? 'Active' : 'Inactive'}</span> <br>
                    <small style="color: gray;">Meter: ${safeMeter}</small>
                </td>
                <td>${tenant.phone}</td>
                <td>${safeNid || 'N/A'}</td>
                <td>৳ ${tenant.rent}</td>
                <td>
                    <button class="btn-view" data-id="${tenantId}" data-name="${tenant.name}" data-meter="${safeMeter}">History</button>
                    <button class="btn-edit" data-id="${tenantId}" data-name="${tenant.name}" data-phone="${tenant.phone}" data-nid="${safeNid}" data-rent="${tenant.rent}" data-meter="${safeMeter}">Edit</button>
                    <button class="btn-toggle-status" data-id="${tenantId}" data-status="${status}">${isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
            `;
            tenantTableBody.appendChild(tr);
        });
        
        if(document.getElementById('total-tenants')) document.getElementById('total-tenants').innerText = totalTenants;
        if(document.getElementById('total-rent')) document.getElementById('total-rent').innerText = totalRent;

        document.querySelectorAll('.btn-view').forEach(button => { 
            button.addEventListener('click', (e) => { 
                loadTenantHistory(e.target.getAttribute('data-id'), e.target.getAttribute('data-name'), e.target.getAttribute('data-meter')); 
            }); 
        });
        document.querySelectorAll('.btn-toggle-status').forEach(button => { 
            button.addEventListener('click', (e) => { 
                toggleTenantStatus(e.target.getAttribute('data-id'), e.target.getAttribute('data-status')); 
            }); 
        });
        document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', () => {
        openEditModal(
            button.getAttribute('data-id'), 
            button.getAttribute('data-name'), 
            button.getAttribute('data-phone'), 
            button.getAttribute('data-nid'), 
            button.getAttribute('data-rent'), 
            button.getAttribute('data-meter')
        );
    });
});
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

function openEditModal(id, name, phone, nid, rent, meter) {
    if(!editModal) return;
    document.getElementById('edit-tenant-id').value = id;
    document.getElementById('edit-tenant-name').value = name;
    document.getElementById('edit-tenant-phone').value = phone;
    document.getElementById('edit-tenant-nid').value = nid;
    document.getElementById('edit-tenant-rent').value = rent;
    document.getElementById('edit-tenant-meter').value = meter !== 'N/A' ? meter : '';
    editModal.classList.remove('hidden');
}

if(editTenantForm) {
    editTenantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = editTenantForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Updating...";
        const tenantId = document.getElementById('edit-tenant-id').value;
        const updatedData = {
            name: document.getElementById('edit-tenant-name').value,
            phone: document.getElementById('edit-tenant-phone').value,
            nid: document.getElementById('edit-tenant-nid').value,
            rent: Number(document.getElementById('edit-tenant-rent').value),
            meter: document.getElementById('edit-tenant-meter').value
        };
        try {
            await updateDoc(doc(db, "tenants", tenantId), updatedData);
            alert("Tenant info updated successfully!");
            editModal.classList.add('hidden');
            loadTenants(); 
        } catch(error) { alert("Update failed!"); } finally { submitBtn.innerText = "Update Tenant Info"; }
    });
}

// === LOAD COMBINED RENT & ADVANCE HISTORY ===
async function loadTenantHistory(tenantId, tenantName, tenantMeter) {
    if(!historyModal) return;
    historyModal.classList.remove('hidden');
    modalTenantName.innerText = tenantName;
    historyTableBody.innerHTML = "<tr><td colspan='6'>History Loading...</td></tr>";
    try {
        const qRent = query(collection(db, "rent_records"), where("tenantId", "==", tenantId));
        const rentSnap = await getDocs(qRent);
        
        const qAdv = query(collection(db, "advance_records"), where("tenantId", "==", tenantId));
        const advSnap = await getDocs(qAdv);
        
        let allRecords = [];

        rentSnap.forEach((doc) => {
            let data = doc.data();
            data.recordType = 'rent';
            allRecords.push(data);
        });

        advSnap.forEach((doc) => {
            let data = doc.data();
            data.recordType = 'advance';
            allRecords.push(data);
        });

        allRecords.sort((a, b) => b.timestamp - a.timestamp); // Notun gulo upore thakbe

        historyTableBody.innerHTML = ""; 
        if (allRecords.length === 0) { historyTableBody.innerHTML = "<tr><td colspan='6'>No rental or advance history found!</td></tr>"; return; }
        
        allRecords.forEach((record) => {
            const invoiceNo = record.invoiceId || 'N/A'; 
            const isAdvance = record.recordType === 'advance';
            
            // UI Formatting
            const monthBadge = isAdvance ? '<span style="background:#fef08a; padding:2px 6px; border-radius:4px; font-size:12px; font-weight:bold; color:#854d0e;">ADVANCE</span>' : record.rentMonth;
            const paidAmt = isAdvance ? record.advanceAmount : record.paidAmount;
            const dueAmt = isAdvance ? 'N/A' : `৳ ${record.dueAmount}`;
            const gasBillAmt = isAdvance ? 0 : (record.gasBill !== undefined ? record.gasBill : 1080);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family: monospace; font-weight: bold;">${invoiceNo}</td>
                <td>${monthBadge}</td>
                <td style="color: green; font-weight: bold;">৳ ${paidAmt}</td>
                <td style="color: ${isAdvance ? 'gray' : 'red'};">${dueAmt}</td>
                <td>${record.paymentDate}</td>
                <td>
                    <button class="btn-print" onclick="printInvoice('${invoiceNo}', '${isAdvance ? 'ADVANCE' : record.rentMonth}', ${paidAmt}, ${gasBillAmt}, '${isAdvance ? 0 : record.dueAmount}', '${tenantName}', '${tenantMeter}', '${record.recordType}')">Print</button>
                </td>
            `;
            historyTableBody.appendChild(tr);
        });
    } catch (error) {}
}

window.printInvoice = function(invoiceNo, month, paidAmount, gasBillAmt, dueAmount, tenantName, tenantMeter, type) {
    const titleElement = document.getElementById('inv-property-title');
    if(titleElement) titleElement.innerText = globalPropertyName;

    const now = new Date();
    const realDate = now.toLocaleDateString();
    const realTime = now.toLocaleTimeString();
    const finalTotal = Number(paidAmount) + Number(gasBillAmt);

    document.getElementById('inv-no').innerText = invoiceNo;
    document.getElementById('inv-date').innerText = realDate;
    document.getElementById('inv-time').innerText = realTime;
    document.getElementById('inv-tenant-name').innerText = tenantName;
    document.getElementById('inv-month').innerText = month;
    
    document.getElementById('inv-rent').innerText = paidAmount;
    document.getElementById('inv-total-paid').innerText = finalTotal;
    document.getElementById('inv-meter').innerText = tenantMeter; 

    // Dynamic Elements depending on record type
    const receiptType = document.getElementById('inv-receipt-type');
    const rentLabel = document.getElementById('inv-rent-label');
    const gasRow = document.getElementById('inv-gas-row');
    const dueRow = document.getElementById('inv-due-row');

    if (type === 'advance') {
        if(receiptType) receiptType.innerText = "ADVANCE PAYMENT RECEIPT";
        if(rentLabel) rentLabel.innerText = "ADVANCE AMOUNT";
        if(gasRow) gasRow.style.display = 'none'; // Hide Gas Bill
        if(dueRow) dueRow.style.display = 'none'; // Hide Due Amount
    } else {
        if(receiptType) receiptType.innerText = "RENT PAYMENT RECEIPT";
        if(rentLabel) rentLabel.innerText = "RENT AMOUNT";
        if(gasRow) {
            gasRow.style.display = ''; 
            document.getElementById('inv-gas-bill').innerText = gasBillAmt;
        }
        if(dueRow) {
            dueRow.style.display = ''; 
            document.getElementById('inv-due').innerText = dueAmount;
        }
    }

    const qrData = `Invoice:${invoiceNo} | Tenant:${tenantName} | Total:${finalTotal}`;
    document.getElementById('qr-code-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    setTimeout(() => { window.print(); }, 500);
}

async function populateTenantDropdowns() {
    if(selectTenant) selectTenant.innerHTML = '<option value="">-- Select Tenant --</option>';
    if(selectAdvanceTenant) selectAdvanceTenant.innerHTML = '<option value="">-- Select Tenant --</option>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "tenants"));
        querySnapshot.forEach((doc) => {
            const tenant = doc.data();
            if (tenant.status !== 'inactive') {
                const opt1 = document.createElement('option');
                opt1.value = doc.id; opt1.textContent = `${tenant.name} (Meter: ${tenant.meter || 'N/A'})`;
                if(selectTenant) selectTenant.appendChild(opt1);
                
                const opt2 = document.createElement('option');
                opt2.value = doc.id; opt2.textContent = `${tenant.name} (Meter: ${tenant.meter || 'N/A'})`;
                if(selectAdvanceTenant) selectAdvanceTenant.appendChild(opt2);
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
        
        const includeGas = document.getElementById('include-gas-bill').checked;
        const gasAmount = includeGas ? 1080 : 0;

        if (!tenantId) { alert("Please select a tenant!"); submitBtn.innerText = "Save Rent Record"; return; }

        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000); 
        const generatedInvoiceId = `INV-${year}-${randomNum}`;
        try {
            await addDoc(collection(db, "rent_records"), { 
                tenantId: tenantId, 
                invoiceId: generatedInvoiceId, 
                rentMonth: rentMonth, 
                paidAmount: Number(paidAmount), 
                gasBill: gasAmount,
                dueAmount: Number(dueAmount), 
                paymentDate: new Date().toLocaleDateString(), 
                timestamp: new Date() 
            });
            alert(`Rent saved successfully! Invoice No: ${generatedInvoiceId}`);
            rentForm.reset(); 
        } catch (error) {} finally { submitBtn.innerText = "Save Rent Record"; }
    });
}

if (advanceForm) {
    advanceForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const submitBtn = advanceForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Saving Advance...";
        const tenantId = document.getElementById('select-advance-tenant').value;
        const advanceAmount = document.getElementById('advance-amount').value;

        if (!tenantId) { alert("Please select a tenant!"); submitBtn.innerText = "Save Advance Record"; return; }

        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000); 
        const generatedInvoiceId = `ADV-${year}-${randomNum}`;

        try {
            await addDoc(collection(db, "advance_records"), { 
                tenantId: tenantId, 
                invoiceId: generatedInvoiceId,
                advanceAmount: Number(advanceAmount), 
                paymentDate: new Date().toLocaleDateString(), 
                timestamp: new Date() 
            });
            alert(`Advance of ৳${advanceAmount} saved successfully! Invoice No: ${generatedInvoiceId}`);
            advanceForm.reset(); 
        } catch (error) {} finally { submitBtn.innerText = "Save Advance Record"; }
    });
}
