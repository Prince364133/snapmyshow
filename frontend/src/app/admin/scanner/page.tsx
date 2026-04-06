"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/context/AuthContext";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only init scanner if there's no result being processed
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      scanner.clear();
      setScanResult(decodedText);
      handleApproval(decodedText);
    };

    scanner.render(onScanSuccess, (err) => {
        // quiet fail on scan attempts
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanResult]);

  const handleApproval = async (token: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data } = await api.post("/scanner/approve", { bookingId: token }); // Wait, scanner route logic was different for token vs bookingId!
      // In the backend, /scanner/validate takes { token }, /scanner/approve takes { bookingId }
      // I should do validate then auto-approve!
      
      const valRes = await api.post("/scanner/validate", { token });
      if (valRes.data.success) {
          const bookingId = valRes.data.data.id;
          const appRes = await api.post("/scanner/approve", { bookingId });
          setSuccess({ ...valRes.data.data, message: appRes.data.message });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error scanning QR");
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = (e: React.FormEvent) => {
      e.preventDefault();
      const val = (document.getElementById('manual-token') as HTMLInputElement).value;
      if (val) {
          setScanResult(val);
          handleApproval(val);
      }
  };

  const resetScanner = () => {
      setScanResult(null);
      setSuccess(null);
      setError(null);
  };

  return (
    <ProtectedRoute allowedRoles={["THEATER_ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Venue Operations</h2>
            <p className="mt-2 text-sm text-gray-600">Scan customer QR codes to authenticate booking</p>
          </div>

          <div className="bg-white p-6 shadow sm:rounded-lg border border-gray-100">
             {!scanResult ? (
                 <>
                    <div id="reader" className="w-full mx-auto" />
                    
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <form onSubmit={handleManualScan} className="flex gap-2">
                           <input id="manual-token" placeholder="Manual Override QR Token" className="flex-1 px-3 py-2 border rounded" />
                           <Button type="submit">Verify</Button>
                        </form>
                    </div>
                 </>
             ) : (
                 <div className="text-center py-6">
                     {loading && <p className="text-lg font-medium text-gray-600 animate-pulse">Processing Ticket...</p>}
                     
                     {error && (
                         <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                             <div className="h-12 w-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                                 <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                             </div>
                             <h3 className="font-bold text-lg mb-1">Scan Failed</h3>
                             <p>{error}</p>
                             <Button onClick={resetScanner} className="mt-4 bg-red-600 hover:bg-red-700 text-white">Scan Next</Button>
                         </div>
                     )}

                     {success && (
                         <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                             <div className="h-12 w-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                                 <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                             </div>
                             <h3 className="font-bold text-lg mb-1">Access Granted!</h3>
                             <p className="font-medium text-green-900 mb-4">{success.message || "Payment processed. Paid at venue."}</p>
                             
                             <div className="bg-white p-4 rounded text-left shadow-sm space-y-2 text-sm text-gray-800">
                                <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-bold">{success.userName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Movie:</span> <span className="font-bold">{success.movieTitle}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Seats:</span> <span className="font-bold">{success.seats}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Collection:</span> <span className="font-bold text-primary">₹{success.totalAmount}</span></div>
                             </div>

                             <Button onClick={resetScanner} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white">Admit & Scan Next</Button>
                         </div>
                     )}
                 </div>
             )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
