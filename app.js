// 1. Firebase theke dorkari function gulo import korchi
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAih5VqemWBx7hrY3DKmqrHnP4zEcMs1pY",
  authDomain: "tenant-5d21f.firebaseapp.com",
  projectId: "tenant-5d21f",
  storageBucket: "tenant-5d21f.firebasestorage.app",
  messagingSenderId: "421609725285",
  appId: "1:421609725285:web:c799ca3eb9ec02dc1a958c"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    // Menu Elements
    const navDashboard = document.getElementById('nav-dashboard');
    const navAddTenant = document.getElementById('nav-add-tenant');
    const navTenantList = document.getElementById('nav-tenant-list');
    const navCollectRent = document.getElementById('nav-collect-rent'); 
    
    // Page Sections
    const dashboardSection = document.getElementById('dashboard-section');
    const addTenantSection = document.getElementById('add-tenant-section');
    const tenantListSection = document.getElementById('tenant-list-section');
    const collectRentSection = document.getElementById('collect-rent-section'); 

    // Table, Search & Dropdown Elements
    const tenantTableBody = document.getElementById('tenant-table-body');
    const searchBar = document.getElementById('search-bar');
    const selectTenantDropdown = document.getElementById('select-tenant');

    // === SECTION HIDE/SHOW LOGIC ===
    function hideAllSections() {
        dashboardSection.classList.remove('active');
        dashboardSection.classList.add('hidden');
        
        addTenantSection.classList.remove('active');
        addTenantSection.classList.add('hidden');
        
        tenantListSection.classList.remove('active');
        tenantListSection.classList.add('hidden');
        
        collectRentSection.classList.remove('active');
        collectRentSection.classList.add('hidden');
    }

    // === MENU CLICK EVENTS ===
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        dashboardSection.classList.remove('hidden');
        dashboardSection.classList.add('active');
    });

    navAddTenant.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        addTenantSection.classList.remove('hidden');
        addTenantSection.classList.add('active');
    });

    navTenantList.addEventListener('click', async (e) => {
        e.preventDefault();
        hideAllSections();
        tenantListSection.classList.remove('hidden');
        tenantListSection.classList.add('active');
        
        await loadTenants(); // List e click korle data load hobe
    });

    navCollectRent.addEventListener('click', async (e) => {
        e.preventDefault();
        hideAllSections();
        collectRentSection.classList.remove('hidden');
        collectRentSection.classList.add('active');
        
        await loadTenantsForDropdown(); // Rent form e click korle dropdown e nam asbe
    });

    // === 1. ADD TENANT FORM SUBMIT ===
    const tenantForm = document.getElementById('tenant-form');
    tenantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = tenantForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Saving...";
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const nid = document.getElementById('nid').value;
        const meter = document.getElementById('meter').value; 
        const rent = document.getElementById('rent').value;

        try {
            await addDoc(collection(db, "tenants"), {
                name: name,
                phone: phone,
                nid: nid,
                meter: meter,
                rent: Number(rent),
                status: "active", // Varatia ekhon running ache
                timestamp: new Date()
            });
            
            alert("Tenant successfully registered with Meter Number!");
            tenantForm.reset();
            
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Oops! Data save korte somossa hoyeche.");
        } finally {
            submitBtn.innerText = "Save Tenant Information";
        }
    });

    // === 2. LOAD TENANTS FOR TABLE ===
    async function loadTenants() {
        tenantTableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
        try {
            const querySnapshot = await getDocs(collection(db, "tenants"));
            tenantTableBody.innerHTML = ""; 
            
            let totalTenants = 0;
            let totalRent = 0;

            querySnapshot.forEach((doc) => {
                const tenant = doc.data();
                
                totalTenants++;
                totalRent += tenant.rent;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <strong>${tenant.name}</strong> <br>
                        <small style="color: gray;">Meter: ${tenant.meter || 'N/A'} | Status: ${tenant.status}</small>
                    </td>
                    <td>${tenant.phone}</td>
                    <td>${tenant.nid}</td>
                    <td>৳ ${tenant.rent}</td>
                `;
                tenantTableBody.appendChild(tr);
            });

            // Update Dashboard stats
            document.getElementById('total-tenants').innerText = totalTenants;
            document.getElementById('total-rent').innerText = totalRent;

        } catch (error) {
            console.error("Error fetching tenants: ", error);
            tenantTableBody.innerHTML = "<tr><td colspan='4'>Error loading data!</td></tr>";
        }
    }

    // === 3. SEARCH FEATURE ===
    searchBar.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        const rows = tenantTableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const name = row.cells[0].innerText.toLowerCase();
            const phone = row.cells[1].innerText.toLowerCase();
            const nid = row.cells[2].innerText.toLowerCase();

            if (name.includes(searchString) || phone.includes(searchString) || nid.includes(searchString)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    // === 4. LOAD ACTIVE TENANTS FOR RENT DROPDOWN ===
    async function loadTenantsForDropdown() {
        selectTenantDropdown.innerHTML = '<option value="">-- Loading Tenants... --</option>';
        try {
            const querySnapshot = await getDocs(collection(db, "tenants"));
            selectTenantDropdown.innerHTML = '<option value="">-- Choose a Tenant --</option>';
            
            querySnapshot.forEach((doc) => {
                const tenant = doc.data();
                // Shudhu active varatiader nam dropdown e asbe
                if(tenant.status === "active") {
                    const option = document.createElement('option');
                    option.value = doc.id; // Document ID value hisebe jabe
                    option.textContent = `${tenant.name} (${tenant.phone})`;
                    selectTenantDropdown.appendChild(option);
                }
            });
        } catch (error) {
            console.error("Error loading tenants for dropdown: ", error);
            selectTenantDropdown.innerHTML = '<option value="">-- Error loading --</option>';
        }
    }
});
