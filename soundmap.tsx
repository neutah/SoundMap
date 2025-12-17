// soundmap main component
// displays the radar interface, handles microphone input, and coordinates sound detection

import { RadarDisplay } from './RadarDisplay';
import { SoundLegend } from './SoundLegend';
import { SoundEventList } from './SoundEventList';
import { useSoundEvents } from './useSoundEvents';
import { useMicrophone } from './useMicrophone';
import { useAudioClassifier } from './useAudioClassifier';
import { useHapticFeedback } from './useHapticFeedback';
import { Button } from '@/components/ui/button';
import { SettingsModal } from '@/components/SettingsModal';
import { Volume2, VolumeX, Mic, MicOff, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const SoundMap = () => {
  // initialize hooks for sound events, mute state, and haptic feedback toggle
  const { events, addEvent, activeEvents } = useSoundEvents(false); // demo mode disabled
  const [isMuted, setIsMuted] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  
  // haptic feedback hook for vibration patterns
  const { vibrate, isSupported: hapticSupported } = useHapticFeedback();
  
  // audio classification hook for ml-based sound recognition
  const { 
    isLoading: modelLoading, 
    isModelLoaded, 
    loadModel, 
    classify,
    error: modelError 
  } = useAudioClassifier();

  // callback to process audio data from microphone
  // classifies the audio and creates sound events when sounds are detected
  const handleAudioData = useCallback(async (audioData: Float32Array) => {
    // skip if model not ready
    if (!isModelLoaded) return;

    try {
      // run ml classification on audio data
      const results = await classify(audioData, 16000);
      
      // find first result with valid sound type and confidence above threshold
      const validResult = results.find(r => r.soundType && r.score > 0.4);
      
      if (validResult && validResult.soundType) {
        console.log(' Sound event triggered:', validResult.label, validResult.score);
        
        // generate random direction since true directional detection requires multiple mics
        // in a real app this would come from hardware or user-configured locations
        const direction = Math.random() * 360;
        const distance = 30 + Math.random() * 60;
        
        // determine intensity based on confidence score
        const intensity = validResult.score > 0.8 ? 'high' : validResult.score > 0.6 ? 'medium' : 'low';
        
        // add the sound event to the display
        addEvent(
          validResult.soundType,
          validResult.label,
          direction,
          distance,
          intensity
        );

        // trigger haptic feedback if enabled and not muted
        if (hapticEnabled && !isMuted) {
          vibrate(validResult.soundType, intensity);
        }
      }
    } catch (err) {
      console.error('Classification error:', err);
    }
  }, [isModelLoaded, classify, addEvent, hapticEnabled, isMuted, vibrate]);

  // microphone hook for capturing audio input
  const { 
    isListening, 
    error: micError, 
    audioLevel, 
    startListening, 
    stopListening 
  } = useMicrophone({
    sampleRate: 16000, // sample rate required by the ml model
    onAudioData: handleAudioData,
  });

  // toggle microphone on/off
  // loads the ml model on first activation
  const handleMicToggle = useCallback(async () => {
    if (isListening) {
      stopListening();
      toast.info('Microphone stopped');
    } else {
      // load model if not already loaded
      if (!isModelLoaded) {
        toast.loading('Loading sound recognition model...', { id: 'model-loading' });
        const loaded = await loadModel();
        toast.dismiss('model-loading');
        
        if (!loaded) {
          toast.error('Failed to load sound recognition model');
          return;
        }
        toast.success('Sound recognition ready!');
      }
      
      await startListening();
      toast.success('Listening for sounds...');
    }
  }, [isListening, isModelLoaded, loadModel, startListening, stopListening]);

  // trigger haptic feedback when new active events appear
  useEffect(() => {
    if (activeEvents.length > 0 && hapticEnabled && !isMuted) {
      const latestEvent = activeEvents[0];
      vibrate(latestEvent.type, latestEvent.intensity);
    }
  }, [activeEvents, hapticEnabled, isMuted, vibrate]);


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* header with title, settings, and mute controls */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            SoundMap
          </h1>
          <div className="flex items-center gap-2">
            <SettingsModal />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? 'Unmute sound alerts' : 'Mute sound alerts'}
              className="high-contrast-focus"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Spatial sound awareness for your environment
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* main radar display area */}
          <div className="flex flex-col items-center gap-6">
            <div 
              className="bg-card border-2 border-border rounded-2xl p-6 shadow-xl relative"
              role="region"
              aria-label="Sound direction display"
            >
              {/* radar visualization showing sound positions */}
              <RadarDisplay 
                sounds={events} 
                size={320}
                className="mx-auto"
              />
              
              {/* audio level indicator shown when microphone is active */}
              {isListening && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-background/80 rounded-lg p-2">
                  <Mic size={16} className="text-primary animate-pulse" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-75"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Listening</span>
                </div>
              )}
            </div>

            {/* active sound alert banner */}
            {activeEvents.length > 0 && (
              <div 
                className="w-full max-w-sm bg-primary/10 border-2 border-primary rounded-xl p-4 text-center animate-fade-in-up"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-xl font-bold text-primary">
                  {activeEvents[0].label}
                </p>
                <p className="text-foreground font-medium">
                  Detected to the {getDirectionLabel(activeEvents[0].direction)}
                </p>
              </div>
            )}

            {/* microphone control button */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={handleMicToggle}
                size="lg"
                variant={isListening ? 'destructive' : 'default'}
                disabled={modelLoading}
                className="high-contrast-focus font-semibold text-lg px-6"
              >
                {modelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading Model...
                  </>
                ) : isListening ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Listening
                  </>
                )}
              </Button>
            </div>

            {/* haptic feedback toggle checkbox */}
            {hapticSupported && (
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hapticEnabled}
                    onChange={(e) => setHapticEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-border bg-background text-primary focus:ring-primary"
                  />
                  <span className="text-foreground font-medium">
                    Haptic Feedback
                  </span>
                </label>
              </div>
            )}

            {/* error message display for mic or model issues */}
            {(micError || modelError) && (
              <div 
                className="w-full max-w-sm bg-destructive/10 border-2 border-destructive rounded-xl p-3 text-center"
                role="alert"
              >
                <p className="text-destructive font-medium text-sm">
                  {micError || modelError}
                </p>
              </div>
            )}
          </div>

          {/* sidebar with event list and legend */}
          <aside className="flex flex-col gap-6">
            <SoundEventList events={events} />
            <SoundLegend />
          </aside>
        </div>
      </main>

      {/* skip link for keyboard navigation accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold"
      >
        Skip to main content
      </a>
    </div>
  );
};

// helper function to convert degrees to compass direction
const getDirectionLabel = (direction: number): string => {
  if (direction >= 337.5 || direction < 22.5) return 'North';
  if (direction >= 22.5 && direction < 67.5) return 'Northeast';
  if (direction >= 67.5 && direction < 112.5) return 'East';
  if (direction >= 112.5 && direction < 157.5) return 'Southeast';
  if (direction >= 157.5 && direction < 202.5) return 'South';
  if (direction >= 202.5 && direction < 247.5) return 'Southwest';
  if (direction >= 247.5 && direction < 292.5) return 'West';
  return 'Northwest';
};
