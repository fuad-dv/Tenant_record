// Firebase theke dorkari function gulo import korchi (CDN diye)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Tomar Firebase Configuration (image_1792a7.png theke newa)
const firebaseConfig = {
  apiKey: "AIzaSyAih5VqemWBx7hrY3DKmqrHnP4zEcMs1pY",
  authDomain: "tenant-5d21f.firebaseapp.com",
  projectId: "tenant-5d21f",
  storageBucket: "tenant-5d21f.firebasestorage.app",
  messagingSenderId: "421609725285",
  appId: "1:421609725285:web:c799ca3eb9ec02dc1a958c"
};

// Firebase ebong Database Initialize korchi
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const navDashboard = document.getElementById('nav-dashboard');
    const navAddTenant = document.getElementById('nav-add-tenant');
    
    const dashboardSection = document.getElementById('dashboard-section');
    const addTenantSection = document.getElementById('add-tenant-section');

    // Section hide korar function
    function hideAllSections() {
        dashboardSection.classList.remove('active');
        dashboardSection.classList.add('hidden');
        addTenantSection.classList.remove('active');
        addTenantSection.classList.add('hidden');
    }

    // Menu te click korle page change hobe
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

    // Form Submit korle Data save korar logic
    const tenantForm = document.getElementById('tenant-form');
    tenantForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Page jeno reload na hoy
        
        // Form er submit button text change kore loading dekhabo
        const submitBtn = tenantForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Saving...";
        
        // User er dewa input gulo nichi
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const nid = document.getElementById('nid').value;
        const rent = document.getElementById('rent').value;

        try {
            // Firestore er "tenants" namer collection e data save korchi
            const docRef = await addDoc(collection(db, "tenants"), {
                name: name,
                phone: phone,
                nid: nid,
                rent: Number(rent),
                timestamp: new Date()
            });
            
            alert("Tenant information successfully saved!");
            tenantForm.reset(); // Form khali kore dicchi
            
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Oops! Kichu ekta somossa hoyeche data save korte.");
        } finally {
            submitBtn.innerText = "Save Tenant Information";
        }
    });
});
