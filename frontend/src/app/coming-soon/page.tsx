import Link from "next/link";
import { ArrowLeft, Smartphone, DownloadCloud, Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="bg-[#F5F5F5] min-h-[80vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 relative">
                <Smartphone className="h-10 w-10 text-primary" />
                <div className="absolute top-0 right-0 h-8 w-8 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                    <DownloadCloud className="h-4 w-4 text-primary" />
                </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#1F2533] uppercase tracking-tighter mb-4">
                Mobile App<br/><span className="text-primary">Coming Soon</span>
            </h1>
            
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed max-w-md mx-auto">
                We're putting the final touches on the SnapMyShow mobile experience. Soon you'll be able to book your favorite blockbusters seamlessly on iOS and Android.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link 
                    href="/" 
                    className="flex items-center justify-center w-full sm:w-auto px-8 h-12 bg-gray-100 hover:bg-gray-200 text-[#1F2533] rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
                
                <button 
                    disabled
                    className="flex items-center justify-center w-full sm:w-auto px-8 h-12 bg-primary/50 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Stay Tuned
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
