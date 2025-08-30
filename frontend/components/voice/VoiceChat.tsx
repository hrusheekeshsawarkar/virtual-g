"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { AudioTrack, ControlBar, LiveKitRoom, RoomAudioRenderer, useVoiceAssistant } from '@livekit/components-react';
import { Button } from '../ui/Button';
import { apiPost } from '../../lib/api';

interface VoiceChatProps {
  onClose: () => void;
}

interface VoiceRoomData {
  room_name: string;
  room_sid: string;
  token: string;
  ws_url: string;
}

export function VoiceChat({ onClose }: VoiceChatProps) {
  const [roomData, setRoomData] = useState<VoiceRoomData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const startVoiceChat = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('Starting voice chat...');
      
      // Create a simple room name for the user
      const userEmail = 'user@example.com'; // Simplified for now
      const roomName = `pernilla-${Date.now()}`; // Use timestamp for unique room names
      
      console.log('Creating room:', roomName);
      
      const response = await apiPost('/voice/create-room', {
        room_name: roomName
      });
      
      console.log('Room created:', response);
      setRoomData(response);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Voice chat error:', err);
      setError(err.message || 'Failed to start voice chat');
    } finally {
      setIsConnecting(false);
    }
  };

  const endVoiceChat = async () => {
    if (roomData) {
      try {
        await apiPost('/voice/end-session', {
          room_name: roomData.room_name
        });
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    }
    setRoomData(null);
    setIsConnected(false);
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">Voice Chat Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={() => setError(null)} variant="outline">
              Try Again
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Voice Chat with Pernilla</h2>
          <p className="text-gray-600 mb-6">
            Start a voice conversation with your virtual girlfriend. 
            Voice chat uses 100 credits to start and additional credits based on usage.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={startVoiceChat} 
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? 'Connecting...' : 'Start Voice Chat'}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 h-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Voice Chat with Pernilla</h2>
          <Button onClick={endVoiceChat} variant="outline" size="sm">
            End Call
          </Button>
        </div>
        
        {roomData && (
          <LiveKitRoom
            video={false}
            audio={true}
            token={roomData.token}
            serverUrl={roomData.ws_url}
            data-lk-theme="default"
            style={{ height: '300px' }}
            onConnected={() => console.log('Connected to voice chat')}
            onDisconnected={() => {
              console.log('Disconnected from voice chat');
              endVoiceChat();
            }}
          >
            <VoiceChatInterface />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

function VoiceChatInterface() {
  const { state, audioTrack } = useVoiceAssistant();
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className={`w-16 h-16 bg-pink-500 rounded-full ${
              state === 'speaking' ? 'animate-pulse' : ''
            }`}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pernilla</h3>
          <p className="text-sm text-gray-600 capitalize">
            {state === 'listening' && 'Listening...'}
            {state === 'thinking' && 'Thinking...'}
            {state === 'speaking' && 'Speaking...'}
            {state === 'idle' && 'Say something to start chatting'}
          </p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <ControlBar 
          controls={{
            microphone: true,
            camera: false,
            screenShare: false,
            chat: false,
            leave: true,
          }}
        />
      </div>
      
      {audioTrack && (
        <AudioTrack 
          trackRef={audioTrack} 
          volume={1.0}
        />
      )}
    </div>
  );
}
