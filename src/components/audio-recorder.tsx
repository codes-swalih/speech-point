import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onAudioComplete: (blob: Blob) => void;
}

export function VoiceRecorder({ onAudioComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const resetRecorder = () => {
    // Reset all state variables
    setRecordingComplete(false);
    setAudioBlob(null);
    setRecordingTime(0);
    
    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const startRecording = async () => {
    try {
      // Reset everything before starting a new recording
      resetRecorder();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        setRecordingComplete(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const handleSubmit = () => {
    if (audioBlob) {
      onAudioComplete(audioBlob);
      // Reset the recorder state after submitting
      resetRecorder();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-background">
      <div className="w-full flex justify-between items-center">
        <div className="text-lg font-medium">Voice Recorder</div>
        <div className={cn("text-sm font-mono", isRecording && !isPaused ? "text-red-500" : "text-muted-foreground")}>
          {formatTime(recordingTime)}
        </div>
      </div>
      
      {!isRecording && !recordingComplete && (
        <Button 
          onClick={startRecording} 
          className="w-full h-16 text-lg"
          variant="outline"
        >
          <Mic className="mr-2 h-5 w-5" />
          Start Recording
        </Button>
      )}
      
      {isRecording && (
        <div className="w-full flex space-x-2">
          <Button 
            onClick={togglePause} 
            variant="outline" 
            className="flex-1 h-12"
          >
            {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button 
            onClick={stopRecording} 
            variant="destructive" 
            className="flex-1 h-12"
          >
            <Square className="mr-2 h-5 w-5" />
            Stop
          </Button>
        </div>
      )}
      
      {recordingComplete && audioUrl && (
        <div className="w-full space-y-4">
          <audio src={audioUrl} controls className="w-full" />
          <Button 
            onClick={handleSubmit} 
            className="w-full h-12"
            variant="default"
          >
            <Send className="mr-2 h-5 w-5" />
            Submit Recording
          </Button>
          <Button 
            onClick={startRecording} 
            className="w-full h-12"
            variant="outline"
          >
            <Mic className="mr-2 h-5 w-5" />
            Record Again
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground text-center">
        Speak clearly into your microphone. For best results, record in a quiet environment.
      </p>
    </div>
  );
}