# 🎹 Web Harmonium

A **modern, browser-based harmonium** built with **Next.js**, **React**, **Tailwind CSS**, and **Bun**.  
Play beautiful harmonium sounds with your **computer keyboard** or an **external MIDI keyboard** — anywhere, anytime.

**Author & Developer:** [Dhruv Akbari](https://github.com/mrakbari91)  

---

## ✨ Key Features

### 🎹 Virtual Harmonium Keyboard
- Interactive, responsive keys (white & black)
- Easy computer-keyboard mapping  
- **Indian Classical Sargam** notation support (Sa, Re, Ga, Ma, Pa, Dha, Ni)

### 🎵 Authentic Audio
- High-quality harmonium samples
- **Low-latency** Web Audio API playback
- Realistic sustain & looping  
- Studio-style reverb with impulse response

### 🎛 Musical Controls
- **Volume**: Smooth slider (1–100%)
- **Transpose**: Shift root key (-11 to +11 semitones)
- **Octave Shift**: Play across 0–6 octaves
- **Additional Reeds**: Add layered tones for richer sound

### 🎹 MIDI Keyboard Support
- Plug & play with Web MIDI API
- Multi-device detection & selection
- MIDI volume (CC7) support

### 💾 Save Your Settings
- All preferences stored in browser  
- Auto-restore on reload

---

## 🎯 How to Play

### Keyboard Layout
```

Black Keys: 1 2 4 5 7 8 9 - =
White Keys: \` q w e r t y u i o p \[ ] \\

````

- Use **white keys** for main notes & **black keys** for sharps/flats  
- Adjust **volume**, **transpose**, and **octave** live while playing  

---

## ⚡ Quick Start (with Bun)

### Prerequisites
- [Bun](https://bun.sh/) installed

### Run Locally
```bash
git clone https://github.com/MrAkbari91/web-harmonium.git
cd web-harmonium
bun install
bun run dev
````

Open: [http://localhost:3000](http://localhost:3000)

### Production

```bash
bun run build
bun run start
```

---

## 📁 Required Audio Files

Place these in `public/`:

* `harmonium-kannan-orig.wav` → Main harmonium sample
* `reverb.wav` → Reverb impulse

---

## 🌐 Browser Compatibility

✅ Chrome 66+ | ✅ Firefox 60+ | ✅ Safari 14+ | ✅ Edge 79+
Requires: **Web Audio API**, **ES6+**, **Local Storage**
MIDI features need **Web MIDI API** support.

---

## 🛠 Tech Stack

* **Frontend**: Next.js 14 + React 18
* **Styling**: Tailwind CSS + shadcn/ui
* **Audio**: Web Audio API (`AudioContext`, `GainNode`, `ConvolverNode`)
* **MIDI**: Web MIDI API for hardware integration

---

## 🤝 Open Contribution

This project is **open to all contributors** — whether you’re a musician, developer, or designer.
Help improve **Web Harmonium** by:

1. Forking the repo
2. Creating a new branch
3. Making your changes
4. Submitting a PR with a clear explanation

---

## 📜 License

MIT License
© 2025 **Dhruv Akbari** — All Rights Reserved.

---

## 🙏 Credits

* Harmonium Sample: Kannan
* Reverb IR: Open-source community
* Built with ❤️ by **[Dhruv Akbari](https://github.com/mrakbari91)**

---

🎶 *Feel the soul of Indian classical music, right in your browser.*