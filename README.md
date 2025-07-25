# Web Harmonium

A modern web-based harmonium application built with Next.js, React, and Tailwind CSS. Play harmonium using your computer keyboard or connect a MIDI keyboard for a more authentic experience.

## Features

### 🎹 Virtual Keyboard
- Interactive visual keyboard with white and black keys
- Keyboard mapping for easy playing using computer keys
- Indian classical music notation display

### 🎵 Audio Engine
- High-quality harmonium samples
- Web Audio API for low-latency audio playback
- Looping audio sources for sustained notes
- Reverb effects with impulse response

### 🎛️ Controls
- **Volume Control**: Adjust overall volume (1-100%)
- **Reverb Toggle**: Enable/disable reverb effects
- **Transpose**: Change the root key (-11 to +11 semitones)
- **Octave Shift**: Change playing octave (0-6)
- **Additional Reeds**: Add harmonic layers for richer sound

### 🎹 MIDI Support
- Connect external MIDI keyboards
- Automatic device detection
- MIDI volume control support
- Multiple device selection

### 💾 Persistence
- All settings automatically saved to browser storage
- Restored on page reload

## How to Play

### Keyboard Layout
\`\`\`
Black Keys: 1  2     4  5     7  8  9     -  =
White Keys:  `  q  w  e  r  t  y  u  i  o  p  [  ]  \
\`\`\`

### Key Mappings
- **White Keys**: ` q w e r t y u i o p [ ] \
- **Black Keys**: 1 2 4 5 7 8 9 - =
- Each key corresponds to a specific note in the harmonium scale

### Controls
- **Volume**: Use the slider or MIDI controller (CC7)
- **Transpose**: Change the root key to match your preferred scale
- **Octave**: Shift the entire keyboard up or down by octaves
- **Additional Reeds**: Add harmonic layers for fuller sound

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone or download the project**
   \`\`\`bash
   git clone <repository-url>
   cd web-harmonium
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Audio Files

The application requires two audio files:
- `harmonium-kannan-orig.wav` - Main harmonium sample
- `reverb.wav` - Reverb impulse response

These files should be placed in the `public` directory.

## Browser Compatibility

### Supported Browsers
- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

### Required Features
- Web Audio API
- ES6+ JavaScript
- Local Storage
- MIDI API (optional, for MIDI keyboard support)

## Technical Details

### Architecture
- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **Audio**: Web Audio API with AudioContext
- **MIDI**: Web MIDI API for external keyboard support

### Audio Processing
- Uses AudioBufferSourceNode for sample playback
- GainNode for volume control
- ConvolverNode for reverb effects
- Real-time pitch shifting using detune property

### Performance
- Efficient audio node management
- Minimal latency audio playback
- Optimized for real-time performance

## Troubleshooting

### Common Issues

1. **No Sound**
   - Check browser audio permissions
   - Ensure volume is not muted
   - Try clicking on the page first (browser autoplay policy)

2. **MIDI Not Working**
   - Check if your browser supports Web MIDI API
   - Ensure MIDI device is connected before loading the page
   - Try refreshing the page after connecting MIDI device

3. **High Latency**
   - Close other audio applications
   - Try using Chrome for better Web Audio performance
   - Reduce browser tab count

### Browser Permissions
- The app may request microphone permissions (for Web Audio API)
- MIDI access permissions will be requested when connecting devices

## Development

### Project Structure
\`\`\`
├── app/
│   ├── page.tsx          # Main harmonium component
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── components/ui/        # shadcn/ui components
├── public/
│   ├── harmonium-kannan-orig.wav
│   └── reverb.wav
└── README.md
\`\`\`

### Key Components
- **WebHarmonium**: Main component with all functionality
- **Audio Engine**: Web Audio API integration
- **MIDI Handler**: MIDI device management
- **UI Controls**: Volume, reverb, transpose controls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Credits

- Original harmonium sample: Kannan
- Reverb impulse response: Various sources
- Built with Next.js, React, and Tailwind CSS
- UI components from shadcn/ui

## Support

For issues and questions:
1. Check the troubleshooting section
2. Open an issue on the repository
3. Ensure your browser supports required web APIs

---

Enjoy playing the Web Harmonium! 🎵
