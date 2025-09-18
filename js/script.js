class MatrixTerminal {
    constructor() {
        this.chatInput = document.getElementById('chat-input');
        this.chatMessages = document.getElementById('chat-messages');
        this.bootSequence = document.querySelector('.boot-sequence');
        this.connectionIndicator = document.getElementById('connection-indicator');
        this.connectionText = this.connectionIndicator.querySelector('.connection-text');

        this.messageHistory = [];
        this.historyIndex = -1;
        this.soundEnabled = true;

        this.init();
        this.initSounds();
        this.initConnectionStatus();
    }

    initSounds() {
        this.sounds = {
            keypress: this.createBeepSound(800, 50),
            message: this.createBeepSound(600, 100),
            error: this.createBeepSound(400, 200)
        };
    }

    createBeepSound(frequency, duration) {
        return () => {
            if (!this.soundEnabled) return;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        };
    }

    playSound(soundType) {
        if (this.sounds[soundType]) {
            this.sounds[soundType]();
        }
    }

    init() {
        this.hideBootSequence();
        this.bindEvents();
        this.focusInput();
        this.displayWelcomeMessage();
    }

    hideBootSequence() {
        setTimeout(() => {
            this.bootSequence.style.display = 'none';
        }, 3000);
    }

    bindEvents() {
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.playSound('keypress');
                this.handleUserInput();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.playSound('keypress');
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.playSound('keypress');
                this.navigateHistory(1);
            } else if (e.key.length === 1) {
                this.playSound('keypress');
            }
        });

        document.addEventListener('click', () => {
            this.focusInput();
        });
    }

    focusInput() {
        this.chatInput.focus();
    }

    handleUserInput() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.messageHistory.push(message);
        this.historyIndex = this.messageHistory.length;

        this.displayMessage(message, 'user');
        this.chatInput.value = '';

        if (this.isCommand(message)) {
            this.handleCommand(message);
        } else {
            this.generateBotResponse(message);
        }
    }

    isCommand(message) {
        return message.startsWith('/');
    }

    handleCommand(command) {
        const cmd = command.toLowerCase();

        switch (cmd) {
            case '/help':
                this.displaySystemMessage(`Available commands:
/help - Show this help message
/clear - Clear the terminal
/matrix - Display Matrix quote
/time - Show current time
/status - System status
/whoami - Display user info
/sound - Toggle sound effects
/webhook - Toggle webhook integration
/debug - Toggle debug mode
/connection - Test webhook connection`);
                break;

            case '/clear':
                this.clearMessages();
                break;

            case '/matrix':
                const matrixQuotes = [
                    "There is no spoon.",
                    "Follow the white rabbit.",
                    "Welcome to the real world.",
                    "The Matrix has you...",
                    "Free your mind.",
                    "What is real? How do you define 'real'?",
                    "I can only show you the door. You're the one that has to walk through it.",
                    "The body cannot live without the mind.",
                    "There's a difference between knowing the path and walking the path.",
                    "Choice. The problem is choice.",
                    "We're not here because we're free. We're here because we're not free.",
                    "The Matrix is everywhere. It is all around us."
                ];
                const randomQuote = matrixQuotes[Math.floor(Math.random() * matrixQuotes.length)];
                this.displayBotMessage(randomQuote);
                break;

            case '/time':
                this.displaySystemMessage(`Current time: ${new Date().toLocaleString()}`);
                break;

            case '/status':
                const webhookStatus = MatrixConfig.features.webhookEnabled ? 'ENABLED' : 'DISABLED';
                const envStatus = MatrixConfig.environment.isLocal ? 'LOCAL' : 'PRODUCTION';
                this.displaySystemMessage(`MATRIX TERMINAL v2.1.0
Status: ONLINE
Environment: ${envStatus}
Webhook: ${webhookStatus}
Connection: SECURED
AI Assistant: READY`);
                break;

            case '/whoami':
                this.displaySystemMessage(`User: Neo
Access Level: Administrator
Location: The Matrix`);
                break;

            case '/sound':
                this.soundEnabled = !this.soundEnabled;
                this.displaySystemMessage(`Sound effects ${this.soundEnabled ? 'enabled' : 'disabled'}.`);
                break;

            case '/webhook':
                MatrixConfig.features.webhookEnabled = !MatrixConfig.features.webhookEnabled;
                this.displaySystemMessage(`Webhook integration ${MatrixConfig.features.webhookEnabled ? 'enabled' : 'disabled'}.`);
                break;

            case '/debug':
                MatrixConfig.features.debugging = !MatrixConfig.features.debugging;
                this.displaySystemMessage(`Debug mode ${MatrixConfig.features.debugging ? 'enabled' : 'disabled'}.`);
                break;

            case '/connection':
                this.testConnection();
                break;

            case '/testpost':
                this.testPostWebhook();
                break;

            case '/testsimple':
                this.testSimpleWebhook();
                break;

            case '/testecho':
                this.testEchoWebhook();
                break;

            default:
                this.playSound('error');
                this.displaySystemMessage(`Unknown command: ${command}. Type /help for available commands.`);
        }
    }

    async generateBotResponse(userMessage) {
        this.showTypingIndicator();
        this.setConnectionStatus('connecting');

        try {
            if (MatrixConfig.features.webhookEnabled) {
                const response = await this.callWebhook(userMessage);
                this.hideTypingIndicator();
                this.setConnectionStatus('online');
                this.playSound('message');
                this.typewriterEffect(response, 'bot');
            } else {
                // Fallback to mock responses
                this.setConnectionStatus('offline');
                this.generateMockResponse(userMessage);
            }
        } catch (error) {
            MatrixConfig.log(`Webhook error: ${error.message}`, 'error');
            this.hideTypingIndicator();
            this.setConnectionStatus('offline');

            if (MatrixConfig.features.fallbackToMock) {
                this.displaySystemMessage("Connection unstable. Switching to local mode...");
                this.generateMockResponse(userMessage);
            } else {
                this.displaySystemMessage("Connection to AI systems failed. Please try again.");
                this.playSound('error');
            }
        }
    }

    async callWebhook(message) {
        MatrixConfig.log(`Sending message to webhook: ${message}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), MatrixConfig.webhook.timeout);

        try {
            let response;

            if (MatrixConfig.webhook.usePost) {
                // Use POST method with JSON body
                MatrixConfig.log(`Using POST method`);
                response = await fetch(MatrixConfig.webhook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*',
                        'User-Agent': 'Matrix-Terminal/2.1.0'
                    },
                    body: JSON.stringify({
                        chatInput: message
                    }),
                    signal: controller.signal
                });
            } else {
                // Use GET method with query parameters
                const encodedMessage = encodeURIComponent(message);
                const webhookUrl = `${MatrixConfig.webhook.url}?chatInput=${encodedMessage}`;
                MatrixConfig.log(`Full webhook URL: ${webhookUrl}`);

                response = await fetch(webhookUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'User-Agent': 'Matrix-Terminal/2.1.0'
                    },
                    signal: controller.signal
                });
            }

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Try to parse response - handle both JSON and text
            let responseData;
            const responseText = await response.text();

            // Debug logging
            MatrixConfig.log(`Webhook response length: ${responseText.length}`);
            MatrixConfig.log(`Webhook response: "${responseText}"`);

            // If response is empty, return a default message
            if (!responseText || responseText.trim() === '') {
                return "Webhook responded but returned no data";
            }

            // Try to parse as JSON, but fall back to text
            try {
                responseData = JSON.parse(responseText);

                // Handle n8n array format: [{ "text": "response" }]
                if (Array.isArray(responseData) && responseData.length > 0) {
                    const firstItem = responseData[0];
                    if (firstItem.text) {
                        MatrixConfig.log(`Extracted from n8n array format: ${firstItem.text.substring(0, 100)}...`);
                        return firstItem.text;
                    }
                }

                // Handle direct object format
                const extractedMessage = responseData.message || responseData.response || responseData.text || responseData.output || JSON.stringify(responseData);
                MatrixConfig.log(`Extracted message: ${extractedMessage}`);
                return extractedMessage;
            } catch (jsonError) {
                // Not valid JSON, return as text
                MatrixConfig.log(`Response is not JSON, returning as text: ${jsonError.message}`);
                return responseText;
            }

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout - AI systems not responding');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Network connection failed - check your internet');
            } else {
                throw error;
            }
        }
    }

    generateMockResponse(userMessage) {
        setTimeout(() => {
            this.hideTypingIndicator();

            const responses = this.getContextualResponse(userMessage);
            const response = responses[Math.floor(Math.random() * responses.length)];

            this.playSound('message');
            this.typewriterEffect(response, 'bot');
        }, 1000 + Math.random() * 2000);
    }

    getContextualResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return [
                "Greetings, Neo. Welcome to the Matrix.",
                "Hello there. The One has arrived.",
                "Salutations. You've taken the red pill, I see."
            ];
        }

        if (lowerMessage.includes('matrix')) {
            return [
                "The Matrix has you...",
                "There is no spoon.",
                "Welcome to the real world.",
                "Free your mind."
            ];
        }

        if (lowerMessage.includes('help') || lowerMessage.includes('?')) {
            return [
                "I can assist you with various queries. Try typing /help for commands.",
                "How may I assist you in navigating the Matrix?",
                "I'm here to help guide you through the digital realm."
            ];
        }

        if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
            return [
                `In the Matrix, time is an illusion. But it's ${new Date().toLocaleString()}`,
                "Time moves differently here in the code.",
                `Current timestamp: ${Date.now()}`
            ];
        }

        return [
            "Interesting perspective. Tell me more.",
            "The code flows through everything.",
            "I see the patterns in your words.",
            "Processing your input through the Matrix...",
            "The Oracle would find this fascinating.",
            "Your query has been logged in the mainframe.",
            "Morpheus would be proud of your curiosity.",
            "The machines are listening...",
            "Reality is what you make of it in the Matrix."
        ];
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message typing-indicator';
        indicator.innerHTML = `<span class="message-timestamp">${this.getTimestamp()}</span>AI is thinking`;
        indicator.id = 'typing-indicator';
        this.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    typewriterEffect(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `<span class="message-timestamp">${this.getTimestamp()}</span><span class="message-content"></span>`;

        const contentSpan = messageDiv.querySelector('.message-content');
        this.chatMessages.appendChild(messageDiv);

        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                contentSpan.textContent += text.charAt(i);
                i++;
                this.scrollToBottom();
            } else {
                clearInterval(typeInterval);
            }
        }, 50);
    }

    displayMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `<span class="message-timestamp">${this.getTimestamp()}</span>${message}`;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    displayBotMessage(message) {
        this.typewriterEffect(message, 'bot');
    }

    displaySystemMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-system';
        messageDiv.innerHTML = `<span class="message-timestamp">${this.getTimestamp()}</span>${message}`;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    initConnectionStatus() {
        // Start with connecting status
        this.setConnectionStatus('connecting');

        // Test initial connection after boot sequence
        setTimeout(() => {
            this.testInitialConnection();
        }, 4000);
    }

    setConnectionStatus(status) {
        this.connectionIndicator.className = `connection-indicator ${status}`;

        switch (status) {
            case 'online':
                this.connectionText.textContent = 'ONLINE';
                break;
            case 'offline':
                this.connectionText.textContent = 'OFFLINE';
                break;
            case 'connecting':
                this.connectionText.textContent = 'CONNECTING';
                break;
        }
    }

    async testInitialConnection() {
        if (MatrixConfig.features.webhookEnabled) {
            try {
                await this.callWebhook('system_check');
                this.setConnectionStatus('online');
                MatrixConfig.log('Initial connection test successful');
            } catch (error) {
                this.setConnectionStatus('offline');
                MatrixConfig.log(`Initial connection test failed: ${error.message}`, 'warn');
            }
        } else {
            this.setConnectionStatus('offline');
        }
    }

    displayWelcomeMessage() {
        setTimeout(() => {
            this.displaySystemMessage("Matrix Terminal initialized. Connection established.");
            setTimeout(() => {
                this.displayBotMessage("Hello, Neo. I am your AI assistant. How may I help you today?");
            }, 1000);
        }, 3500);
    }

    clearMessages() {
        this.chatMessages.innerHTML = '';
        this.displaySystemMessage("Terminal cleared.");
    }

    navigateHistory(direction) {
        if (this.messageHistory.length === 0) return;

        this.historyIndex += direction;

        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.messageHistory.length) {
            this.historyIndex = this.messageHistory.length;
            this.chatInput.value = '';
            return;
        }

        this.chatInput.value = this.messageHistory[this.historyIndex] || '';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async testConnection() {
        this.displaySystemMessage("Testing webhook connection...");

        try {
            const testMessage = "hello";
            const response = await this.callWebhook(testMessage);
            this.displaySystemMessage(`✅ Webhook connection successful`);
            this.displaySystemMessage(`Response: ${response.substring(0, 100)}...`);
            MatrixConfig.log(`Connection test successful: ${response}`);
        } catch (error) {
            this.displaySystemMessage(`❌ Webhook connection failed: ${error.message}`);

            // Show more detailed error info in debug mode
            if (MatrixConfig.debug) {
                this.displaySystemMessage(`Debug: Check n8n workflow configuration`);
                this.displaySystemMessage(`URL: ${MatrixConfig.webhook.url}`);
            }

            MatrixConfig.log(`Connection test failed: ${error.message}`, 'error');
        }
    }

    async testPostWebhook() {
        this.displaySystemMessage("Testing POST webhook...");

        try {
            const testMessage = "hello";
            const response = await fetch(MatrixConfig.webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/plain, */*'
                },
                body: JSON.stringify({
                    chatInput: testMessage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseText = await response.text();
            this.displaySystemMessage(`✅ POST webhook successful`);
            this.displaySystemMessage(`Response: ${responseText.substring(0, 100)}...`);
            MatrixConfig.log(`POST test successful: ${responseText}`);

        } catch (error) {
            this.displaySystemMessage(`❌ POST webhook failed: ${error.message}`);
            MatrixConfig.log(`POST test failed: ${error.message}`, 'error');
        }
    }

    async testSimpleWebhook() {
        this.displaySystemMessage("Testing simple webhook (no parameters)...");

        try {
            const response = await fetch(MatrixConfig.webhook.url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain, */*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseText = await response.text();
            this.displaySystemMessage(`✅ Simple webhook successful`);
            this.displaySystemMessage(`Response: ${responseText.substring(0, 150)}...`);
            MatrixConfig.log(`Simple test successful: ${responseText}`);

        } catch (error) {
            this.displaySystemMessage(`❌ Simple webhook failed: ${error.message}`);
            MatrixConfig.log(`Simple test failed: ${error.message}`, 'error');
        }
    }

    async testEchoWebhook() {
        this.displaySystemMessage("Testing webhook with echo message...");

        try {
            const testMessage = "Echo test - please respond with this exact message";
            const response = await this.callWebhook(testMessage);

            this.displaySystemMessage(`✅ Echo test response received`);
            if (response && response.trim()) {
                this.displaySystemMessage(`Response: "${response}"`);
            } else {
                this.displaySystemMessage(`❌ Response was empty or null`);
                this.displaySystemMessage(`Check n8n workflow - missing Respond to Webhook node?`);
            }

            MatrixConfig.log(`Echo test response: "${response}"`);

        } catch (error) {
            this.displaySystemMessage(`❌ Echo test failed: ${error.message}`);
            MatrixConfig.log(`Echo test failed: ${error.message}`, 'error');
        }
    }

    getTimestamp() {
        const now = new Date();
        return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MatrixTerminal();
});