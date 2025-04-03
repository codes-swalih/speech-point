import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-xl p-8 
        transition-colors duration-300 cursor-pointer
        flex flex-col items-center justify-center text-center
        ${isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="mb-4 p-4 rounded-full bg-primary/10">
        {isDragActive ? (
          <Upload className="h-10 w-10 text-primary" />
        ) : (
          <FileAudio className="h-10 w-10 text-primary" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {isDragActive ? 'Drop the audio file here' : 'Upload Audio File'}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-xs">
        Drag and drop an audio file, or click to browse
      </p>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Supported formats: MP3, WAV, M4A, OGG, FLAC, AAC
      </div>
    </div>
  );
}