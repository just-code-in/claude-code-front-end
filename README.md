# Matrix Terminal Chatbot

A retro Matrix-themed terminal interface for AI chatbots with n8n webhook integration. Experience the iconic green-on-black terminal aesthetic while chatting with your AI assistant.

![Matrix Terminal](https://img.shields.io/badge/Matrix-Terminal-00ff00?style=for-the-badge&logo=matrix)

## ✨ Features

- **🖥️ Authentic Matrix Terminal UI** - CRT monitor effects, scan lines, and phosphor glow
- **💬 Real-time AI Chat** - Seamless integration with n8n webhooks
- **🎮 Interactive Commands** - Terminal-style slash commands
- **🔊 Sound Effects** - Retro terminal beeps and audio feedback
- **📱 Responsive Design** - Works on desktop and mobile devices
- **🎨 Visual Effects** - Matrix digital rain background with customizable speed
- **🔄 Fallback System** - Graceful degradation to mock responses

## 🚀 Live Demo

Visit the live Matrix Terminal: https://matrix-terminal-chatbot.vercel.app

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Deployment**: Vercel
- **AI Backend**: n8n webhook integration
- **Styling**: Matrix-themed CSS with CRT effects

## 📦 Installation & Development

### Prerequisites
- Python 3.x (for local development server)
- Modern web browser with JavaScript enabled

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/just-code-in/claude-code-front-end.git
   cd claude-code-front-end
   ```

2. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your webhook URL
   ```

3. **Start local server**
   ```bash
   python3 -m http.server 8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🌐 Deployment

### Vercel Deployment

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**
   - Import your GitHub repository in Vercel
   - Or use Vercel CLI: `vercel --prod`

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   VITE_WEBHOOK_URL=your-n8n-webhook-url
   ```

4. **Deploy** - Vercel will automatically build and deploy your Matrix Terminal

### Manual Deployment

The application is a static site and can be deployed to any static hosting provider:
- Netlify
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WEBHOOK_URL` | Your n8n webhook endpoint | Built-in fallback URL |

### n8n Webhook Setup

Your n8n workflow should:
1. Accept GET requests with `chatInput` parameter
2. Process the message through your AI service
3. Return response in format: `[{"text": "AI response here"}]`

Example n8n setup:
- **Webhook Trigger**: GET method, extract `{{ $json.query.chatInput }}`
- **AI Node**: Use `{{ $json.query.chatInput }}` as prompt
- **Respond Node**: Return AI response as JSON

## 🎮 Terminal Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/matrix` | Display random Matrix quotes |
| `/clear` | Clear the terminal |
| `/status` | Show system status |
| `/connection` | Test webhook connectivity |
| `/webhook` | Toggle webhook integration |
| `/debug` | Toggle debug mode |
| `/sound` | Toggle sound effects |

## 🎨 Customization

### Matrix Rain Speed
The digital rain effect can be customized in `js/matrix-bg.js`:
```javascript
// Modify frame counter logic for different speeds
if (this.frameCounter % 3 === 0) {
    this.drops[i]++; // Current: 1/3 speed
}
```

### Color Scheme
Terminal colors can be modified in `css/style.css`:
```css
:root {
    --matrix-green: #00ff00;
    --matrix-dark-green: #003300;
    --matrix-cyan: #00cccc;
}
```

## 🔧 Development

### Project Structure
```
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Matrix terminal styling
├── js/
│   ├── config.js      # Configuration and environment variables
│   ├── script.js      # Main chat functionality
│   └── matrix-bg.js   # Matrix digital rain effect
├── vercel.json        # Vercel deployment configuration
└── README.md          # Documentation
```

### Adding New Commands

1. Edit `js/script.js` in the `handleCommand` method
2. Add your command case:
   ```javascript
   case '/mycommand':
       this.displaySystemMessage("My custom command executed!");
       break;
   ```

### Debug Mode

Enable debug mode to see detailed webhook requests:
```javascript
// Type in terminal
/debug

// Or set in code
MatrixConfig.features.debugging = true;
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by The Matrix movie franchise
- Built with modern web technologies
- Powered by n8n workflow automation

---

*"Welcome to the real world, Neo."* 🟢

**Matrix Terminal v2.1.0** - Where AI meets the Matrix
