'use client';

import React, { useState, useEffect } from 'react';
import Board from '@/components/Board';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CardModal from '@/components/CardModal';
import { useSupabaseCardSync } from '@/lib/telemetry';
import OnboardModal from '@/components/OnboardModal';
import AdminKeysPanel from '@/components/AdminKeysPanel';
import ShortcutsInfo from '@/components/ShortcutsInfo';
import SearchModal from '@/components/SearchModal';
import { useKeyboardShortcuts } from '@/lib/keyboard';
import { useStore } from '@/lib/store';

const queryClient = new QueryClient();

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Now enable Supabase and Dust since environment variables are configured
  useSupabaseCardSync();

  const createCard = useStore((s) => s.createCard);
  const lists = useStore((s) => s.lists);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceProcessingMessage, setVoiceProcessingMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Voice recording functionality
  useEffect(() => {
    let spacePressed = false;
    let recordingTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key down:', e.code, 'Space pressed:', spacePressed, 'Repeat:', e.repeat);
      if (e.code === 'Space' && !e.repeat && !spacePressed) {
        console.log('Space bar pressed - checking conditions...');

        // Only start recording if no modal is open and not in an input field
        const activeElement = document.activeElement;
        const isInInput = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true'
        );

        console.log('Modal open:', !!useStore.getState().modalCardId, 'In input:', !!isInInput);

        if (!useStore.getState().modalCardId && !isInInput) {
          console.log('Conditions met - starting voice recording in 300ms');
          spacePressed = true;
          e.preventDefault();

          // Start recording after 300ms hold
          recordingTimeout = setTimeout(() => {
            console.log('300ms timeout reached - starting recording');
            startVoiceRecording();
          }, 300);
        } else {
          console.log('Conditions not met - not starting recording');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spacePressed) {
        spacePressed = false;
        clearTimeout(recordingTimeout);

        if (isRecording) {
          stopVoiceRecording();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      clearTimeout(recordingTimeout);
    };
  }, [isRecording]);

  const startVoiceRecording = () => {
    console.log('Starting voice recording...');
    setIsRecording(true);
    setRecordingStartTime(Date.now());

    // Start speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('Web Speech API available');
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setRecordingStartTime(null);
        setTranscribedText('');
      };

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result:', event);
        let interimTranscript = '';
        let currentFinalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the display with current transcription
        const displayText = currentFinalTranscript + interimTranscript;
        console.log('Display text:', displayText);
        setTranscribedText(displayText);

        // Store final results for processing when recording stops
        if (currentFinalTranscript) {
          finalTranscript += currentFinalTranscript;
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, final transcript:', finalTranscript);
        setIsRecording(false);
        setRecordingStartTime(null);
        setTranscribedText('');

        // Process the final transcript
        if (finalTranscript.trim()) {
          console.log('Starting voice processing...');
          processVoiceTranscript(finalTranscript);
        } else {
          console.log('No transcript to process');
          setSuccessMessage('⚠️ No speech detected. Please try again.');
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            setSuccessMessage('');
          }, 2000);
        }
      };

      try {
        recognition.start();
        (window as any).currentRecognition = recognition;
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsRecording(false);
        setRecordingStartTime(null);
      }
    } else {
      console.log('Web Speech API not available, trying ElevenLabs fallback');
      // Try ElevenLabs as fallback
      try {
        console.log('Attempting ElevenLabs speech recognition...');
        // For now, just show a message that ElevenLabs would be used
        alert('Web Speech API not available. ElevenLabs integration would be used here in production.');
      } catch (error) {
        console.error('ElevenLabs fallback failed:', error);
      }
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }
    setIsRecording(false);
    setRecordingStartTime(null);
  };

  const processVoiceTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;

    console.log('Processing voice transcript:', transcript);
    setIsProcessingVoice(true);
    setVoiceProcessingMessage('🤖 Analyzing your request...');

    try {
      // Show initial processing state
      setTimeout(() => {
        if (isProcessingVoice) {
          setVoiceProcessingMessage('🔍 Understanding task requirements...');
        }
      }, 1000);

      // Send transcript to OpenAI for smart task creation
      setVoiceProcessingMessage('🚀 Sending to AI for processing...');
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transcript })
      });

      const data = await response.json();
      console.log('Voice processing response:', data);

      if (data.tasks && data.tasks.length > 0) {
        setVoiceProcessingMessage('📝 Creating tasks...');

        // Create cards from the processed tasks
        const backlogListId = Object.keys(lists).find(id => lists[id].title === 'Backlog');
        if (backlogListId) {
          let createdCount = 0;
          data.tasks.forEach((task: any, index: number) => {
            setTimeout(() => {
              createCard(backlogListId, task.title, task.description);
              createdCount++;

              if (createdCount === data.tasks.length) {
                // All cards created - show success
                setIsProcessingVoice(false);
                setVoiceProcessingMessage('');
                setSuccessMessage(`✅ Created ${data.tasks.length} task${data.tasks.length > 1 ? 's' : ''} in Backlog!`);
                setShowSuccessMessage(true);

                // Hide success message after 3 seconds
                setTimeout(() => {
                  setShowSuccessMessage(false);
                  setSuccessMessage('');
                }, 3000);
              }
            }, index * 300); // Stagger card creation for visual effect
          });
        }
      } else {
        setIsProcessingVoice(false);
        setVoiceProcessingMessage('');
        setSuccessMessage('⚠️ No tasks could be created from your request. Try rephrasing.');
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to process voice transcript:', error);
      setIsProcessingVoice(false);
      setVoiceProcessingMessage('');
      setSuccessMessage('❌ Failed to process voice input. Please try again.');
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage('');
      }, 3000);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      metaKey: true,
      altKey: true,
      callback: () => {
        // Create new card in the first available list
        const firstListId = Object.keys(lists)[0];
        if (firstListId) {
          const title = prompt('Enter card title:');
          if (title?.trim()) {
            createCard(firstListId, title.trim());
          }
        }
      },
      description: 'Create new card'
    },
    {
      key: 'k',
      metaKey: true,
      callback: () => setSearchOpen(true),
      description: 'Search cards'
    },
    {
      key: 'Escape',
      callback: () => {
        // Close any open modals
        useStore.getState().closeModal();
        setSearchOpen(false);
        // Stop recording if active
        if (isRecording) {
          stopVoiceRecording();
        }
        // Stop processing if active
        if (isProcessingVoice) {
          setIsProcessingVoice(false);
          setVoiceProcessingMessage('');
          setSuccessMessage('⏹️ Voice processing cancelled');
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            setSuccessMessage('');
          }, 2000);
        }
      },
      description: 'Close modal'
    }
  ]);

  React.useEffect(() => {
    // Ensure Dust workspace on load
    fetch('/api/dust/ensure', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ boardId: 'b1' }) }).catch(()=>{});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen p-4 relative">
        <Board />
        <CardModal />
        <OnboardModal />
        <AdminKeysPanel />
        <ShortcutsInfo />
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Voice Recording/Processing Visual Feedback - iPhone-like */}
        {(isRecording || isProcessingVoice) && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* iPhone-like gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm"></div>

            {/* Animated gradient rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 animate-ping opacity-30"
                     style={{
                       width: '300px',
                       height: '300px',
                       left: '-150px',
                       top: '-150px',
                       borderImage: 'linear-gradient(45deg, #60a5fa, #a855f7) 1',
                       borderStyle: 'solid'
                     }}></div>
                {/* Middle ring */}
                <div className="absolute inset-0 rounded-full border-2 animate-pulse opacity-50"
                     style={{
                       width: '200px',
                       height: '200px',
                       left: '-100px',
                       top: '-100px',
                       borderImage: 'linear-gradient(45deg, #a855f7, #ec4899) 1',
                       borderStyle: 'solid'
                     }}></div>
                {/* Inner ring */}
                <div className="absolute inset-0 rounded-full border border-white/60 animate-pulse"
                     style={{ width: '120px', height: '120px', left: '-60px', top: '-60px' }}></div>
              </div>
            </div>

            {/* Recording/Processing indicator with gradient */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
              <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm font-medium">
                {isProcessingVoice ? 'Processing...' : 'Listening...'}
              </span>
              <span className="text-xs opacity-80">
                {recordingStartTime ? `${Math.floor((Date.now() - recordingStartTime) / 1000)}s` : ''}
              </span>
            </div>

            {/* Live transcription overlay */}
            {transcribedText && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-4 rounded-xl max-w-2xl backdrop-blur-md border border-white/20">
                <div className="text-sm opacity-80 mb-1">You're saying:</div>
                <div className="text-lg font-medium leading-relaxed">{transcribedText}</div>
              </div>
            )}

            {/* Enhanced voice visualization bars */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-end gap-1">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-blue-400 to-purple-500 rounded-full shadow-lg animate-pulse"
                  style={{
                    height: `${Math.sin(Date.now() * 0.001 + i * 0.3) * 20 + 30}px`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: '0.6s',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                  }}
                />
              ))}
            </div>

            {/* Siri-like pulsing orb */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-2xl animate-pulse"
                   style={{
                     boxShadow: '0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.3)',
                   }}>
                <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Processing Feedback */}
        {isProcessingVoice && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/90 text-white px-6 py-4 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <div className="text-lg font-medium">Processing Voice Input</div>
                <div className="text-sm opacity-80">{voiceProcessingMessage}</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-green-400">
            <div className="flex items-center gap-2">
              <div className="text-xl">✅</div>
              <div className="font-medium">{successMessage}</div>
            </div>
          </div>
        )}
      </main>
    </QueryClientProvider>
  );
}

