import axios from 'axios';

/**
 * Asterisk Service for managing PBX integration
 * Handles WebSocket connections, AMI commands, and call management
 */
class AsteriskService {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 8088,
      username: config.username || 'admin',
      secret: config.secret || 'amp111',
      protocol: config.protocol || 'ws',
      apiUrl: config.apiUrl || `http://${config.host || 'localhost'}:8088/ari`,
      debug: config.debug || false,
      ...config
    };

    this.ws = null;
    this.eventHandlers = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.activeChannels = new Map();
    this.applicationName = 'grameen-support';
  }

  /**
   * Initialize connection to Asterisk
   */
  async connect() {
    try {
      // First authenticate with ARI
      await this.authenticateARI();
      
      // Then establish WebSocket connection
      await this.connectWebSocket();
      
      this.isConnected = true;
      this.emit('connected', { timestamp: new Date() });
      
      if (this.config.debug) {
        console.log('✅ Asterisk Service Connected');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Asterisk:', error);
      this.emit('error', { error, type: 'connection' });
      return false;
    }
  }

  /**
   * Authenticate with Asterisk REST Interface (ARI)
   */
  async authenticateARI() {
    const authUrl = `${this.config.apiUrl}/asterisk/info`;
    
    try {
      const response = await axios.get(authUrl, {
        auth: {
          username: this.config.username,
          password: this.config.secret
        },
        timeout: 5000
      });

      if (this.config.debug) {
        console.log('✅ ARI Authentication successful:', response.data);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`ARI Authentication failed: ${error.message}`);
    }
  }

  /**
   * Establish WebSocket connection for real-time events
   */
  connectWebSocket() {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}/ari/events?app=${this.applicationName}&api_key=${this.config.username}:${this.config.secret}`;
      
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          if (this.config.debug) {
            console.log('✅ WebSocket connected to Asterisk');
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleAsteriskEvent(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          if (this.config.debug) {
            console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          }
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else {
            this.emit('error', { error: 'Max reconnection attempts reached', type: 'websocket' });
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        // Set connection timeout
        setTimeout(() => {
          if (this.ws.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    
    if (this.config.debug) {
      console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval}ms`);
    }
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Handle incoming Asterisk events
   */
  handleAsteriskEvent(event) {
    if (this.config.debug) {
      console.log('📨 Asterisk Event:', event);
    }

    switch (event.type) {
      case 'StasisStart':
        this.handleStasisStart(event);
        break;
      case 'StasisEnd':
        this.handleStasisEnd(event);
        break;
      case 'ChannelStateChange':
        this.handleChannelStateChange(event);
        break;
      case 'ChannelDestroyed':
        this.handleChannelDestroyed(event);
        break;
      case 'ChannelDtmfReceived':
        this.handleDtmfReceived(event);
        break;
      case 'PlaybackStarted':
      case 'PlaybackFinished':
        this.handlePlaybackEvent(event);
        break;
      default:
        this.emit('asteriskEvent', event);
    }
  }

  /**
   * Handle new channel entering the application
   */
  handleStasisStart(event) {
    const channel = event.channel;
    const args = event.args || [];

    this.activeChannels.set(channel.id, {
      id: channel.id,
      name: channel.name,
      caller: channel.caller,
      connected: channel.connected,
      state: channel.state,
      timestamp: new Date(),
      direction: args.includes('incoming') ? 'incoming' : 'outgoing'
    });

    // Determine if this is an incoming or outgoing call
    if (channel.state === 'Ring') {
      this.emit('incomingCall', {
        callId: channel.id,
        callerNumber: channel.caller.number,
        callerName: channel.caller.name,
        timestamp: new Date(),
        channel: channel.name
      });
    }
  }

  /**
   * Handle channel leaving the application
   */
  handleStasisEnd(event) {
    const channel = event.channel;
    const channelData = this.activeChannels.get(channel.id);

    if (channelData) {
      this.emit('callEnded', {
        callId: channel.id,
        duration: Math.floor((new Date() - channelData.timestamp) / 1000),
        timestamp: new Date()
      });

      this.activeChannels.delete(channel.id);
    }
  }

  /**
   * Handle channel state changes
   */
  handleChannelStateChange(event) {
    const channel = event.channel;
    const channelData = this.activeChannels.get(channel.id);

    if (channelData) {
      channelData.state = channel.state;

      // Emit appropriate events based on state
      switch (channel.state) {
        case 'Up':
          this.emit('callAnswered', { callId: channel.id });
          break;
        case 'Ringing':
          this.emit('callRinging', { callId: channel.id });
          break;
        case 'Busy':
          this.emit('callBusy', { callId: channel.id });
          break;
      }
    }
  }

  /**
   * Handle channel destruction
   */
  handleChannelDestroyed(event) {
    const channel = event.channel;
    this.activeChannels.delete(channel.id);
  }

  /**
   * Handle DTMF (keypad) input
   */
  handleDtmfReceived(event) {
    this.emit('dtmfReceived', {
      callId: event.channel.id,
      digit: event.digit,
      timestamp: new Date()
    });
  }

  /**
   * Handle playback events
   */
  handlePlaybackEvent(event) {
    this.emit('playbackEvent', {
      callId: event.playback.target_uri.replace('channel:', ''),
      playbackId: event.playback.id,
      state: event.playback.state,
      type: event.type
    });
  }

  /**
   * Make an outgoing call
   */
  async makeCall(phoneNumber, callerIdNumber = null, callerIdName = 'Grameenbazar Support') {
    try {
      const endpoint = `PJSIP/${phoneNumber}@trunk`;
      const callerId = callerIdNumber || this.config.defaultCallerId || '01700000000';
      
      const response = await axios.post(
        `${this.config.apiUrl}/channels`,
        {
          endpoint: endpoint,
          app: this.applicationName,
          appArgs: ['outgoing'],
          callerId: `"${callerIdName}" <${callerId}>`,
          timeout: 30
        },
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      const channel = response.data;
      
      this.emit('outgoingCall', {
        callId: channel.id,
        targetNumber: phoneNumber,
        callerName: callerIdName,
        timestamp: new Date()
      });

      return {
        success: true,
        callId: channel.id,
        channel: channel
      };

    } catch (error) {
      console.error('❌ Failed to make call:', error);
      throw new Error(`Failed to make call to ${phoneNumber}: ${error.message}`);
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(callId) {
    try {
      await axios.post(
        `${this.config.apiUrl}/channels/${callId}/answer`,
        {},
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      this.emit('callAnswered', { callId });
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      throw new Error(`Failed to answer call ${callId}: ${error.message}`);
    }
  }

  /**
   * Hangup a call
   */
  async hangupCall(callId) {
    try {
      await axios.delete(
        `${this.config.apiUrl}/channels/${callId}`,
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      this.emit('callEnded', { callId });
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to hangup call:', error);
      throw new Error(`Failed to hangup call ${callId}: ${error.message}`);
    }
  }

  /**
   * Hold a call
   */
  async holdCall(callId) {
    try {
      await axios.post(
        `${this.config.apiUrl}/channels/${callId}/hold`,
        {},
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      this.emit('callHeld', { callId });
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to hold call:', error);
      throw new Error(`Failed to hold call ${callId}: ${error.message}`);
    }
  }

  /**
   * Unhold a call
   */
  async unholdCall(callId) {
    try {
      await axios.delete(
        `${this.config.apiUrl}/channels/${callId}/hold`,
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      this.emit('callUnheld', { callId });
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to unhold call:', error);
      throw new Error(`Failed to unhold call ${callId}: ${error.message}`);
    }
  }

  /**
   * Transfer a call
   */
  async transferCall(callId, targetNumber) {
    try {
      const endpoint = `PJSIP/${targetNumber}@trunk`;
      
      await axios.post(
        `${this.config.apiUrl}/channels/${callId}/redirect`,
        {
          endpoint: endpoint
        },
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      this.emit('callTransferred', { callId, targetNumber });
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to transfer call:', error);
      throw new Error(`Failed to transfer call ${callId} to ${targetNumber}: ${error.message}`);
    }
  }

  /**
   * Start recording a call
   */
  async startRecording(callId, format = 'wav') {
    try {
      const recordingName = `support_call_${callId}_${Date.now()}`;
      
      const response = await axios.post(
        `${this.config.apiUrl}/channels/${callId}/record`,
        {
          name: recordingName,
          format: format,
          maxDurationSeconds: 3600, // 1 hour max
          maxSilenceSeconds: 10,
          terminateOn: '#'
        },
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      return {
        success: true,
        recordingId: recordingName,
        recording: response.data
      };

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw new Error(`Failed to start recording for call ${callId}: ${error.message}`);
    }
  }

  /**
   * Stop recording a call
   */
  async stopRecording(recordingId) {
    try {
      await axios.post(
        `${this.config.apiUrl}/recordings/live/${recordingId}/stop`,
        {},
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      return { success: true };

    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      throw new Error(`Failed to stop recording ${recordingId}: ${error.message}`);
    }
  }

  /**
   * Get call history from CDR
   */
  async getCallHistory(limit = 50, dateFrom = null, dateTo = null) {
    try {
      // This would typically query your CDR database
      // For now, we'll use a mock implementation
      return this.getMockCallHistory(limit);

    } catch (error) {
      console.error('❌ Failed to get call history:', error);
      throw new Error(`Failed to get call history: ${error.message}`);
    }
  }

  /**
   * Mock call history for demonstration
   */
  getMockCallHistory(limit) {
    // In real implementation, this would query CDR database
    const history = [];
    const numbers = ['01712345678', '01823456789', '01934567890', '01645678901'];
    const names = ['রহিম উদ্দিন', 'ফাতেমা খাতুন', 'করিম মিয়া', 'সালমা বেগম'];
    const types = ['incoming', 'outgoing', 'missed'];
    
    for (let i = 0; i < limit; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      const type = types[Math.floor(Math.random() * types.length)];
      
      history.push({
        id: `call_${i}`,
        number: numbers[randomIndex],
        name: names[randomIndex],
        type,
        duration: type === 'missed' ? 0 : Math.floor(Math.random() * 600) + 30,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        status: type === 'missed' ? 'missed' : 'completed',
        recording: type !== 'missed' ? `recording_${i}.wav` : null,
        disposition: type === 'missed' ? 'NO ANSWER' : 'ANSWERED'
      });
    }
    
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get active channels
   */
  async getActiveChannels() {
    try {
      const response = await axios.get(
        `${this.config.apiUrl}/channels`,
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('❌ Failed to get active channels:', error);
      throw new Error(`Failed to get active channels: ${error.message}`);
    }
  }

  /**
   * Play audio file to a channel
   */
  async playAudio(callId, audioFile) {
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/channels/${callId}/play`,
        {
          media: `sound:${audioFile}`
        },
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      throw new Error(`Failed to play audio to call ${callId}: ${error.message}`);
    }
  }

  /**
   * Send DTMF tones
   */
  async sendDTMF(callId, digits) {
    try {
      await axios.post(
        `${this.config.apiUrl}/channels/${callId}/dtmf`,
        {
          dtmf: digits
        },
        {
          auth: {
            username: this.config.username,
            password: this.config.secret
          }
        }
      );

      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send DTMF:', error);
      throw new Error(`Failed to send DTMF to call ${callId}: ${error.message}`);
    }
  }

  /**
   * Event handling methods
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from Asterisk
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.activeChannels.clear();
    this.emit('disconnected', { timestamp: new Date() });
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      activeChannels: this.activeChannels.size,
      reconnectAttempts: this.reconnectAttempts,
      config: {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username
      }
    };
  }
}

export default AsteriskService; 