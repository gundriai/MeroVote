import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Flower2 } from 'lucide-react';

// Flower Rain Component
const FlowerRain = () => {
    const [flowers, setFlowers] = useState<{ id: number; x: number; delay: number; duration: number }[]>([]);

    useEffect(() => {
        // Initial batch - Denser
        const initialFlowers = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 5 + Math.random() * 5,
        }));
        setFlowers(initialFlowers);

        // Add more flowers periodically - Faster and more
        const interval = setInterval(() => {
            const newFlowers = Array.from({ length: 3 }).map((_, i) => ({
                id: Date.now() + i,
                x: Math.random() * 100,
                delay: 0,
                duration: 5 + Math.random() * 5,
            }));

            setFlowers(prev => [
                ...prev.filter(f => f.id > Date.now() - 10000), // Cleanup old ones
                ...newFlowers
            ]);
        }, 800); // Every 800ms

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
            {flowers.map((flower) => (
                <motion.div
                    key={flower.id}
                    initial={{ y: -50, opacity: 0, rotate: 0 }}
                    animate={{ y: '120vh', opacity: [0, 1, 1, 0], rotate: 360 }}
                    transition={{
                        duration: flower.duration,
                        delay: flower.delay,
                        ease: "linear",
                        repeat: Infinity
                    }}
                    style={{ left: `${flower.x}%`, position: 'absolute' }}
                >
                    <Flower2 className="w-6 h-6 text-pink-400/60 drop-shadow-lg" />
                </motion.div>
            ))}
        </div>
    );
};

// Candle Component
const BurningCandle = () => {
    return (
        <div className="relative flex justify-center items-end h-16 w-full">
            {/* Candle Body */}
            <div className="w-4 h-12 bg-gradient-to-b from-orange-100 to-orange-200 rounded-sm relative shadow-lg">
                {/* Flame */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-6">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 0.9, 1],
                            opacity: [0.8, 1, 0.8],
                            rotate: [-2, 2, -1, 1, 0]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className="w-full h-full bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-full blur-[1px]"
                    />
                    {/* Glow */}
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500/30 rounded-full blur-md"
                    />
                </div>
            </div>
        </div>
    );
};

// Wall Frame Component
const WallFrame = ({ index }: { index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-4 flex flex-col items-center gap-4 backdrop-blur-sm hover:bg-slate-800/40 transition-colors group"
        >
            {/* Photo Placeholder (Nepal Flag) */}
            <div className="w-full aspect-[3/4] bg-slate-950/50 rounded-md overflow-hidden relative border border-slate-800/30 shadow-inner flex items-center justify-center">
                {/* Using a generic flag representation or actual image if available. 
            For now, using a stylized flag shape/color */}
                <div className="w-full h-full relative p-4 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg"
                        alt="Nepal Flag"
                        className="w-full h-full object-contain drop-shadow-md"
                    />
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
            </div>

            {/* Candle */}
            <BurningCandle />

            {/* Text */}
            <div className="text-center">
                <p className="text-slate-400 text-xs font-medium">वीर सहिद</p>
                <p className="text-slate-600 text-[10px]">अमर रहुन्</p>
            </div>
        </motion.div>
    );
};

// Torch Light Component
const TorchLight = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Left Torch */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="w-full h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-transparent rounded-full blur-[80px]"
                />
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 0.3, width: '50vw' }}
                    transition={{ duration: 3, delay: 0.5 }}
                    className="absolute top-1/2 left-1/2 h-[200px] -translate-y-1/2 bg-gradient-to-r from-yellow-200/30 via-orange-500/10 to-transparent blur-xl"
                    style={{ clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0 80%)' }}
                />
            </div>

            {/* Right Torch */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="w-full h-full bg-gradient-to-l from-orange-500 via-yellow-500 to-transparent rounded-full blur-[80px]"
                />
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 0.3, width: '50vw' }}
                    transition={{ duration: 3, delay: 0.5 }}
                    className="absolute top-1/2 right-1/2 h-[200px] -translate-y-1/2 bg-gradient-to-l from-yellow-200/30 via-orange-500/10 to-transparent blur-xl"
                    style={{ clipPath: 'polygon(100% 20%, 0 0, 0 100%, 100% 80%)' }}
                />
            </div>
        </div>
    );
};

export default function MartyrsWall() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-nepali relative overflow-hidden selection:bg-red-500/30">
            {/* Background Elements */}
            {/* Background Elements */}
            {/* Background Elements */}
            <img
                src="/assets/martyrs-bg.webp"
                alt="Background"
                className="fixed inset-0 w-full h-full object-cover opacity-40 pointer-events-none z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/80 pointer-events-none"></div>

            {/* Torch Light Effect */}
            <TorchLight />

            {/* Flower Rain Effect */}
            <FlowerRain />

            {/* Navigation */}
            <div className="absolute top-4 left-4 z-50">
                <a href="/" className="px-4 py-2 bg-slate-900/50 text-slate-300 rounded-full hover:bg-slate-800 transition-colors backdrop-blur-sm border border-slate-700 text-sm flex items-center gap-2">
                    <span>←</span> मुख्य पृष्ठ
                </a>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <h1 className="text-5xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-sm leading-tight py-2">
                            शुभ बिहानी, नेपाल!
                        </h1>
                        <p className="text-xl md:text-3xl text-yellow-100/90 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
                            "हामीले धेरै जलायौं, अब बनाऔं।"
                        </p>
                        <p className="text-lg text-slate-400 mt-4 italic">
                            (We burned a lot, let's make it.)
                        </p>
                        <div className="mt-8 flex justify-center gap-2">
                            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                            <Flame className="w-6 h-6 text-yellow-500 animate-pulse delay-75" />
                            <Flame className="w-6 h-6 text-orange-500 animate-pulse delay-150" />
                        </div>
                    </motion.div>
                </div>

                {/* The Wall Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                    {Array.from({ length: 20 }).map((_, index) => (
                        <WallFrame key={index} index={index} />
                    ))}
                </div>

                {/* Footer Message */}
                <div className="mt-20 text-center text-slate-500 text-sm">
                    <p>Gen Z क्रान्तिका सम्पूर्ण ज्ञात-अज्ञात सहिदहरूप्रति भावपूर्ण श्रद्धाञ्जली</p>
                </div>
            </div>
        </div>
    );
}
