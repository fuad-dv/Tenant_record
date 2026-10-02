import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// URL theke Invoice ID ber kora (e.g. ?inv=INV-2024-1234)
const urlParams = new URLSearchParams(window.location.search);
const invNo = urlParams.get('inv');

async function verifyInvoice() {
    if(!invNo) {
        document.getElementById('loading').innerText = "Invalid Invoice URL!";
        return;
    }

    try {
        // Guest hishebe securely login kora jate database rules kaaj kore
        await signInAnonymously(auth);

        let recordData = null;
        let tenantId = null;
        let type = 'rent';

        // Rent Records-e khujbe
        const qRent = query(collection(db, "rent_records"), where("invoiceId", "==", invNo));
        const rentSnap = await getDocs(qRent);

        if (!rentSnap.empty) {
            recordData = rentSnap.docs[0].data();
            tenantId = recordData.tenantId;
        } else {
            // Na pele Advance Records-e khujbe
            const qAdv = query(collection(db, "advance_records"), where("invoiceId", "==", invNo));
            const advSnap = await getDocs(qAdv);
            if (!advSnap.empty) {
                recordData = advSnap.docs[0].data();
                tenantId = recordData.tenantId;
                type = 'advance';
            }
        }

        if (!recordData) {
            document.getElementById('loading').innerText = "Invoice not found or deleted!";
            return;
        }

        // Tenant-er naam ber kora
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId));
        const tenantName = tenantDoc.exists() ? tenantDoc.data().name : "Unknown Tenant";

        // Page-e Data set kora
        document.getElementById('loading').style.display = 'none';
        document.getElementById('receipt-content').style.display = 'block';

        document.getElementById('r-inv').innerText = invNo;
        document.getElementById('r-date').innerText = recordData.paymentDate;
        document.getElementById('r-tenant').innerText = tenantName;

        if(type === 'advance') {
            document.getElementById('r-month').innerText = "ADVANCE PAYMENT";
            document.getElementById('r-gas-line').style.display = 'none';
            document.getElementById('r-due').innerText = "৳ " + recordData.dueAmount;
            document.getElementById('r-total').innerText = recordData.advanceAmount;
        } else {
            document.getElementById('r-month').innerText = recordData.rentMonth;
            const gasBill = recordData.gasBill !== undefined ? recordData.gasBill : 1080;
            document.getElementById('r-gas').innerText = "৳ " + gasBill;
            document.getElementById('r-due').innerText = "৳ " + recordData.dueAmount;
            document.getElementById('r-total').innerText = Number(recordData.paidAmount) + gasBill;
        }

    } catch (error) {
        document.getElementById('loading').innerText = "Error verifying invoice!";
    }
}

verifyInvoice();