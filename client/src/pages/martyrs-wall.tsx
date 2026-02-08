import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Flower2, Leaf } from 'lucide-react';

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
const WallFrame = ({ index, name, address }: { index: number; name: string; address: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-sm p-4 flex flex-col items-center gap-2 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden h-full max-w-[280px] mx-auto"
        >
            {/* Top Text */}
            <div className="text-center mb-1">
                <p className="font-serif text-slate-800 text-sm italic">In loving</p>
                <p className="font-serif text-slate-900 text-2xl font-bold italic tracking-wide">memory</p>
            </div>

            {/* Photo/Name Placeholder Area */}
            <div className="relative w-full aspect-[3/4] max-w-[180px] mx-auto mb-2">
                {/* Central Container */}
                <div className="w-full h-full bg-slate-50/50 rounded-lg overflow-hidden flex items-center justify-center relative shadow-inner border border-slate-100 p-4">
                    {/* Background Flag (Low Opacity) */}
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg"
                        alt="Flag Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-10 blur-[0.5px]"
                    />

                    {/* Name in Center */}
                    <p className="relative z-10 text-slate-900 font-bold text-lg text-center leading-tight drop-shadow-sm font-serif break-words w-full">
                        {name}
                    </p>
                </div>

                {/* Decorative Leaves */}
                <Leaf className="absolute -left-4 bottom-8 w-8 h-8 text-black fill-black rotate-[-45deg]" />
                <Leaf className="absolute -right-4 bottom-8 w-8 h-8 text-black fill-black rotate-[45deg] scale-x-[-1]" />
            </div>

            {/* Candle */}
            <div className="scale-75 -my-2">
                <BurningCandle />
            </div>

            {/* Bottom Address Section */}
            <div className="w-full mt-auto relative min-h-[3rem] flex flex-col items-center justify-center">
                <div className="text-center w-full px-2 border-t border-slate-100 pt-2">
                    <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-tight" title={address}>{address}</p>
                </div>
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

const MARTYRS = [
    {
        "Name": "Buddha Bahadur Tamang",
        "Address": "Kirtipur Municipality–2, Kathmandu"
    },
    {
        "Name": "Iswat Bahadur Adhikari",
        "Address": "Kathmandu Metropolitan City–11"
    },
    {
        "Name": "Santosh Bishwakarma",
        "Address": "Belka Municipality–4, Udayapur"
    },
    {
        "Name": "Sulav Raj Shrestha",
        "Address": "Nepalgunj Sub-Metropolitan City–1, Banke"
    },
    {
        "Name": "Ayush Thapa",
        "Address": "Nepalgunj Sub-Metropolitan City–1, Banke"
    },
    {
        "Name": "Shriyam Chaulagain",
        "Address": "Belbari Municipality–11, Morang"
    },
    {
        "Name": "Gaurav Joshi",
        "Address": "Dhangadhi Sub-Metropolitan City–5, Kailali"
    },
    {
        "Name": "Yog Bahadur Shrestha",
        "Address": "Bahrabise Municipality–6, Sindhupalchok"
    },
    {
        "Name": "Umesh Mahat",
        "Address": "Chautara Sangachokgadhi Municipality–8"
    },
    {
        "Name": "Asahab Alam Thakurai",
        "Address": "Birgunj Metropolitan City–12, Parsa"
    },
    {
        "Name": "Sauran Kishor Shrestha",
        "Address": "Baglung Municipality–4, Baglung"
    },
    {
        "Name": "Subhash Kumar Bohora",
        "Address": "Khaptad Chhanna Rural Municipality–7, Bajhang"
    },
    {
        "Name": "Bhimraj Dhami",
        "Address": "Durgathali Rural Municipality–1, Bajura"
    },
    {
        "Name": "Rasik Khatri Khatiwada",
        "Address": "Panauti Municipality–10, Kavrepalanchok"
    },
    {
        "Name": "Dilanarayan Tamang",
        "Address": "Temal Rural Municipality–7, Kavrepalanchok"
    },
    {
        "Name": "Vinod Maharjan",
        "Address": "Lalitpur Metropolitan City–7"
    },
    {
        "Name": "Yogendra Nyaupane",
        "Address": "Golanjor Rural Municipality–1, Sindhuli"
    },
    {
        "Name": "Milan Rai",
        "Address": "Dudhauli Municipality–8, Sindhuli"
    },
    {
        "Name": "Dipesh Sunuwar",
        "Address": "Tinpatan Rural Municipality–6, Sindhuli"
    },
    {
        "Name": "Chhatraman Kuthumi",
        "Address": "Pakhribas Municipality–2, Dhankuta"
    },
    {
        "Name": "Ojhan Budha",
        "Address": "Swamikartik Khapar Rural Municipality–2, Bajura"
    },
    {
        "Name": "Sarkumar Rai",
        "Address": "Chaudandigadhi Municipality–3, Udayapur"
    },
    {
        "Name": "Shabharaj Balami Shrestha",
        "Address": "Kakani Rural Municipality–1, Nuwakot"
    },
    {
        "Name": "Lachhuman Rai",
        "Address": "Panchakanya Rural Municipality–2, Nuwakot"
    },
    {
        "Name": "Dhiraj Shrestha",
        "Address": "Tadi Rural Municipality–3, Nuwakot"
    },
    {
        "Name": "Devkumar Subedi",
        "Address": "Lalbandi Municipality–5, Sarlahi"
    },
    {
        "Name": "Pravin Kulung",
        "Address": "Silichong Rural Municipality–3, Sankhuwasabha"
    },
    {
        "Name": "Nikhita Gautam",
        "Address": "Kalika Municipality–8, Chitwan"
    },
    {
        "Name": "Abhishek Chaulagain",
        "Address": "Shailung Rural Municipality–4, Dolakha"
    },
    {
        "Name": "Mahesh Budhathoki",
        "Address": "Bigu Rural Municipality–3, Dolakha"
    },
    {
        "Name": "Vijay Chaudhary",
        "Address": "Lahan Municipality–15, Siraha"
    },
    {
        "Name": "Niraj Pant",
        "Address": "Dasharathchanda Municipality–6, Baitadi"
    },
    {
        "Name": "Deepak Singh Saud",
        "Address": "Shivanath Rural Municipality–2, Baitadi"
    },
    {
        "Name": "Abhishek Shrestha",
        "Address": "Inaruwa Municipality–6, Sunsari"
    },
    {
        "Name": "Sajan Rai",
        "Address": "Dharan Sub-Metropolitan City–22, Sunsari"
    },
    {
        "Name": "Mohan Sardar",
        "Address": "Itahari Sub-Metropolitan City–14, Sunsari"
    },
    {
        "Name": "Madhav Saru Magar",
        "Address": "Bhumikasthan Municipality–4, Arghakhanchi"
    },
    {
        "Name": "Bimbal Babu Bhatt",
        "Address": "Barpak Sulikot Rural Municipality–5, Gorkha"
    },
    {
        "Name": "Arjun Bhatt",
        "Address": "Gandaki Rural Municipality–4, Gorkha"
    },
    {
        "Name": "Anish Parajuli",
        "Address": "Palungtar Municipality–2, Gorkha"
    },
    {
        "Name": "Gyanindra Sedhai",
        "Address": "Arjundhara Municipality–11, Jhapa"
    },
    {
        "Name": "Dinesh Rajbanshi",
        "Address": "Ward No. 8, Jhapa"
    },
    {
        "Name": "Kamal Bhandari",
        "Address": "Hilihang Rural Municipality–2, Panchthar"
    },
    {
        "Name": "Amrit Gurung",
        "Address": "Rupa Rural Municipality–5, Kaski"
    },
    {
        "Name": "Uttam Thapa",
        "Address": "Lekam Rural Municipality–3, Darchula"
    }
];

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
                    {MARTYRS.map((martyr, index) => (
                        <WallFrame
                            key={index}
                            index={index}
                            name={martyr.Name}
                            address={martyr.Address}
                        />
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
