// === 1. FIREBASE SETUP & IMPORTS ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Nicher config-e tomar nijer Firebase details boshabe
const firebaseConfig = {
  apiKey: "AIzaSyAih5VqemWBx7hrY3DKmqrHnP4zEcMs1pY",
  authDomain: "tenant-5d21f.firebaseapp.com",
  projectId: "tenant-5d21f",
  storageBucket: "tenant-5d21f.firebasestorage.app",
  messagingSenderId: "421609725285",
  appId: "1:421609725285:web:c799ca3eb9ec02dc1a958c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// === 2. DOM ELEMENTS ===
// Navigation links
const linkDashboard = document.getElementById('link-dashboard');
const linkAddTenant = document.getElementById('link-add-tenant');
const linkTenantList = document.getElementById('link-tenant-list');
const linkCollectRent = document.getElementById('link-collect-rent');

// Sections
const secDashboard = document.getElementById('sec-dashboard');
const secAddTenant = document.getElementById('sec-add-tenant');
const secTenantList = document.getElementById('sec-tenant-list');
const secCollectRent = document.getElementById('sec-collect-rent');

// Forms & Tables
const tenantForm = document.getElementById('tenant-form');
const rentForm = document.getElementById('rent-form');
const tenantTableBody = document.getElementById('tenant-table-body');
const selectTenant = document.getElementById('select-tenant');

// Modal Elements
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

linkDashboard.addEventListener('click', () => {
    hideAllSections();
    secDashboard.classList.remove('hidden');
    secDashboard.classList.add('active');
});

linkAddTenant.addEventListener('click', () => {
    hideAllSections();
    secAddTenant.classList.remove('hidden');
    secAddTenant.classList.add('active');
});

linkTenantList.addEventListener('click', () => {
    hideAllSections();
    secTenantList.classList.remove('hidden');
    secTenantList.classList.add('active');
    loadTenants(); // Jokhoni list page-e jabe, data load hobe
});

linkCollectRent.addEventListener('click', () => {
    hideAllSections();
    secCollectRent.classList.remove('hidden');
    secCollectRent.classList.add('active');
    populateTenantDropdown(); // Dropdown-e nam ashbe
});

// Modal Close Action
if(closeModal) {
    closeModal.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });
}


// === 4. TENANT REGISTRATION FORM SUBMIT ===
if (tenantForm) {
    tenantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = tenantForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Registering...";

        const name = document.getElementById('tenant-name').value;
        const phone = document.getElementById('tenant-phone').value;
        const nid = document.getElementById('tenant-nid').value;
        const rent = document.getElementById('tenant-rent').value;
        const meter = document.getElementById('tenant-meter').value; // Jodi thake

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
            alert("Notun varatia sothikvabe add hoyeche!");
            tenantForm.reset();
        } catch (error) {
            console.error("Error adding tenant: ", error);
            alert("Error: Data save hoyni!");
        } finally {
            submitBtn.innerText = "Register Tenant";
        }
    });
}


// === 5. LOAD TENANTS (Table & Dashboard Stats) ===
async function loadTenants() {
    if(!tenantTableBody) return;
    
    tenantTableBody.innerHTML = "<tr><td colspan='5'>Loading Data...</td></tr>";
    
    try {
        const querySnapshot = await getDocs(collection(db, "tenants"));
        tenantTableBody.innerHTML = ""; 
        
        let totalTenants = 0;
        let totalRent = 0;

        querySnapshot.forEach((doc) => {
            const tenant = doc.data();
            const tenantId = doc.id; 
            
            totalTenants++;
            totalRent += tenant.rent;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong>${tenant.name}</strong> <br>
                    <small style="color: gray;">Meter: ${tenant.meter || 'N/A'}</small>
                </td>
                <td>${tenant.phone}</td>
                <td>${tenant.nid}</td>
                <td>৳ ${tenant.rent}</td>
                <td>
                    <button class="btn-view" data-id="${tenantId}" data-name="${tenant.name}">View History</button>
                </td>
            `;
            tenantTableBody.appendChild(tr);
        });

        // Dashboard Stats update kora
        const totalTenantsEl = document.getElementById('total-tenants');
        const totalRentEl = document.getElementById('total-rent');
        if(totalTenantsEl) totalTenantsEl.innerText = totalTenants;
        if(totalRentEl) totalRentEl.innerText = totalRent;

        // View History button-e click event
        const viewButtons = document.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                loadTenantHistory(id, name); 
            });
        });

    } catch (error) {
        console.error("Error fetching tenants: ", error);
        tenantTableBody.innerHTML = "<tr><td colspan='5'>Error loading data!</td></tr>";
    }
}


// === 6. LOAD TENANT RENT HISTORY (Modal) ===
async function loadTenantHistory(tenantId, tenantName) {
    if(!historyModal) return;
    
    historyModal.classList.remove('hidden');
    modalTenantName.innerText = tenantName;
    historyTableBody.innerHTML = "<tr><td colspan='4'>History Loading...</td></tr>";

    try {
        const q = query(collection(db, "rent_records"), where("tenantId", "==", tenantId));
        const querySnapshot = await getDocs(q);
        
        historyTableBody.innerHTML = ""; 

        if (querySnapshot.empty) {
            historyTableBody.innerHTML = "<tr><td colspan='4'>Kono varar history nei!</td></tr>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const record = doc.data();
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.rentMonth}</td>
                <td style="color: green; font-weight: bold;">৳ ${record.paidAmount}</td>
                <td style="color: red;">৳ ${record.dueAmount}</td>
                <td>${record.paymentDate}</td>
            `;
            historyTableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error fetching history: ", error);
        historyTableBody.innerHTML = "<tr><td colspan='4'>Error loading history!</td></tr>";
    }
}


// === 7. POPULATE DROPDOWN FOR RENT COLLECTION ===
async function populateTenantDropdown() {
    if(!selectTenant) return;
    
    selectTenant.innerHTML = '<option value="">-- Select Tenant --</option>';
    try {
        const querySnapshot = await getDocs(collection(db, "tenants"));
        querySnapshot.forEach((doc) => {
            const tenant = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${tenant.name} (Meter: ${tenant.meter || 'N/A'})`;
            selectTenant.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading dropdown: ", error);
    }
}


// === 8. COLLECT RENT FORM SUBMIT ===
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
            alert("Doyakore ekjon varatia select korun!");
            submitBtn.innerText = "Save Rent Record";
            return;
        }

        try {
            await addDoc(collection(db, "rent_records"), {
                tenantId: tenantId,
                rentMonth: rentMonth,
                paidAmount: Number(paidAmount),
                dueAmount: Number(dueAmount),
                paymentDate: new Date().toLocaleDateString(),
                timestamp: new Date()
            });
            
            alert("Mashik varar hiseb sothikvabe save hoyeche!");
            rentForm.reset(); 
            
        } catch (error) {
            console.error("Error saving rent record: ", error);
            alert("Oops! Data save korte somossa hoyeche.");
        } finally {
            submitBtn.innerText = "Save Rent Record";
        }
    });
}
