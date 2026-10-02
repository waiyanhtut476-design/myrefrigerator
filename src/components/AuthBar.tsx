import React, { useState } from 'react';
import { User, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { Cloud, Check, LogIn, LogOut, Sparkles, User as UserIcon, ShieldCheck } from 'lucide-react';

interface AuthBarProps {
  user: User | null;
  isSyncing: boolean;
  onSyncNow: () => void;
}

export const AuthBar: React.FC<AuthBarProps> = ({ user, isSyncing, onSyncNow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymously(auth);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Guest Sign In Error:', err);
      setError(err.message || 'เข้าสู่ระบบชั่วคราวไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsOpen(true)}
          className={`min-h-[38px] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 ${
            user
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
          }`}
          title="สถานะ Firebase Cloud Sync"
        >
          <div className="relative">
            <Cloud className={`w-3.5 h-3.5 ${user ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                isSyncing
                  ? 'bg-amber-500 animate-ping'
                  : user
                  ? 'bg-emerald-500'
                  : 'bg-stone-400'
              }`}
            />
          </div>
          <span>{user ? (user.displayName ? user.displayName.split(' ')[0] : 'ซิงค์คลาวด์') : 'ซิงค์ Firebase'}</span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Firebase Cloud Database
                  </h3>
                  <p className="text-xs text-stone-500">
                    {user ? 'เชื่อมต่อและสำรองข้อมูลแล้ว' : 'เข้าสู่ระบบเพื่อสำรองข้อมูลออนไลน์'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {user ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>เข้าสู่ระบบแล้ว:</span>
                  </div>
                  <div className="pl-6 space-y-0.5">
                    <p className="font-semibold">{user.displayName || 'ผู้ใช้ทั่วไป'}</p>
                    <p className="text-stone-500 text-[11px]">{user.email || user.uid}</p>
                  </div>
                </div>

                <button
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{isSyncing ? 'กำลังซิงค์...' : '⚡ อัปเดตข้อมูลขึ้น Firebase ตอนนี้'}</span>
                </button>

                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  เชื่อมต่อกับ Firebase Firestore เพื่อให้ข้อมูลตู้เย็น สูตรอาหาร และรายการซื้อของไม่หายแม้เปลี่ยนเครื่อง
                </p>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full min-h-[48px] py-3 px-4 bg-white hover:bg-stone-50 border-2 border-stone-300 text-stone-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>

                <button
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>เปิดใช้ Cloud Sync อัตโนมัติ (แขก)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
