import { useState, useEffect, FormEvent } from "react";
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
} from "@/components/ui/dialog"; // Note: DialogDescription ถูกนำออกไป เพราะเราใช้ div/p แทน
import { useToast } from "@/hooks/use-toast";

// กำหนด Endpoint ของ API
const API_ENDPOINT = "https://aidetect-github-io.onrender.com";

// โครงสร้างข้อมูลฟอร์ม
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

const Questionnaire = () => {
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    age: "",
    urine: "",
    bmi: "",
    water: "",
    bp: "",
    mass: "",
    massChange: "",
    gender: "",
    symptoms: [] as string[],
  });

  const symptoms = [
    "Wheezing", "Headache", "Short Breaths", "Rapid Breathing", "Anxiety",
    "Urine at Night", "Irritability", "Blurred Vision", "Slow Healing",
    "Dry Mouth", "Muscle Aches", "Nausea/Vomiting", "Insomnia",
    "Chest Pain", "Dizziness", "Nosebleeds", "Foamy Urine",
    "Abdominal Pain", "Itchy Skin", "Dark Urine", "Bone Pain",
  ];

  // ====================================================================
  // 1. ตรวจสอบสถานะเซิร์ฟเวอร์ (Server Status Check)
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
          timeoutId = setTimeout(checkServerStatus, 5000); // Re-check if offline
        }
      } catch {
        setServerStatus("offline");
        timeoutId = setTimeout(checkServerStatus, 5000); // Re-check on error
      }
    };
    checkServerStatus();

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount
  }, []);

  // ====================================================================
  // 2. จัดการการเปลี่ยนแปลงของฟอร์ม (Form Handlers)
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
  // 3. จัดการการส่งฟอร์มและการทำนาย (Submission Handler)
  // ====================================================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // The comprehensive list of 62 features for one-hot encoding
    const data62Features: Record<string, number> = {
      "0-1":0,"5-15":0,"10-20":0,"40+":0,"45+":0,"50+":0,"60+":0,"65+":0,
      "<500":0,"<800":0,"350-550":0,"800-2000":0,"2000-3000":0,">2000":0,">3000":0,
      ">=18.5":0,">=25":0,"N/a":0,"<=2700":0,">=3700":0,"120/80":0,">130/80":0,
      "<130/80":0,">=130/80":0,">140/80":0,"95-145/80":0,"Mass":0,"Negligible":0,
      "Overweight":0,"M+/-":0,"M+7Kg":0,"-M+7Kg or 10Kg":0,"M minus 1Kg":0,
      "M minus 5Kg":0,"M minus 10Kg":0,"M minus 0.5-1Kg":0,"<M":0,"No change":0,
      "Negligible.1":0,"Male":0,"Female":0,
      ...Object.fromEntries(symptoms.map(s => [s, 0])) // Map symptoms to initial 0
    };

    // Map dropdown selections to 1
    (["age","urine","bmi","water","bp","mass","massChange","gender"] as const).forEach(field => {
      const value = formData[field];
      if (value && data62Features.hasOwnProperty(value)) data62Features[value] = 1;
    });

    // Map selected symptoms to 1
    formData.symptoms.forEach(symptom => {
      if (data62Features.hasOwnProperty(symptom)) data62Features[symptom] = 1;
    });
    
    // Optional: Basic validation before submission
    const requiredFields: (keyof Omit<FormData, 'symptoms'>)[] = ["age", "urine", "bmi", "water", "bp", "mass", "massChange", "gender"];
    const isFormValid = requiredFields.every(field => formData[field] !== "");

    if (!isFormValid) {
        toast({
            title: "Validation Error",
            description: "Please select a value for all required fields (dropdowns).",
            variant: "destructive"
        });
        return;
    }

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
      // 🎯 โค้ดที่เพิ่ม: รับค่า probability และคำนวณเปอร์เซ็นต์
      const predictedDisease = result.prediction;
      const confidenceScore = result.probability;
      const confidencePercent = (confidenceScore * 100).toFixed(2);
      const resultMessage = `Predicted Disease: ${predictedDisease}\nConfidence Score: ${confidencePercent}%`;

      setModalContent({ 
          title: "Analysis Result", 
          message: resultMessage 
      });
      setIsModalOpen(true);
    } catch (err: any) {
      toast({ title: "Error", description: `Could not connect or prediction failed: ${err.message}`, variant: "destructive" });
    }
  };

  // ====================================================================
  // 4. ส่วนแสดงผล (Render)
  // ====================================================================
  return (
    <div className="min-h-screen bg-background py-20 px-4">
      
      {/* Server Status Indicator (Fixed Position) */}
      <div className="fixed bottom-5 right-5 bg-card rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 border border-border z-50">
        <span className={`w-3.5 h-3.5 rounded-full ${serverStatus==="online"?"bg-green-500":serverStatus==="offline"?"bg-red-500":"bg-gray-400"}`}/>
        <span className="text-sm">
          {serverStatus==="online"?"Server Online":serverStatus==="offline"?"Cannot connect":"Checking server..."}
        </span>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">Health Information Questionnaire</h1>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-lg p-8 space-y-6">

          {/* Age */}
          <div>
            <Label htmlFor="age-select">Age</Label>
            <Select onValueChange={(v)=>handleSelectChange("age", v)} value={formData.age}>
              <SelectTrigger id="age-select"><SelectValue placeholder="Select age"/></SelectTrigger>
              <SelectContent>
                {["0-1","5-15","10-20","40+","45+","50+","60+","65+"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Urine */}
          <div>
            <Label htmlFor="urine-select">Urine per Day (mL)</Label>
            <Select onValueChange={(v)=>handleSelectChange("urine", v)} value={formData.urine}>
              <SelectTrigger id="urine-select"><SelectValue placeholder="Select urine volume"/></SelectTrigger>
              <SelectContent>
                {["<500","<800","350-550","800-2000","2000-3000",">2000",">3000"].map(v => <SelectItem key={v} value={v}>{v} {v === "800-2000" && "(Normal)"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* BMI */}
          <div>
            <Label htmlFor="bmi-select">Body Mass Index (BMI)</Label>
            <Select onValueChange={(v)=>handleSelectChange("bmi", v)} value={formData.bmi}>
              <SelectTrigger id="bmi-select"><SelectValue placeholder="Select BMI"/></SelectTrigger>
              <SelectContent>
                {[
                    { val: ">=18.5", label: ">=18.5 (Normal/Overweight)" },
                    { val: ">=25", label: ">=25 (Overweight/Obese)" },
                    { val: "N/a", label: "N/a" }
                ].map(item => <SelectItem key={item.val} value={item.val}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Water */}
          <div>
            <Label htmlFor="water-select">Water Intake (mL)</Label>
            <Select onValueChange={(v)=>handleSelectChange("water", v)} value={formData.water}>
              <SelectTrigger id="water-select"><SelectValue placeholder="Select water intake"/></SelectTrigger>
              <SelectContent>
                {["<=2700",">=3700"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Blood Pressure */}
          <div>
            <Label htmlFor="bp-select">Blood Pressure (Systolic/Diastolic)</Label>
            <Select onValueChange={(v)=>handleSelectChange("bp", v)} value={formData.bp}>
              <SelectTrigger id="bp-select"><SelectValue placeholder="Select BP"/></SelectTrigger>
              <SelectContent>
                {["120/80",">130/80","<130/80",">=130/80",">140/80","95-145/80"].map(v => <SelectItem key={v} value={v}>{v} {v === "120/80" && "(Normal)"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Mass */}
          <div>
            <Label htmlFor="mass-select">Mass Classification</Label>
            <Select onValueChange={(v)=>handleSelectChange("mass", v)} value={formData.mass}>
              <SelectTrigger id="mass-select"><SelectValue placeholder="Select mass classification"/></SelectTrigger>
              <SelectContent>
                {["Mass","Negligible","Overweight"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Mass Change */}
          <div>
            <Label htmlFor="massChange-select">Mass Change (Relative to Normal Mass 'M')</Label>
            <Select onValueChange={(v)=>handleSelectChange("massChange", v)} value={formData.massChange}>
              <SelectTrigger id="massChange-select"><SelectValue placeholder="Select mass change"/></SelectTrigger>
              <SelectContent>
                {["M+/-","M+7Kg","-M+7Kg or 10Kg","M minus 1Kg","M minus 5Kg","M minus 10Kg","M minus 0.5-1Kg","<M","No change","Negligible.1"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender-select">Gender</Label>
            <Select onValueChange={(v)=>handleSelectChange("gender", v)} value={formData.gender}>
              <SelectTrigger id="gender-select"><SelectValue placeholder="Select gender"/></SelectTrigger>
              <SelectContent>
                {["Male","Female"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Symptoms */}
          <div>
            <Label>Symptoms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {symptoms.map(symptom => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={formData.symptoms.includes(symptom)}
                    onCheckedChange={checked => handleSymptomChange(symptom, checked===true)}
                  />
                  <Label htmlFor={symptom} className="cursor-pointer">{symptom}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full mt-8" size="lg" disabled={serverStatus !== 'online'}>
            {serverStatus === 'online' ? "Submit for Analysis" : "Waiting for Server..."}
          </Button>
        </form>
      </div>

      {/* Result Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">{modalContent.title}</DialogTitle>
            
            {/* 🎯 โค้ดที่แก้ไข: ใช้ map เพื่อแสดงข้อความที่เป็นหลายบรรทัด */}
            <div className="text-lg pt-4">
              {modalContent.message.split('\n').map((line, index) => (
                <p key={index} className={index === 0 ? "font-semibold mb-2" : "text-sm text-muted-foreground"}>
                  {line}
                </p>
              ))}
            </div>
            {/* สิ้นสุดการแก้ไข */}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Questionnaire;
