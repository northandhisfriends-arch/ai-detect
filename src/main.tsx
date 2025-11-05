import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ServerStatusManager from './ServerStatusManager.tsx';
import QuestionnairePage from './pages/Questionnaire.tsx'; 
import './index.css';
import './i18n.ts';

const AIProjectContent = () => (
    <>
        <ServerStatusManager /> 

        <main className="container mx-auto px-4 md:px-8 py-10 bg-gray-50 min-h-screen">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <section id="about" className="p-6 md:p-10 space-y-8">
                    
                    <div className="pt-4 pb-6 border-b border-gray-200">
                        <h2 id="introduction" className="text-4xl font-bold mb-4 text-[#007c91] tracking-tight border-b-4 border-[#007c91] pb-2 scroll-mt-20">
                            Introduction
                        </h2>
                        <p className="text-lg text-gray-800 leading-relaxed">
                            People are hesitant to visit hospitals due to the high volume of patients who require hospital services.
                            It is also not convenient for many people to visit hospitals. This means they cannot receive a professional diagnosis.
                            They are either very busy or it would take too much time to go to the hospital, so they simply don’t have the time.
                            This leads to neglect of their health, as they are not receiving a trustworthy opinion. This project aims to mitigate the problems
                            stated above by utilizing **Artificial Intelligence** in the form of a website, providing easy access to assist in diagnosing any underlying
                            health problems these individuals may not be aware of.
                        </p>
                    </div>

                    <div className="pt-4 pb-6 border-b border-gray-200">
                        <h2 id="process" className="text-4xl font-bold mb-4 text-[#007c91] tracking-tight border-b-4 border-[#007c91] pb-2 scroll-mt-20">
                            Process
                        </h2>
                        <ol className="text-lg text-gray-800 leading-relaxed">
                            <li className="font-medium">Read and go through the website’s instructions and details</li>
                            <li className="font-medium">Press the **"Start"** button</li>
                            <li className="font-medium">Patients are then required to fill out the information as requested</li>
                            <li className="font-medium">Check the filled information and press submit</li>
                            <li className="font-medium">The **AI will then analyze** the information given</li>
                            <li className="font-medium">Results will be shown after the AI finishes analyzing</li>
                        </ol>
                    </div>

                    <div className="pt-4 pb-6 border-b border-gray-200">
                        <h2 id="objectives" className="text-4xl font-bold mb-4 text-[#007c91] tracking-tight border-b-4 border-[#007c91] pb-2 scroll-mt-20">
                            Objectives
                        </h2>
                        <ul className="text-lg text-gray-800 leading-relaxed">
                            <li>1. Provide **easier access** to diagnosis</li>
                            <li>2. Provide an alternative method instead of going to the hospital</li>
                            <li>3. **Reduce congestion** in hospitals</li>
                            <li>4. Prevent neglect of health</li>
                        </ul>
                    </div>
                    
                    <div className="pt-4 pb-6 border-b border-gray-200">
                        <h2 id="how" className="text-4xl font-bold mb-4 text-[#007c91] tracking-tight border-b-4 border-[#007c91] pb-2 scroll-mt-20">
                            How it works
                        </h2>
                        <p className="text-lg text-gray-800 leading-relaxed">
                            The AI works by taking the data inputted by the users and analyzing them.
                            These data include:
                        </p>
                        <ul className="text-lg text-gray-800 leading-relaxed">
                            <li>**age**</li>
                            <li>**blood pressure**</li>
                            <li>**mass after 1 week**</li>
                            <li>**mass before 1 week**</li>
                            <li>**urine per day (mL)**</li>
                            <li>**water intake per day (mL)**</li>
                            <li>**risk gender** (Male/Female/Both)</li>
                            <li>**fatigue** (Yes/No)</li>
                            <li>**edema** (Yes/No)</li>
                            <li>**confusion** (Yes/No)</li>
                            <li>**common cold** (Yes/No)</li>
                            <li>**thirst** (Yes/No) + other symptoms</li>
                        </ul>
                    </div>

                    <div className="pt-4">
                        <h2 id="developers" className="text-4xl font-bold mb-4 text-[#007c91] tracking-tight border-b-4 border-[#007c91] pb-2 scroll-mt-20">
                            Developers
                        </h2>
                        <div className="text-lg text-gray-800 leading-relaxed">
                            <div>
                                <p className="font-semibold text-indigo-700">Nattanan Singtoroj</p>
                                <p className="pl-4 text-base text-gray-600">Main Inventor and Project Head</p>
                            </div>
                            <div>
                                <p className="font-semibold text-indigo-700">Khunut Thewarakphithak</p>
                                <p className="pl-4 text-base text-gray-600">Main Web-developer and Co-researcher</p>
                            </div>
                            <div>
                                <p className="font-semibold text-indigo-700">Paulprathai Chandacham</p>
                                <p className="pl-4 text-base text-gray-600">Main Illustrator and Co-researcher</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </>
);


const AppLayout = () => (
    <HashRouter>
        <Routes>
            <Route path="/" element={<AIProjectContent />} /> 
            <Route path="/questionnaire" element={<QuestionnairePage />} /> 
        </Routes>
        <footer className="bg-gray-800 text-white text-center p-4 mt-8">
            &copy; 2025 AIDetect Research Project
        </footer>
    </HashRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppLayout />
  </React.StrictMode>
);
