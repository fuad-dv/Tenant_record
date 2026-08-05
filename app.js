document.addEventListener("DOMContentLoaded", () => {
    const navDashboard = document.getElementById('nav-dashboard');
    const navAddTenant = document.getElementById('nav-add-tenant');
    
    const dashboardSection = document.getElementById('dashboard-section');
    const addTenantSection = document.getElementById('add-tenant-section');

    // Function to hide all sections
    function hideAllSections() {
        dashboardSection.classList.remove('active');
        dashboardSection.classList.add('hidden');
        addTenantSection.classList.remove('active');
        addTenantSection.classList.add('hidden');
    }

    // Event Listeners for Navigation
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

    // Handle Form Submission (Placeholder logic)
    const tenantForm = document.getElementById('tenant-form');
    tenantForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Tenant information form submitted! Database integration is pending.");
        tenantForm.reset();
    });
});