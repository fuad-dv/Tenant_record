// === 1. FIREBASE SETUP & IMPORTS ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"; 

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

// === 2. DOM ELEMENTS ===
const linkDashboard = document.getElementById('link-dashboard');
const linkAddTenant = document.getElementById('link-add-tenant');
const linkTenantList = document.getElementById('link-tenant-list');
const linkCollectRent = document.getElementById('link-collect-rent');

const secDashboard = document.getElementById('sec-dashboard');
const secAddTenant = document.getElementById('sec-add-tenant');
const secTenantList = document.getElementById('sec-tenant-list');
const secCollectRent = document.getElementById('sec-collect-rent');

const tenantForm = document.getElementById('tenant-form');
const rentForm = document.getElementById('rent-form');
const tenantTableBody = document.getElementById('tenant-table-body');
const selectTenant = document.getElementById('select-tenant');
const searchTenant = document.getElementById('search-tenant');

const historyModal = document.getElementById('history-modal');
const closeModal = document.getElementById('close-modal');
const historyTableBody = document.getElementById('history-table-body');
const modalTenantName = document.getElementById('modal-tenant-name');

// === 3. NAVIGATION LOGIC ===
function hideAllSections() {
    secDashboard.classList.remove('active');
    secDashboard.classList.add('hidden');
    secAddTenant.classList.remove('active');
    secAddTenant.classList.add('hidden');
    secTenantList.classList.remove('active');
    secTenantList.classList.add('hidden');
    secCollectRent.classList.remove('active');
    secCollectRent.classList.add('hidden');
}

linkDashboard.addEventListener('click', () => { hideAllSections(); secDashboard.classList.remove('hidden'); secDashboard.classList.add('active'); });
linkAddTenant.addEventListener('click', () => { hideAllSections(); secAddTenant.classList.remove('hidden'); secAddTenant.classList.add('active'); });
linkTenantList.addEventListener('click', () => { hideAllSections(); secTenantList.classList.remove('hidden'); secTenantList.classList.add('active'); loadTenants(); });
linkCollectRent.addEventListener('click', () => { hideAllSections(); secCollectRent.classList.remove('hidden'); secCollectRent.classList.add('active'); populateTenantDropdown(); });

if(closeModal) {
    closeModal.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });
}

// === 4. TENANT REGISTRATION FORM ===
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
            await addDoc(collection(db, "tenants"), {
                name: name,
                phone: phone,
                nid: nid,
                rent: Number(rent),
                meter: meter,
                status: "active",
                registrationDate: new Date().toLocaleDateString()
            });
            alert("New tenant registered successfully!");
            tenantForm.reset();
        } catch (error) {
            console.error("Error adding tenant: ", error);
            alert("Error: Data could not be saved!");
        } finally {
            submitBtn.innerText = "Register Tenant";
        }
    });
}

// === 5. LOAD TENANTS (With Status Logic) ===
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
            
            if (isActive) {
                totalTenants++;
                totalRent += tenant.rent;
            }

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
                    <button class="btn-view" data-id="${tenantId}" data-name="${tenant.name}">View History</button>
                    <button class="btn-toggle-status" data-id="${tenantId}" data-status="${status}">${isActive ? 'Make Inactive' : 'Make Active'}</button>
                </td>
            `;
            tenantTableBody.appendChild(tr);
        });

        const totalTenantsEl = document.getElementById('total-tenants');
        const totalRentEl = document.getElementById('total-rent');
        if(totalTenantsEl) totalTenantsEl.innerText = totalTenants;
        if(totalRentEl) totalRentEl.innerText = totalRent;

        document.querySelectorAll('.btn-view').forEach(button => {
            button.addEventListener('click', (e) => {
                loadTenantHistory(e.target.getAttribute('data-id'), e.target.getAttribute('data-name')); 
            });
        });

        document.querySelectorAll('.btn-toggle-status').forEach(button => {
            button.addEventListener('click', (e) => {
                toggleTenantStatus(e.target.getAttribute('data-id'), e.target.getAttribute('data-status')); 
            });
        });

    } catch (error) {
        console.error("Error fetching tenants: ", error);
    }
}

// === 6. UPDATE TENANT STATUS ===
async function toggleTenantStatus(tenantId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if(confirm(`Are you sure you want to mark this tenant as ${newStatus}?`)) {
        try {
            await updateDoc(doc(db, "tenants", tenantId), { status: newStatus });
            loadTenants(); 
        } catch(error) {
            console.error("Error updating status: ", error);
        }
    }
}

// === 7. LIVE SEARCH ===
if (searchTenant) {
    searchTenant.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('#tenant-table-body tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
        });
    });
}

// === 8. LOAD TENANT RENT HISTORY & PRINT LOGIC ===
async function loadTenantHistory(tenantId, tenantName) {
    if(!historyModal) return;
    historyModal.classList.remove('hidden');
    modalTenantName.innerText = tenantName;
    historyTableBody.innerHTML = "<tr><td colspan='6'>History Loading...</td></tr>";

    try {
        const q = query(collection(db, "rent_records"), where("tenantId", "==", tenantId));
        const querySnapshot = await getDocs(q);
        historyTableBody.innerHTML = ""; 

        if (querySnapshot.empty) {
            historyTableBody.innerHTML = "<tr><td colspan='6'>No rental history found!</td></tr>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const record = doc.data();
            const invoiceNo = record.invoiceId || 'N/A'; // Fallback for old records without ID
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family: monospace; font-weight: bold;">${invoiceNo}</td>
                <td>${record.rentMonth}</td>
                <td style="color: green; font-weight: bold;">৳ ${record.paidAmount}</td>
                <td style="color: red;">৳ ${record.dueAmount}</td>
                <td>${record.paymentDate}</td>
                <td>
                    <button class="btn-print" onclick="printInvoice('${invoiceNo}', '${record.rentMonth}', '${record.paidAmount}', '${record.dueAmount}', '${record.paymentDate}', '${tenantName}')">Print</button>
                </td>
            `;
            historyTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error fetching history: ", error);
    }
}

// Global function for printing invoice so it can be called from onclick attribute
window.printInvoice = function(invoiceNo, month, paid, due, date, tenantName) {
    document.getElementById('inv-no').innerText = invoiceNo;
    document.getElementById('inv-date').innerText = date;
    document.getElementById('inv-tenant-name').innerText = tenantName;
    document.getElementById('inv-month').innerText = month;
    document.getElementById('inv-paid').innerText = paid;
    document.getElementById('inv-due').innerText = due;
    
    // Trigger browser print
    window.print();
}

// === 9. POPULATE DROPDOWN ===
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

// === 10. COLLECT RENT FORM SUBMIT & GENERATE INVOICE ID ===
if (rentForm) {
    rentForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const submitBtn = rentForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Saving Record...";
        
        const tenantId = document.getElementById('select-tenant').value;
        const rentMonth = document.getElementById('rent-month').value;
        const paidAmount = document.getElementById('paid-amount').value;
        const dueAmount = document.getElementById('due-amount').value;

        if (!tenantId) {
            alert("Please select a tenant!");
            submitBtn.innerText = "Save Rent Record";
            return;
        }

        // Auto Generate Invoice ID (INV-YYYY-XXXX)
        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000); 
        const generatedInvoiceId = `INV-${year}-${randomNum}`;

        try {
            await addDoc(collection(db, "rent_records"), {
                tenantId: tenantId,
                invoiceId: generatedInvoiceId,
                rentMonth: rentMonth,
                paidAmount: Number(paidAmount),
                dueAmount: Number(dueAmount),
                paymentDate: new Date().toLocaleDateString(),
                timestamp: new Date()
            });
            
            alert(`Rent saved successfully! Invoice No: ${generatedInvoiceId}`);
            rentForm.reset(); 
        } catch (error) {
            console.error("Error saving rent record: ", error);
            alert("Oops! Data could not be saved.");
        } finally {
            submitBtn.innerText = "Save Rent Record";
        }
    });
}
