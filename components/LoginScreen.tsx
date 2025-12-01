import React, { useState } from 'react';
import { Lock, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (user: Partial<UserProfile>) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate API call and latency
    setTimeout(() => {
      // Mock data that would come from Google
      const mockGoogleUser = {
        googleId: '1029384756',
        email: 'tony.stark@starkindustries.com',
        name: 'Tony Stark',
        dob: '1970-05-29',
        photoUrl: 'https://ui-avatars.com/api/?name=Tony+Stark&background=0D8ABC&color=fff',
      };
      
      // Simulate sending data to admin
      console.log("LOG: Sending User Data to Admin Database:", mockGoogleUser);
      
      onLogin(mockGoogleUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -top-20 -left-20 animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -bottom-20 -right-20 animate-pulse"></div>

      <div className="bg-slate-900/80 border border-slate-700 p-8 rounded-2xl shadow-2xl backdrop-blur-xl w-full max-w-md z-10 relative group">
         <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-slate-950 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
            <Fingerprint className="text-cyan-400 w-10 h-10" />
         </div>

         <div className="mt-8 text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-widest font-mono uppercase">J.A.R.V.I.S.</h1>
            <p className="text-xs text-cyan-500 uppercase tracking-[0.3em] mt-1">Secure Access Terminal</p>
         </div>

         <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700 text-xs text-slate-400 text-center mb-6">
               <p>Biometric handshake required.</p>
               <p>Authenticate via Google Secure Protocol.</p>
            </div>

            <button 
               onClick={handleGoogleLogin}
               disabled={isLoading}
               className="w-full bg-white text-slate-900 hover:bg-slate-200 py-3 px-4 rounded font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
               {isLoading ? (
                   <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
               ) : (
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
               )}
               {isLoading ? 'ESTABLISHING LINK...' : 'Sign in with Google'}
            </button>
            
            <div className="text-[10px] text-center text-slate-600 mt-4">
               Warning: All access logs are recorded and sent to admin console.
            </div>
         </div>
         
         <div className="absolute bottom-2 left-0 w-full text-center text-[9px] text-slate-700 font-mono">
             v4.2.0 | STARK INDUSTRIES
         </div>
      </div>
    </div>
  );
};

export default LoginScreen;
