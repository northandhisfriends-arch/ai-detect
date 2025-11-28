import { useState, useEffect } from "react"; // Removed FormEvent from import
// Assuming the following components are available from a UI library like shadcn/ui
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
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";

// Define the API Endpoint for the disease prediction model
const API_ENDPOINT = "https://aidetect-github-io.onrender.com";

// Background image URL for the questionnaire
const BACKGROUND_IMAGE_URL = 'https://github.com/northandhisfriends-arch/ai-detect/blob/main/src/assets/bg_q.jpg?raw=true';

// Form data structure
interface FormData {
    age: string;
    urine: string;
    bmi: string;
    water: string;
    bp: string;
    mass: string;
    massChange: string;
    gender: string;
    symptoms: string[];
}

// Modal data structure
interface ModalContent {
    title: string;
    prediction: string | null;
    probability: number | null;
    error?: string;
}

// Define the required fields for validation on Part 1 and Part 2
const requiredFieldsPart1: (keyof Omit<FormData, 'symptoms'>)[] = ["age", "gender", "bmi", "bp"];
const requiredFieldsPart2: (keyof Omit<FormData, 'symptoms'>)[] = ["water", "urine", "mass", "massChange"];

const Questionnaire = () => {
    // State for multi-step form navigation: 1, 2, or 3
    const [currentStep, setCurrentStep] = useState(1); 
    
    // Server status and modal states (unchanged)
    const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ModalContent>({ title: "", prediction: null, probability: null });

    // Hooks (unchanged)
    const { toast } = useToast();
    const navigate = useNavigate();

    // Form data state (unchanged)
    const [formData, setFormData] = useState<FormData>({
        age: "", urine: "", bmi: "", water: "", bp: "", mass: "",
        massChange: "", gender: "", symptoms: [] as string[],
    });

    // List of symptoms (unchanged)
    const symptoms = [
        "Wheezing", "Headache", "Short Breaths", "Rapid Breathing", "Anxiety",
        "Urine at Night", "Irritability", "Blurred Vision", "Slow Healing",
        "Dry Mouth", "Muscle Aches", "Nausea/Vomiting", "Insomnia",
        "Chest Pain", "Dizziness", "Nosebleeds", "Foamy Urine",
        "Abdominal Pain", "Itchy Skin", "Dark Urine", "Bone Pain",
    ];

    // ====================================================================
    // 1. Server Status Check (Unchanged)
    // ====================================================================
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const checkServerStatus = async () => {
            try {
                const res = await fetch(`${API_ENDPOINT}/api/status`);
                const data = await res.json();
                const status = data.status === "online" ? "online" : "offline";
                setServerStatus(status);
                if (status !== "online") {
                    timeoutId = setTimeout(checkServerStatus, 5000);
                }
            } catch {
                setServerStatus("offline");
                timeoutId = setTimeout(checkServerStatus, 5000);
            }
        };
        checkServerStatus();

        return () => clearTimeout(timeoutId);
    }, []);

    // ====================================================================
    // 2. Form Handlers (Unchanged)
    // ====================================================================
    const handleSelectChange = (field: keyof Omit<FormData, 'symptoms'>, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSymptomChange = (symptom: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            symptoms: checked
                ? [...prev.symptoms, symptom]
                : prev.symptoms.filter(s => s !== symptom),
        }));
    };
    
    // ====================================================================
    // 3. Navigation Handlers
    // ====================================================================
    const handleNext = () => {
        const requiredFields = currentStep === 1 ? requiredFieldsPart1 : requiredFieldsPart2;
        const isPartValid = requiredFields.every(field => formData[field] !== "");

        if (!isPartValid) {
            toast({
                title: "Validation Error",
                description: `Please fill in all required fields in Part ${currentStep} before proceeding.`,
                variant: "destructive"
            });
            return;
        }

        // Move to the next step
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // ====================================================================
    // 4. Submission Handler (TRIGGERED ONLY BY CLICKING THE SUBMIT BUTTON)
    // ====================================================================
    const handleSubmit = async () => {
        // **IMPORTANT:** Perform final validation to ensure all critical dropdowns are filled
        const allRequiredFields = [...requiredFieldsPart1, ...requiredFieldsPart2];
        const isFormValid = allRequiredFields.every(field => formData[field] !== "");

        if (!isFormValid) {
            toast({
                title: "Validation Error",
                description: "Please ensure all required dropdown fields in Part 1 and Part 2 are selected.",
                variant: "destructive"
            });
            // Stop submission if validation fails
            return;
        }
        
        // --- One-Hot Encoding Logic (Same as before) ---
        const data62Features: Record<string, number> = {
            "0-1": 0, "5-15": 0, "10-20": 0, "40+": 0, "45+": 0, "50+": 0, "60+": 0, "65+": 0,
            "<500": 0, "<800": 0, "350-550": 0, "800-2000": 0, "2000-3000": 0, ">2000": 0, ">3000": 0,
            ">=18.5": 0, ">=25": 0, "N/a": 0,
            "<=2700": 0, ">=3700": 0,
            "120/80": 0, ">130/80": 0, "<130/80": 0, ">=130/80": 0, ">140/80": 0, "95-145/80": 0,
            "Mass": 0, "Negligible": 0, "Overweight": 0,
            "M+/-": 0, "M+7Kg": 0, "-M+7Kg or 10Kg": 0, "M minus 1Kg": 0,
            "M minus 5Kg": 0, "M minus 10Kg": 0, "M minus 0.5-1Kg": 0, "<M": 0, "No change": 0,
            "Negligible.1": 0, "Male": 0, "Female": 0,
            ...Object.fromEntries(symptoms.map(s => [s, 0]))
        };

        (["age", "urine", "bmi", "water", "bp", "mass", "massChange", "gender"] as const).forEach(field => {
            const value = formData[field];
            if (value && data62Features.hasOwnProperty(value)) data62Features[value] = 1;
        });

        formData.symptoms.forEach(symptom => {
            if (data62Features.hasOwnProperty(symptom)) data62Features[symptom] = 1;
        });
        // --- End One-Hot Encoding Logic ---

        try {
            // API call to the prediction endpoint
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

            // Set modal content and OPEN THE MODAL ONLY HERE
            setModalContent({
                title: "Analysis Result",
                prediction: predictedDisease,
                probability: confidenceScore
            });
            setIsModalOpen(true); // <--- Modal only opens after successful submission
        } catch (err: any) {
            // Handle connection or prediction error
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
    // 5. Render Functions for Each Part (Unchanged)
    // ====================================================================

    // Function to render Part 1: Basic Information
    const renderPart1 = () => (
        <section className="p-6 border rounded-xl bg-white/80 shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-primary/80 mb-4">Part 1/3: Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Age Selection */}
                <div>
                    <Label htmlFor="age-select">Age</Label>
                    <Select onValueChange={(v) => handleSelectChange("age", v)} value={formData.age}>
                        <SelectTrigger id="age-select"><SelectValue placeholder="Select age (Required)" /></SelectTrigger>
                        <SelectContent>
                            {["0-1", "5-15", "10-20", "40+", "45+", "50+", "60+", "65+"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Gender Selection */}
                <div>
                    <Label htmlFor="gender-select">Gender</Label>
                    <Select onValueChange={(v) => handleSelectChange("gender", v)} value={formData.gender}>
                        <SelectTrigger id="gender-select"><SelectValue placeholder="Select gender (Required)" /></SelectTrigger>
                        <SelectContent>
                            {["Male", "Female"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* BMI Selection */}
                <div>
                    <Label htmlFor="bmi-select">Body Mass Index (BMI)</Label>
                    <Select onValueChange={(v) => handleSelectChange("bmi", v)} value={formData.bmi}>
                        <SelectTrigger id="bmi-select"><SelectValue placeholder="Select BMI (Required)" /></SelectTrigger>
                        <SelectContent>
                            {[
                                { val: ">=18.5", label: ">=18.5 (Normal/Overweight)" },
                                { val: ">=25", label: ">=25 (Overweight/Obese)" },
                                { val: "N/a", label: "N/a" }
                            ].map(item => <SelectItem key={item.val} value={item.val}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Blood Pressure Selection */}
                <div>
                    <Label htmlFor="bp-select">Blood Pressure (Systolic/Diastolic)</Label>
                    <Select onValueChange={(v) => handleSelectChange("bp", v)} value={formData.bp}>
                        <SelectTrigger id="bp-select"><SelectValue placeholder="Select BP (Required)" /></SelectTrigger>
                        <SelectContent>
                            {["120/80", ">130/80", "<130/80", ">=130/80", ">140/80", "95-145/80"].map(v => <SelectItem key={v} value={v}>{v} {v === "120/80" && "(Normal)"}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </section>
    );

    // Function to render Part 2: Quantity and Weight Data
    const renderPart2 = () => (
        <section className="p-6 border rounded-xl bg-white/80 shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-primary/80 mb-4">Part 2/3: Quantity and Weight Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Water Intake Selection */}
                <div>
                    <Label htmlFor="water-select">Water Intake (mL)</Label>
                    <Select onValueChange={(v) => handleSelectChange("water", v)} value={formData.water}>
                        <SelectTrigger id="water-select"><SelectValue placeholder="Select water intake (Required)" /></SelectTrigger>
                        <SelectContent>
                            {["<=2700", ">=3700"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Urine Selection */}
                <div>
                    <Label htmlFor="urine-select">Urine per Day (mL)</Label>
                    <Select onValueChange={(v) => handleSelectChange("urine", v)} value={formData.urine}>
                        <SelectTrigger id="urine-select"><SelectValue placeholder="Select urine volume (Required)" /></SelectTrigger>
                        <SelectContent>
                            {["<500", "<800", "350-550", "800-2000", "2000-3000", ">2000", ">3000"].map(v => <SelectItem key={v} value={v}>{v} {v === "800-2000" && "(Normal)"}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Mass Classification Selection */}
                <div>
                    <Label htmlFor="mass-select">Mass Classification</Label>
                    <Select onValueChange={(v) => handleSelectChange("mass", v)} value={formData.mass}>
                        <SelectTrigger id="mass-select"><SelectValue placeholder="Select mass classification (Required)" /></SelectTrigger>
                        <SelectContent>
                            {["Mass", "Negligible", "Overweight"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Mass Change Selection */}
                <div>
                    <Label htmlFor="massChange-select">Mass Change (Relative to Normal Mass 'M')</Label>
                    <Select onValueChange={(v) => handleSelectChange("massChange", v)} value={formData.massChange}>
                        <SelectTrigger id="massChange-select"><SelectValue placeholder="Select mass change (Required)" /></SelectTrigger>
                        <SelectContent>
                            {["M+/-", "M+7Kg", "-M+7Kg or 10Kg", "M minus 1Kg", "M minus 5Kg", "M minus 10Kg", "M minus 0.5-1Kg", "<M", "No change", "Negligible.1"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </section>
    );

    // Function to render Part 3: Symptoms
    const renderPart3 = () => (
        <section className="p-6 border rounded-xl bg-white/80 shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-primary/80 mb-4">Part 3/3: Symptoms</h2>
            <div>
                <Label>Symptoms (Optional: Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {symptoms.map(symptom => (
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
    );

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

            {/* Server Status Indicator (Fixed Position - Unchanged) */}
            <div className="fixed bottom-5 right-5 bg-card rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 border border-border z-50">
                <span className={`w-3.5 h-3.5 rounded-full ${serverStatus === "online" ? "bg-green-500" : serverStatus === "offline" ? "bg-red-500" : "bg-gray-400"}`} />
                <span className="text-sm">
                    {serverStatus === "online" ? "Server Online" : serverStatus === "offline" ? "Cannot connect" : "Checking server..."}
                </span>
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

                {/* REMOVED onSubmit={handleSubmit} FROM THE FORM TAG */}
                {/* The form tag is now purely for structure and field grouping */}
                <form className="bg-white/60 rounded-xl shadow-lg p-8 space-y-6">

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
                            // NEXT BUTTON (Ensured type="button" and no form submission)
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center"
                            >
                                Next <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            // SUBMIT BUTTON (Only appears on Part 3)
                            <Button 
                                type="button" // Must be type="button" to prevent default form submit
                                onClick={handleSubmit} // Function is now called directly here
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

            {/* Result Dialog Modal (Unchanged) */}
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
