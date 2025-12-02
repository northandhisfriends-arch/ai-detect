import { useState, useEffect, useCallback, useMemo } from "react";
// UI Components
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
// 💡 เปลี่ยนมาใช้ CheckCircle และ XCircle สำหรับสถานะ Server
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react"; 

// --- Imports ---
import maleIcon from '@/assets/male.png'; 
import femaleIcon from '@/assets/female.png'; 

// ====================================================================
// CONFIGURATION AND CONSTANTS
// ====================================================================
const API_ENDPOINT = "https://aidetect-github-io.onrender.com";
const BACKGROUND_IMAGE_URL = 'https://github.com/northandhisfriends-arch/ai-detect/blob/main/src/assets/bg_q.jpg?raw=true';
const SERVER_POLL_INTERVAL = 5000; // 5 seconds

// Define Form data structure keys based on your component logic
interface FormData {
    age: string;
    urine: string;
    bmi: string; // ค่านี้ถูกตั้งค่าอัตโนมัติจาก weight/height
    water: string;
    bp: string; // ค่านี้ถูกตั้งค่าอัตโนมัติจาก systolicBp
    mass: string;
    massChange: string;
    gender: string;
    symptoms: string[];
}

interface ModalContent {
    title: string;
    prediction: string | null;
    probability: number | null;
    error?: string;
}

// Define the required fields for validation
const requiredFieldsPart1: (keyof Omit<FormData, 'symptoms'>)[] = ["age", "gender"];
const requiredFieldsPart2: (keyof Omit<FormData, 'symptoms'>)[] = ["water", "urine", "mass", "massChange"];

// --- Data Options Map (Centralized for maintenance and mapping) ---
const FORM_OPTIONS = {
    age: [
        { value: "0-1" }, { value: "5-15" }, { value: "10-20" }, { value: "40+" }, 
        { value: "45+" }, { value: "50+" }, { value: "60+" }, { value: "65+" }
    ],
    bmi: [
        { value: ">=18.5", label: ">=18.5 (Normal/Overweight)" },
        { value: ">=25", label: ">=25 (Overweight/Obese)" },
        { value: "N/a", label: "N/a" }
    ],
    bp: [
        { value: "120/80", label: "120/80 (Normal)" }, { value: ">130/80" }, { value: "<130/80" }, 
        { value: ">=130/80" }, { value: ">140/80" }, { value: "95-145/80" }
    ],
    water: [{ value: "<=2700" }, { value: ">=3700" }],
    urine: [
        { value: "<500" }, { value: "<800" }, { value: "350-550" }, 
        { value: "800-2000", label: "800-2000 (Normal)" }, 
        { value: "2000-3000" }, { value: ">2000" }, { value: ">3000" }
    ],
    mass: [{ value: "Mass" }, { value: "Negligible" }, { value: "Overweight" }],
    massChange: [
        { value: "M+/-" }, { value: "M+7Kg" }, { value: "-M+7Kg or 10Kg" }, 
        { value: "M minus 1Kg" }, { value: "M minus 5Kg" }, { value: "M minus 10Kg" }, 
        { value: "M minus 0.5-1Kg" }, { value: "<M" }, { value: "No change" }, 
        { value: "Negligible.1", label: "Negligible Change" }
    ],
    symptoms: [
        "Wheezing", "Headache", "Short Breaths", "Rapid Breathing", "Anxiety",
        "Urine at Night", "Irritability", "Blurred Vision", "Slow Healing",
        "Dry Mouth", "Muscle Aches", "Nausea/Vomiting", "Insomnia",
        "Chest Pain", "Dizziness", "Nosebleeds", "Foamy Urine",
        "Abdominal Pain", "Itchy Skin", "Dark Urine", "Bone Pain",
    ],
} as const;


// ====================================================================
// REUSABLE COMPONENTS
// ====================================================================

// Utility component to render a Select dropdown from the FORM_OPTIONS map
interface FormSelectProps {
    field: keyof Omit<FormData, 'symptoms'>;
    label: string;
    formData: FormData;
    handleSelectChange: (field: keyof Omit<FormData, 'symptoms'>, value: string) => void;
    placeholder: string;
    disabled?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({ field, label, formData, handleSelectChange, placeholder, disabled = false }) => (
    <div>
        <Label htmlFor={`${field}-select`}>{label}</Label>
        <Select 
            onValueChange={(v) => handleSelectChange(field, v)} 
            value={formData[field]}
            disabled={disabled}
        >
            <SelectTrigger id={`${field}-select`}>
                <SelectValue placeholder={`${placeholder} ${requiredFieldsPart1.includes(field) || requiredFieldsPart2.includes(field) ? '(Required)' : ''}`} />
            </SelectTrigger>
            <SelectContent>
                {FORM_OPTIONS[field as keyof typeof FORM_OPTIONS].map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label || item.value}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);


// ====================================================================
// MAIN COMPONENT
// ====================================================================

const Questionnaire = () => {
    
    const [currentStep, setCurrentStep] = useState(1);
    const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ModalContent>({ title: "", prediction: null, probability: null });
    
    // 💡 State สำหรับ Weight, Height, และ Systolic BP Input
    const [weight, setWeight] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>(''); 
    const [systolicBp, setSystolicBp] = useState<number | ''>(''); 

    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        age: "", urine: "", bmi: "", water: "", bp: "", mass: "",
        massChange: "", gender: "", symptoms: [] as string[],
    });

    // ====================================================================
    // 1. Server Status Check
    // ====================================================================
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const res = await fetch(`${API_ENDPOINT}/api/status`);
                const data = await res.json();
                setServerStatus(data.status === "online" ? "online" : "offline");
            } catch {
                setServerStatus("offline");
            }
        };

        checkServerStatus();
        const intervalId = setInterval(checkServerStatus, SERVER_POLL_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    // ====================================================================
    // 2. Form Handlers & Calculation Logic
    // ====================================================================
    const handleSelectChange = useCallback((field: keyof Omit<FormData, 'symptoms'>, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSymptomChange = useCallback((symptom: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            symptoms: checked
                ? [...prev.symptoms, symptom]
                : prev.symptoms.filter(s => s !== symptom),
        }));
    }, []);

    // 💡 ฟังก์ชันคำนวณ BMI และตั้งค่า formData.bmi อัตโนมัติ 
    const calculateAndSetBmi = useCallback((w: number, h: number) => {
        if (w > 0 && h > 0) {
            const heightInMeters = h / 100;
            const bmiValue = w / (heightInMeters * heightInMeters);

            let selectedBmiValue: string;
            
            if (bmiValue >= 25) {
                selectedBmiValue = ">=25";
            } else if (bmiValue >= 18.5) {
                selectedBmiValue = ">=18.5";
            } else {
                selectedBmiValue = "N/a";
            }
            
            setFormData(prev => ({ ...prev, bmi: selectedBmiValue }));
        } else {
            setFormData(prev => ({ ...prev, bmi: "" })); 
        }
    }, []);

    // 💡 ฟังก์ชันคำนวณ BP และตั้งค่า formData.bp อัตโนมัติ
    const calculateAndSetBp = useCallback((sBP: number) => {
        if (sBP > 0) { 
            let selectedBpValue: string;
            
            // เงื่อนไขการเลือก BP ตามที่ผู้ใช้กำหนด:
            if (sBP === 120) {
                selectedBpValue = "120/80"; // 120
            } else if (sBP > 130 && sBP < 140) {
                selectedBpValue = ">130/80"; // (130, 140)
            } else if (sBP > 120 && sBP < 130) {
                selectedBpValue = "<130/80"; // (120, 130)
            } else if (sBP === 130) {
                selectedBpValue = ">=130/80"; // 130
            } else if (sBP >= 140 && sBP < 145) {
                selectedBpValue = ">140/80"; // [140, 145)
            } else {
                selectedBpValue = "95-145/80"; // นอกเหนือจากเงื่อนไขอื่น ๆ
            }

            setFormData(prev => ({ ...prev, bp: selectedBpValue }));
        } else {
            // ถ้า Input เป็น 0 หรือไม่ได้กรอก ให้ตั้งค่าเป็น "" เพื่อให้ Validation ตรวจจับได้
            setFormData(prev => ({ ...prev, bp: "" })); 
        }
    }, []);

    // 💡 useEffect สำหรับรันการคำนวณ BMI เมื่อ weight หรือ height เปลี่ยน 
    useEffect(() => {
        const wNum = typeof weight === 'number' ? weight : 0;
        const hNum = typeof height === 'number' ? height : 0;
        calculateAndSetBmi(wNum, hNum);
    }, [weight, height, calculateAndSetBmi]); 

    // 💡 useEffect สำหรับรันการคำนวณ BP เมื่อ systolicBp เปลี่ยน
    useEffect(() => {
        const sBpNum = typeof systolicBp === 'number' ? systolicBp : 0;
        calculateAndSetBp(sBpNum);
    }, [systolicBp, calculateAndSetBp]); 

    // ====================================================================
    // 3. Navigation Handlers 
    // ====================================================================
    const handleNext = useCallback(() => {
        
        // 1. ตรวจสอบ Inputs ที่สำคัญของ Part 1 (Weight, Height, Systolic BP)
        if (currentStep === 1) {
            if (weight === '' || height === '' || systolicBp === '') {
                 toast({
                    title: "Validation Error",
                    description: "Please fill in all primary inputs (Age, Gender, Weight, Height, and Systolic Blood Pressure) in Part 1 before proceeding.",
                    variant: "destructive"
                });
                return;
            }
        }

        // 2. ตรวจสอบ Fields อื่น ๆ ที่ถูกกำหนดใน requiredFields (Age, Gender, Part 2 fields)
        const requiredFields = currentStep === 1 ? requiredFieldsPart1 : requiredFieldsPart2;
        if (!requiredFields.every(field => formData[field] !== "")) {
            toast({
                title: "Validation Error",
                description: `Please fill in all required fields in Part ${currentStep} before proceeding.`,
                variant: "destructive"
            });
            return;
        }


        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, formData, toast, weight, height, systolicBp]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    // ====================================================================
    // 4. Submission Handler
    // ====================================================================
    const handleSubmit = async () => {
        
        // ตรวจสอบความถูกต้องของ Input State
        const isPart1InputValid = weight !== '' && height !== '' && systolicBp !== '';
        // ตรวจสอบความถูกต้องของ Field State อื่นๆ
        const isFormValid = [...requiredFieldsPart1, ...requiredFieldsPart2].every(field => formData[field] !== "") && isPart1InputValid;


        if (!isFormValid) {
            toast({
                title: "Validation Error",
                description: "Please ensure all required fields in Part 1 (including W/H/BP) and Part 2 are filled.",
                variant: "destructive"
            });
            return;
        }

        // --- One-Hot Encoding Logic (Uses the auto-set formData.bmi and formData.bp) ---
        const initial62Features: Record<string, number> = {};
        (Object.values(FORM_OPTIONS).flat() as { value: string }[]).forEach(item => {
            if (item.value) initial62Features[item.value] = 0;
        });
        FORM_OPTIONS.symptoms.forEach(s => { initial62Features[s] = 0; });
        initial62Features["Negligible.1"] = 0; 

        const data62Features: Record<string, number> = { ...initial62Features };

        // BMI และ BP จะถูกเข้ารหัสโดยใช้ค่าที่ถูกตั้งค่าอัตโนมัติใน formData
        (["age", "urine", "bmi", "water", "bp", "mass", "massChange", "gender"] as const).forEach(field => {
            const value = formData[field];
            if (value && data62Features.hasOwnProperty(value)) data62Features[value] = 1;
        });

        formData.symptoms.forEach(symptom => {
            if (data62Features.hasOwnProperty(symptom)) data62Features[symptom] = 1;
        });
        // --- End One-Hot Encoding Logic ---

        try {
            const res = await fetch(`${API_ENDPOINT}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data62Features),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status} - ${errorText.substring(0, 50)}...`);
            }

            const result = await res.json();
            const predictedDisease: string = result.prediction || 'Unknown Disease';
            const confidenceScore: number = result.probability || 0;

            setModalContent({
                title: "Analysis Result",
                prediction: predictedDisease,
                probability: confidenceScore
            });
            setIsModalOpen(true);
        } catch (err: any) {
            setModalContent({
                title: "Error",
                prediction: null,
                probability: null,
                error: `Could not connect or prediction failed: ${err.message}`
            });
            setIsModalOpen(true);
        }
    };

    // ====================================================================
    // 5. Render Functions
    // ====================================================================
    
    // Function to render Part 1: Basic Information
    const renderPart1 = useMemo(() => () => (
        <section className="p-6 border rounded-xl bg-white/80 shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-primary/80 mb-4">Part 1/3: Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Age Selection */}
                <FormSelect 
                    field="age" 
                    label="Age" 
                    placeholder="Select age" 
                    formData={formData} 
                    handleSelectChange={handleSelectChange} 
                />

                {/* Gender Selection */}
                <div>
                    <Label htmlFor="gender-select" className="mb-2 block">Gender (Required)</Label>
                    <div className="flex space-x-4">
                        <Button
                            type="button"
                            variant={formData.gender === "Male" ? "default" : "outline"}
                            onClick={() => handleSelectChange("gender", "Male")}
                            className={`flex flex-col items-center justify-center p-4 h-auto w-1/2 ${formData.gender === "Male" ? "ring-2 ring-primary border-primary" : "border-gray-300"}`}
                        >
                            <img src={maleIcon} alt="Male Icon" className="w-30 h-30 mb-2" />
                            <span className="font-semibold">Male</span>
                        </Button>

                        <Button
                            type="button"
                            variant={formData.gender === "Female" ? "default" : "outline"}
                            onClick={() => handleSelectChange("gender", "Female")}
                            className={`flex flex-col items-center justify-center p-4 h-auto w-1/2 ${formData.gender === "Female" ? "ring-2 ring-primary border-primary" : "border-gray-300"}`}
                        >
                            <img src={femaleIcon} alt="Female Icon" className="w-30 h-30 mb-2" />
                            <span className="font-semibold">Female</span>
                        </Button>
                    </div>
                </div>

                {/* 💡 INPUT: Weight (น้ำหนัก) */}
                <div>
                    <Label htmlFor="weight-input">Weight (kg) <span className="text-red-500">*</span></Label>
                    <input
                        id="weight-input"
                        type="number"
                        min="1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="Enter weight in kg"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    />
                </div>

                {/* 💡 INPUT: Height (ส่วนสูง) */}
                <div>
                    <Label htmlFor="height-input">Height (cm) <span className="text-red-500">*</span></Label>
                    <input
                        id="height-input"
                        type="number"
                        min="1"
                        value={height}
                        onChange={(e) => setHeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        placeholder="Enter height in cm"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    />
                </div>
                
                {/* 💡 DISPLAY: คำนวณ BMI อัตโนมัติ (2 columns) */}
                <div className="col-span-1 md:col-span-2">
                    <Label>Body Mass Index (BMI)</Label>
                    <div className="mt-1 p-3 border rounded-md bg-gray-50 flex justify-start items-center"> 
                        {/* แสดงเฉพาะค่า BMI ที่คำนวณได้เป็นตัวเลข */}
                        <span className="font-semibold text-lg">
                            {weight && height 
                                ? (typeof weight === 'number' && typeof height === 'number' && height > 0
                                    ? (weight / ((height / 100) ** 2)).toFixed(2)
                                    : "N/A")
                                : "N/A"}
                        </span>
                    </div>
                </div>

                {/* 💡 INPUT: Systolic Blood Pressure (BP) (2 columns) */}
                <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="systolic-bp-input">Systolic Blood Pressure (mmHg) <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-1">
                        {/* Input Field */}
                        <input
                            id="systolic-bp-input"
                            type="number"
                            min="1"
                            value={systolicBp}
                            onChange={(e) => setSystolicBp(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            placeholder="Enter Systolic BP (e.g., 125)"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                        
                        {/* ลบส่วนแสดงผล Auto-Selected BP Value ออก */}
                    </div>
                </div>

            </div>
        </section>
    ), [formData, handleSelectChange, weight, height, systolicBp]);


    // Function to render Part 2: Quantity and Weight Data
    const renderPart2 = useMemo(() => () => (
        <section className="p-6 border rounded-xl bg-white/80 shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-primary/80 mb-4">Part 2/3: Quantity and Weight Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Water Intake Selection */}
                <FormSelect 
                    field="water" 
                    label="Water Intake (mL)" 
                    placeholder="Select water intake" 
                    formData={formData} 
                    handleSelectChange={handleSelectChange} 
                />

                {/* Urine Selection */}
                <FormSelect 
                    field="urine" 
                    label="Urine per Day (mL)" 
                    placeholder="Select urine volume" 
                    formData={formData} 
                    handleSelectChange={handleSelectChange} 
                />

                {/* Mass Classification Selection */}
                <FormSelect 
                    field="mass" 
                    label="Mass Classification" 
                    placeholder="Select mass classification" 
                    formData={formData} 
                    handleSelectChange={handleSelectChange} 
                />

                {/* Mass Change Selection */}
                <FormSelect 
                    field="massChange" 
                    label="Mass Change (Relative to Normal Mass 'M')" 
                    placeholder="Select mass change" 
                    formData={formData} 
                    handleSelectChange={handleSelectChange} 
                />
            </div>
        </section>
    ), [formData, handleSelectChange]);

    // Function to render Part 3: Symptoms
    const renderPart3 = useMemo(() => () => (
        <section className="p-6 border rounded-xl bg-white/80 shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-primary/80 mb-4">Part 3/3: Symptoms</h2>
            <div>
                <Label>Symptoms (Optional: Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {FORM_OPTIONS.symptoms.map(symptom => (
                        <div key={symptom} className="flex items-center space-x-2">
                            <Checkbox
                                id={symptom}
                                checked={formData.symptoms.includes(symptom)}
                                onCheckedChange={checked => handleSymptomChange(symptom, checked === true)}
                            />
                            <Label htmlFor={symptom} className="cursor-pointer">{symptom}</Label>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    ), [formData.symptoms, handleSymptomChange]);


    // ====================================================================
    // 6. Main Render Logic
    // ====================================================================
    const isNMD = modalContent.prediction === "No Matching Disease";
    const confidencePercent = modalContent.probability !== null ? (modalContent.probability * 100).toFixed(2) : 'N/A';

    return (
        <div
            className={`min-h-screen py-20 px-4 bg-gray-100 bg-cover bg-center bg-fixed`}
            style={{ backgroundImage: `url('${BACKGROUND_IMAGE_URL}')` }}
        >

            {/* 💡 Server Status Indicator (กลับสู่รูปแบบเดิม) */}
            <div className="fixed bottom-5 right-5 bg-card rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 border border-border z-50">
                {serverStatus === "online" ? (
                    <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">Server is Online</span>
                    </>
                ) : serverStatus === "offline" ? (
                    <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">Server is Offline</span>
                    </>
                ) : (
                    <>
                        {/* Icon/Indicator for checking state can be added here if needed, or simply text */}
                        <span className="text-sm text-gray-500">Checking server...</span>
                    </>
                )}
            </div>

            {/* Content container */}
            <div className="max-w-4xl mx-auto backdrop-blur-sm bg-white/60 rounded-xl p-6 shadow-2xl">
                <h1 className="text-4xl font-bold text-center mb-8 text-primary">Health Information Questionnaire</h1>
                
                {/* Progress Indicator */}
                <div className="flex justify-center mb-6">
                    <div className={`w-1/3 h-2 rounded-l-full mx-1 ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-300'}`} />
                    <div className={`w-1/3 h-2 mx-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
                    <div className={`w-1/3 h-2 rounded-r-full mx-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`} />
                </div>

                <form className="bg-white/60 rounded-xl shadow-lg p-8 space-y-6" onSubmit={(e) => e.preventDefault()}>

                    {/* Conditional Rendering of Parts */}
                    {currentStep === 1 && renderPart1()}
                    {currentStep === 2 && renderPart2()}
                    {currentStep === 3 && renderPart3()}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4">
                        {/* Back Button */}
                        <Button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            variant="outline"
                            className="flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        {/* Next/Submit Button */}
                        {currentStep < 3 ? (
                            // NEXT BUTTON
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center"
                            >
                                Next <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            // SUBMIT BUTTON
                            <Button 
                                type="button"
                                onClick={handleSubmit}
                                size="lg" 
                                disabled={serverStatus !== 'online'}
                                className="flex items-center bg-red-600 hover:bg-red-700"
                            >
                                {serverStatus === 'online' ? "Submit for Analysis" : "Waiting for Server..."}
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Result Dialog Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-primary">{modalContent.title}</DialogTitle>

                        <div className="text-lg pt-4 space-y-3">
                            {/* Display Error Message */}
                            {modalContent.error ? (
                                <p className="text-red-600 font-semibold flex items-center">
                                    <XCircle className="w-6 h-6 mr-2" />
                                    {modalContent.error}
                                </p>
                            ) : modalContent.prediction && (
                                <>
                                    {/* Display Prediction Result */}
                                    <div className="flex items-center text-2xl font-bold">
                                        <p>
                                            Predicted Disease:
                                        </p>
                                        <span className={`ml-2 ${isNMD ? "text-green-600" : "text-red-600"}`}>
                                            {modalContent.prediction}
                                        </span>
                                        {/* Icon based on prediction */}
                                        {isNMD ? (
                                            <CheckCircle className="w-7 h-7 ml-3 text-green-600" />
                                        ) : (
                                            <XCircle className="w-7 h-7 ml-3 text-red-600" />
                                        )}
                                    </div>

                                    {/* Display Confidence Score */}
                                    <p className="text-sm text-muted-foreground">
                                        Confidence Score: {confidencePercent}%
                                    </p>

                                    {/* Recommendation based on result */}
                                    <p className="text-sm text-gray-500 pt-2 border-t mt-4">
                                        {isNMD
                                            ? "**Recommendation:** The low confidence score indicates no matching disease data in the system. Please consult a doctor for an accurate diagnosis."
                                            : "**Warning:** Please consult a healthcare professional to confirm this analysis."
                                        }
                                    </p>
                                </>
                            )}
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Questionnaire;
