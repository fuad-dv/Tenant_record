# 🏢 Shiraji Villa - Tenant Management System

![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge)

A modern, secure, and fully responsive web-based property management system tailored for "Shiraji Villa". This software streamlines tenant registration, rent and advance collection, due tracking, and generates verifiable thermal POS receipts.

> **⚠️ Notice:** This project is currently in active development. The source code is proprietary and is not licensed for public distribution, modification, or commercial use at this time. 

## ✨ Key Features

* **Advanced Dashboard:** Real-time overview of total active tenants and expected monthly revenue.
* **Tenant Management:** Register, edit, and deactivate tenants with comprehensive history tracking (Rent & Advance).
* **Smart Financial Tracking:** Collect rent and advance payments with integrated due calculation and dynamic gas bill inclusion.
* **Thermal POS Invoicing:** Generate auto-formatted receipts optimized for 80mm thermal printers.
* **QR Code Verification:** Public-facing digital invoice verification system `(/receipt.html)` linked via dynamically generated QR codes on printed receipts.
* **Prepaid Meter Integration:** Dedicated utility section displaying essential prepaid meter USSD codes for tenant reference.
* **Secure Architecture:** Firebase Authentication with strict Firestore Security Rules protecting primary data.
* **Guest Mode:** Anonymous read-only exploration mode populated with dummy data to showcase system capabilities without exposing sensitive database records.

## 🛠 Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Variables, CSS Grid/Flexbox), Vanilla JavaScript (ES6+ Module Pattern)
* **Backend / Database:** Firebase Firestore (NoSQL)
* **Authentication:** Firebase Auth (Email/Password & Anonymous Guest Login)
* **Hosting / CI-CD:** Vercel (Integrated via GitHub for continuous deployment)

## 🚀 Local Development Setup

To run this project locally for development and testing:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/shiraji-villa-tenant-system.git](https://github.com/yourusername/shiraji-villa-tenant-system.git)
   cd shiraji-villa-tenant-system
