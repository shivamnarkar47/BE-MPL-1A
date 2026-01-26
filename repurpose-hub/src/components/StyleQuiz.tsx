import { useState } from "react";
import { requestUrl } from "@/lib/requestUrl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "@/lib/getUser";

interface Question {
    id: number;
    question: string;
    options: { label: string; value: string }[];
    category: string;
}

const questions: Question[] = [
    {
        id: 1,
        question: "How would you describe your personal style?",
        category: "style",
        options: [
            { label: "Minimalist & Clean", value: "minimalist" },
            { label: "Vintage & Retro", value: "vintage" },
            { label: "Bohemian & Artistic", value: "bohemian" },
            { label: "Modern & Trendy", value: "modern" },
        ],
    },
    {
        id: 2,
        question: "What is your primary sustainability goal?",
        category: "goal",
        options: [
            { label: "Reducing Plastic Waste", value: "plastic-free" },
            { label: "Supporting Local Artisans", value: "local" },
            { label: "Using Organic Materials", value: "organic" },
            { label: "Upcycling & Circularity", value: "upcycled" },
        ],
    },
    {
        id: 3,
        question: "Which color palette do you prefer?",
        category: "color",
        options: [
            { label: "Earthy Neutrals", value: "earthy" },
            { label: "Vibrant & Bold", value: "vibrant" },
            { label: "Pastels & Soft Tones", value: "pastels" },
            { label: "Monochrome (Black & White)", value: "monochrome" },
        ],
    },
    {
        id: 4,
        question: "What type of products are you most interested in?",
        category: "interest",
        options: [
            { label: "Home Decor & Lifestyle", value: "home" },
            { label: "Fashion & Accessories", value: "fashion" },
            { label: "Gifts & Stationery", value: "gifts" },
            { label: "Personal Care", value: "care" },
        ],
    },
];

const StyleQuiz = () => {
    const user = getCookie();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const handleNext = async () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsSaving(true);
            // Send answers to backend
            if (user?.id) {
                try {
                    await requestUrl({
                        method: "POST",
                        endpoint: "style-quiz",
                        data: {
                            user_id: user.id,
                            ...answers,
                            updated_at: new Date().toISOString()
                        }
                    });
                    setIsCompleted(true);
                } catch (err) {
                    console.error("Error saving style preferences:", err);
                    setIsCompleted(true); // Still show completion even if save fails for now
                } finally {
                    setIsSaving(false);
                }
            } else {
                setIsCompleted(true);
                setIsSaving(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleOptionChange = (value: string) => {
        setAnswers({ ...answers, [questions[currentStep].category]: value });
    };

    if (isCompleted) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
                <Card className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={48} className="text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
                    <p className="text-gray-600 mb-8">
                        We've analyzed your style and preferences. Your personalized recommendations are ready!
                    </p>
                    <div className="flex flex-col gap-4">
                        <Button
                            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
                            onClick={() => navigate("/home")}
                        >
                            View Recommendations
                        </Button>
                        <Button variant="outline" onClick={() => setIsCompleted(false)}>
                            Retake Quiz
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-600">Step {currentStep + 1} of {questions.length}</span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-green-600 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <Card className="shadow-lg border-t-4 border-t-green-600">
                <CardHeader>
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Sparkles size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Style Discovery</span>
                    </div>
                    <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
                    <CardDescription>Select the option that best describes you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={answers[currentQuestion.category]}
                        onValueChange={handleOptionChange}
                        className="space-y-4"
                    >
                        {currentQuestion.options.map((option) => (
                            <div key={option.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <RadioGroupItem value={option.value} id={option.value} />
                                <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium">
                                    {option.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between pt-6 border-t">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isSaving}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!answers[currentQuestion.category] || isSaving}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2 px-8"
                    >
                        {isSaving ? "Saving..." : currentStep === questions.length - 1 ? "Finish" : "Next"} <ArrowRight size={18} />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default StyleQuiz;
