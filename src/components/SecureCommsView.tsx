import React, { useState, useEffect, useRef } from 'react';
import { Shield, Phone, PhoneOff, Mic } from 'lucide-react';
import { callClient } from '../utils/callClient';
import { opusStream } from '../lib/OpusStream';

type CallState = 'idle' | 'calling' | 'in_call' | 'ended' | 'no_answer' | 'failed';

export default function SecureCommsView() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callErrorText, setCallErrorText] = useState('');
  const [isPTT, setIsPTT] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const isPTTRef = useRef(false);

  useEffect(() => {
    const unsub1 = callClient.callState.subscribe((v) => setCallState(v));
    const unsub2 = callClient.errorText.subscribe((v) => {
      setCallErrorText(v);
      if (
        v.toLowerCase().includes('permission') ||
        v.toLowerCase().includes('denied') ||
        v.toLowerCase().includes('mic')
      ) {
        setMicDenied(true);
      }
    });
    const unsub3 = opusStream.recording.subscribe((v) => setIsRecording(v));
    const unsub4 = callClient.queuePosition.subscribe((v) => setQueuePosition(v));
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const handlePTTStart = () => {
    isPTTRef.current = true;
    setIsPTT(true);
    callClient.startTransmitting();
  };

  const handlePTTEnd = () => {
    isPTTRef.current = false;
    setIsPTT(false);
    callClient.stopTransmitting();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 xl:py-12 items-center animate-fade-in">
      <div className="mb-4 lg:mb-6">
        <Shield size={48} className="text-white opacity-80 lg:w-16 lg:h-16" />
      </div>
      <h1 className="text-3xl lg:text-5xl xl:text-6xl font-normal text-center mt-2 uppercase tracking-wide">
        Secure Comms
      </h1>
      <p className="text-center text-sm lg:text-base xl:text-lg text-slate-300 mt-4 lg:mt-6 max-w-sm lg:max-w-xl xl:max-w-2xl leading-relaxed mb-8 lg:mb-12">
        Speak directly with the Stellarium Foundation. (Routes via secure tunnel)
      </p>

      <div className="w-full max-w-md lg:max-w-xl xl:max-w-2xl space-y-4 lg:space-y-6 pb-24 lg:pb-32">
        {/* Call Stellarium Section */}
        <div className="bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-500/20 rounded-2xl p-6 lg:p-8 xl:p-10 shadow-xl space-y-4 lg:space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 lg:p-3.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-xl">
              <Phone size={20} className="text-emerald-400 lg:w-6 lg:h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-xs lg:text-sm xl:text-base text-white uppercase tracking-wider">Call Stellarium</h3>
              <span className="text-[9px] lg:text-xs text-emerald-300 uppercase tracking-widest block">
                Direct Voice Connection
              </span>
            </div>
          </div>

          <p className="text-xs lg:text-sm xl:text-base text-gray-300 leading-relaxed text-left">
            Walkie-talkie voice with John Victor. Hold to talk, release to listen. Requires microphone access.
          </p>

          {micDenied && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 text-center">
              Microphone permission denied. Go to system settings → App permissions → Microphone → Allow.
            </div>
          )}

          {(callState === 'idle' || callState === 'failed' || callState === 'no_answer') && (
            <div className="space-y-2">
              <button
                onClick={() => callClient.startCall()}
                className="w-full bg-emerald-500 text-black py-3 lg:py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-xs lg:text-sm hover:bg-emerald-400 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Phone size={18} /> Call Owner
              </button>
              {callErrorText && <p className="text-xs text-red-400 text-center">{callErrorText}</p>}
            </div>
          )}

          {callState === 'calling' && (
            <div className="flex flex-col items-center gap-2 py-3">
              {queuePosition !== null ? (
                <>
                  <span className="text-amber-300 text-sm">In Queue — Position #{queuePosition}</span>
                  <span className="text-gray-400 text-xs">Waiting for callee to become available...</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-emerald-300">Calling...</span>
                </div>
              )}
              <button
                onClick={() => callClient.endCall()}
                className="mt-2 text-xs text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {callState === 'in_call' && (
            <div className="flex flex-col gap-3">
              <span className="text-emerald-300 text-center">Connected — Walkie-Talkie Mode</span>

              <button
                onTouchStart={handlePTTStart}
                onTouchEnd={handlePTTEnd}
                onMouseDown={handlePTTStart}
                onMouseUp={handlePTTEnd}
                onMouseLeave={() => {
                  if (isPTTRef.current) handlePTTEnd();
                }}
                className={`w-full py-6 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-sm transition-all select-none active:scale-[0.98] cursor-pointer ${
                  isRecording
                    ? 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.6)] animate-pulse'
                    : isPTT
                      ? 'bg-emerald-600/60 text-emerald-200 border border-emerald-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
                {isRecording ? 'RECORDING...' : isPTT ? 'INITIALIZING...' : 'HOLD TO TALK'}
              </button>

              <button
                onClick={() => callClient.endCall()}
                className="w-full bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-xs hover:bg-red-500/30 transition-all cursor-pointer"
              >
                <PhoneOff size={16} /> End Call
              </button>
            </div>
          )}

          {callState === 'ended' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 text-center">Call ended</p>
              <button
                onClick={() => callClient.resetCall()}
                className="w-full bg-emerald-500/10 text-emerald-400 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                Call Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
