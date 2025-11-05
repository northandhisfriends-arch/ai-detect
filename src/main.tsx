import React from 'react';
import ReactDOM from 'react-dom/client';
// ⭐️ นำเข้า Routes และ Route เพิ่มเติม ⭐️
import { HashRouter, Routes, Route } from 'react-router-dom';
import ServerStatusManager from './ServerStatusManager.tsx';
// ⭐️ ต้องนำเข้า Component ที่เป็นหน้าปลายทาง ⭐️
import QuestionnairePage from './pages/Questionnaire.tsx'; 
import './index.css';
import './i18n.ts';

// *******************************************************************
// ⭐️ ส่วนที่ 1: Component สำหรับเนื้อหา AI Diagnosis (ถูกสร้างในไฟล์นี้) ⭐️
// *******************************************************************
const AIProjectContent = () => (
    <>
        {/* คุณสามารถตัดสินใจได้ว่าจะแสดง ServerStatusManager ที่นี่หรือไม่ */}
        {/* ในตัวอย่างนี้ ผมใส่ ServerStatusManager ไว้ด้านบนสุดของหน้าแรก */}
        <ServerStatusManager /> 

        <main className="container mx-auto p-4 md:p-8">
            <section id="about" className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                <h2 id="introduction" className="text-3xl font-bold border-b pb-2 mb-4 text-blue-700">Introduction</h2>
                <p>People are hesitant to visit hospitals due to the high volume of patients who require hospital services.
                  It is also not convenient for many people to visit hospitals. This means they cannot receive a professional diagnosis.
                  They are either very busy or it would take too much time to go to the hospital, so they simply don’t have the time.
                  This leads to neglect of their health, as they are not receiving a trustworthy opinion. This project aims to mitigate the problems
                  stated above by utilizing **Artificial Intelligence** in the form of a website, providing easy access to assist in diagnosing any underlying
                  health problems these individuals may not be aware of.
                </p>

                <h2 id="process" className="text-3xl font-bold border-b pb-2 mb-4 pt-4 text-blue-700">Process</h2>
                <div className="space-y-1 ml-4 list-decimal">
                  <p>1. Read and go through the website’s instructions and details</p>
                  <p>2. Press the **"Start"** button</p>
                  <p>3. Patients are then required to fill out the information as requested</p>
                  <p>4. Check the filled information and press submit</p>
                  <p>5. The **AI will then analyze** the information given</p>
                  <p>6. Results will be shown after the AI finishes analyzing</p>
                </div>

                <h2 id="objectives" className="text-3xl font-bold border-b pb-2 mb-4 pt-4 text-blue-700">Objectives</h2>
                <div className="space-y-1 ml-4 list-disc">
                  <p>1. Provide **easier access** to diagnosis</p>
                  <p>2. Provide an alternative method instead of going to the hospital</p>
                  <p>3. **Reduce congestion** in hospitals</p>
                  <p>4. Prevent neglect of health</p>
                </div>

                <h2 id="how" className="text-3xl font-bold border-b pb-2 mb-4 pt-4 text-blue-700">How it works</h2>
                <p>The AI works by taking the data inputted by the users and analyzing them.
                  These data include **age, blood pressure, mass after 1 week, mass before 1 week,
                  urine per day (mL), water intake per day (mL), risk gender (Male/Female/Both), fatigue (Yes/No),
                  edema (Yes/No), confusion (Yes/No), common cold (Yes/No), thirst (Yes/No)** + other symptoms
                </p>

                <h2 id="developers" className="text-3xl font-bold border-b pb-2 mb-4 pt-4 text-blue-700">Developers</h2>
                <ul className="list-none space-y-1">
                  <li>**Nattanan Singtoroj** (Main Inventor and Project Head)</li>
                  <li>**Khunut Thewarakphithak** (Main Web-developer and Co-researcher)</li>
                  <li>**Paulprathai Chandacham** (Main Illustrator and Co-researcher)</li>
                </ul>
            </section>
        </main>
    </>
);
// *******************************************************************


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      {/* ⭐️ ใช้ <Routes> เพื่อกำหนดการจับคู่เส้นทาง ⭐️ */}
      <Routes>
        
        {/* ⭐️ แก้ไข Route หน้าแรก: ให้แสดง AIProjectContent Component ⭐️ */}
        <Route path="/" element={<ServerStatusManager />} />
        
        {/* Route สำหรับหน้า Questionnaire: https://.../site/#/questionnaire */}
        <Route path="/questionnaire" element={<QuestionnairePage />} /> 
        
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

