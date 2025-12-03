import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight, Flame, Users, Ban, Smartphone, Flag } from 'lucide-react';

const JourneyStep = ({
    title,
    description,
    icon: Icon,
    bgClass,
    isActive,
    onNext
}: {
    title: string;
    description: string;
    icon: any;
    bgClass: string;
    isActive: boolean;
    onNext?: () => void;
}) => {
    return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className={`absolute inset-0 ${bgClass} opacity-20`}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950"></div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-4xl text-center"
            >
                <div className="mb-8 flex justify-center">
                    <div className="p-6 rounded-full bg-slate-900/50 border border-slate-700/50 backdrop-blur-md">
                        <Icon className="w-16 h-16 text-slate-200" />
                    </div>
                </div>

                <h2 className="text-4xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 font-nepali leading-tight py-4">
                    {title}
                </h2>

                <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-12 font-light">
                    {description}
                </p>

                {onNext && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNext}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium text-lg flex items-center gap-3 mx-auto transition-colors shadow-lg shadow-red-900/20"
                    >
                        अर्को चरण <ArrowRight className="w-5 h-5" />
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};

export default function RevolutionJourney() {
    console.log("RevolutionJourney rendering");
    const [currentStep, setCurrentStep] = useState(0);
    const [, setLocation] = useLocation();

    const steps = [
        {
            title: "द स्पार्क (The Spark)",
            description: "भ्रष्टाचार, नातावाद र ब्रेन ड्रेनले सीमा नाघ्यो। युवाहरूको भविष्य अन्धकारमय बन्यो। (Corruption and brain drain reached a breaking point.)",
            icon: Users,
            bgClass: "bg-slate-900"
        },
        {
            title: "द साइलेन्सिङ (The Silencing)",
            description: "सरकारले सामाजिक सञ्जालमा प्रतिबन्ध लगायो। हाम्रो आवाज दबाउने प्रयास गरियो। (Government banned social media, trying to silence us.)",
            icon: Ban,
            bgClass: "bg-red-950"
        },
        {
            title: "विद्रोह (The Uprising)",
            description: "Gen Z ले डिजिटल रूपमा संगठित भएर सडक ततायो। 'Enough is Enough' को नारा गुञ्जियो। (Gen Z organized digitally and took to the streets.)",
            icon: Smartphone,
            bgClass: "bg-orange-950"
        },
        {
            title: "उत्कर्ष (The Climax)",
            description: "सिंहदरबार घेराउ। परिवर्तनको आगो सल्कियो। (The siege of Singha Durbar. The fire of change was lit.)",
            icon: Flame,
            bgClass: "bg-red-900"
        },
        {
            title: "विजय (The Victory)",
            description: "हामीले जित्यौं। नयाँ बिहानीको सुरुवात भयो। (We won. A new dawn begins. We lost Singha Durbar :( But we will rise again.)",
            icon: Flag,
            bgClass: "bg-blue-950"
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setLocation('/martyrs-wall');
        }
    };

    return (
        <div className="h-screen w-full bg-slate-950 overflow-hidden relative font-nepali">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-900 z-50">
                <motion.div
                    className="h-full bg-red-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Background Image for Climax (Step 3 - 0 indexed is 3) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${currentStep === 3 ? 'opacity-40' : 'opacity-0'}`}>
                <img
                    src="/assets/martyrs-bg.jpg"
                    alt="Burning Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Background Image for The Spark (Step 0) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${currentStep === 0 ? 'opacity-20' : 'opacity-0'} flex items-center justify-center`}>
                <img
                    src="/assets/spark-bg.png"
                    alt="Spark Background"
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            {/* Background Image for The Silencing (Step 1) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${currentStep === 1 ? 'opacity-30' : 'opacity-0'} flex items-center justify-center`}>
                <img
                    src="/assets/silence-bg.png"
                    alt="Silence Background"
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            {/* Background Image for The Uprising (Step 2) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${currentStep === 2 ? 'opacity-40' : 'opacity-0'}`}>
                <img
                    src="/assets/uprising-bg.png"
                    alt="Uprising Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Background Image for The Victory (Step 4) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${currentStep === 4 ? 'opacity-50' : 'opacity-0'}`}>
                <img
                    src="/assets/victory-bg.png"
                    alt="Victory Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Steps */}
            {steps.map((step, index) => (
                <JourneyStep
                    key={index}
                    {...step}
                    isActive={currentStep === index}
                    onNext={handleNext}
                />
            ))}

            {/* Skip Button */}
            <button
                onClick={() => setLocation('/martyrs-wall')}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 text-sm z-50 transition-colors"
            >
                Skip Intro
            </button>
        </div>
    );
}
