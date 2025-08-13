"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Volume2, Settings, Keyboard, Music, Info, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

interface AudioContextType extends AudioContext {
  createGain(): GainNode
  createBufferSource(): AudioBufferSourceNode
  createConvolver(): ConvolverNode
  decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer>
}

export default function WebHarmonium() {
  const { theme, setTheme } = useTheme()
  const [isLoaded, setIsLoaded] = useState(false)
  const [volume, setVolume] = useState(30)
  const [useReverb, setUseReverb] = useState(false)
  const [transpose, setTranspose] = useState(0)
  const [currentOctave, setCurrentOctave] = useState(3)
  const [additionalReeds, setAdditionalReeds] = useState(0)
  const [midiDevices, setMidiDevices] = useState<any[]>([])
  const [selectedMidiDevice, setSelectedMidiDevice] = useState<string>("")
  const [midiSupported, setMidiSupported] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)

  const audioContextRef = useRef<AudioContextType | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const reverbBufferRef = useRef<AudioBuffer | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const reverbNodeRef = useRef<ConvolverNode | null>(null)
  const sourceNodesRef = useRef<(AudioBufferSourceNode | null)[]>([])
  const sourceNodeStateRef = useRef<number[]>([])

  const keyboardMap: { [key: string]: number } = {
    s: 53,
    S: 53,
    a: 54,
    A: 54,
    "`": 55,
    "1": 56,
    q: 57,
    Q: 57,
    "2": 58,
    w: 59,
    W: 59,
    e: 60,
    E: 60,
    "4": 61,
    r: 62,
    R: 62,
    "5": 63,
    t: 64,
    T: 64,
    y: 65,
    Y: 65,
    "7": 66,
    u: 67,
    U: 67,
    "8": 68,
    i: 69,
    I: 69,
    "9": 70,
    o: 71,
    O: 71,
    p: 72,
    P: 72,
    "-": 73,
    "[": 74,
    "=": 75,
    "]": 76,
    "\\": 77,
    "'": 78,
    ";": 79,
  }

  const swaramMap: { [key: string]: string } = {
    s: "Ṃ",
    S: "Ṃ",
    a: "Ṃ",
    A: "Ṃ",
    "`": "P̣",
    "1": "Ḍ",
    q: "Ḍ",
    Q: "Ḍ",
    "2": "Ṇ",
    w: "Ṇ",
    W: "Ṇ",
    e: "S",
    E: "S",
    "4": "R",
    r: "R",
    R: "R",
    "5": "G",
    t: "G",
    T: "G",
    y: "M",
    Y: "M",
    "7": "M",
    u: "P",
    U: "P",
    "8": "D",
    i: "D",
    I: "D",
    "9": "N",
    o: "N",
    O: "N",
    p: "Ṡ",
    P: "Ṡ",
    "-": "Ṙ",
    "[": "Ṙ",
    "=": "Ġ",
    "]": "Ġ",
    "\\": "Ṁ",
    "'": "Ṁ",
    ";": "Ṗ",
  }

  const octaveMap = [-36, -24, -12, 0, 12, 24, 36]
  const baseKeyNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const keyMap = useRef<number[]>([])
  const baseKeyMap = useRef<number[]>([])

  const initializeAudio = useCallback(async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()

      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.gain.value = volume / 100
      gainNodeRef.current.connect(audioContextRef.current.destination)

      reverbNodeRef.current = audioContextRef.current.createConvolver()
      reverbNodeRef.current.connect(audioContextRef.current.destination)

      // Load harmonium sample
      const harmoniumResponse = await fetch("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/harmonium-kannan-orig-6DIgVWUXlXjskJRcrUvRNLUBNigcyy.wav")
      const harmoniumArrayBuffer = await harmoniumResponse.arrayBuffer()
      audioBufferRef.current = await audioContextRef.current.decodeAudioData(harmoniumArrayBuffer)

      // Load reverb impulse response
      const reverbResponse = await fetch("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reverb-OkQQ8iqL5OAhhMOQOXryBDa6TDHb1a.wav")
      const reverbArrayBuffer = await reverbResponse.arrayBuffer()
      reverbBufferRef.current = await audioContextRef.current.decodeAudioData(reverbArrayBuffer)
      reverbNodeRef.current.buffer = reverbBufferRef.current

      initializeKeyMap()
      initializeSourceNodes()
      setIsLoaded(true)
    } catch (error) {
      console.error("Error initializing audio:", error)
    }
  }, [volume])

  const initializeKeyMap = useCallback(() => {
    const middleC = 60
    const rootKey = 62
    const startKey = middleC - 124 + (rootKey - middleC)

    for (let i = 0; i < 128; i++) {
      baseKeyMap.current[i] = startKey + i
      keyMap.current[i] = baseKeyMap.current[i] + transpose
    }
  }, [transpose])

  const initializeSourceNodes = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current) return

    sourceNodesRef.current = new Array(128).fill(null)
    sourceNodeStateRef.current = new Array(128).fill(0)

    for (let i = 0; i < 128; i++) {
      setSourceNode(i)
    }
  }, [])

  const setSourceNode = useCallback(
    (index: number) => {
      if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) return

      if (sourceNodesRef.current[index] && sourceNodeStateRef.current[index] === 1) {
        sourceNodesRef.current[index]?.stop(0)
      }

      sourceNodeStateRef.current[index] = 0
      sourceNodesRef.current[index] = audioContextRef.current.createBufferSource()
      sourceNodesRef.current[index]!.connect(gainNodeRef.current)

      if (useReverb && reverbNodeRef.current) {
        gainNodeRef.current.connect(reverbNodeRef.current)
      } else {
        try {
          gainNodeRef.current.disconnect(reverbNodeRef.current!)
        } catch (e) {
          // Ignore disconnect errors
        }
      }

      sourceNodesRef.current[index]!.buffer = audioBufferRef.current
      sourceNodesRef.current[index]!.loop = true
      sourceNodesRef.current[index]!.loopStart = 0.5
      sourceNodesRef.current[index]!.loopEnd = 7.5

      if (keyMap.current[index] !== 0) {
        sourceNodesRef.current[index]!.detune.value = keyMap.current[index] * 100
      }
    },
    [useReverb],
  )

  const noteOn = useCallback(
    (note: number) => {
      const index = note + octaveMap[currentOctave]
      if (index < sourceNodesRef.current.length && sourceNodeStateRef.current[index] === 0) {
        sourceNodesRef.current[index]?.start(0)
        sourceNodeStateRef.current[index] = 1
      }

      // Additional reeds
      for (let c = 1; c <= additionalReeds; c++) {
        const additionalIndex = note + octaveMap[currentOctave + c]
        if (additionalIndex < sourceNodesRef.current.length && sourceNodeStateRef.current[additionalIndex] === 0) {
          sourceNodesRef.current[additionalIndex]?.start(0)
          sourceNodeStateRef.current[additionalIndex] = 1
        }
      }
    },
    [currentOctave, additionalReeds],
  )

  const noteOff = useCallback(
    (note: number) => {
      const index = note + octaveMap[currentOctave]
      if (index < sourceNodesRef.current.length) {
        setSourceNode(index)
      }

      // Additional reeds
      for (let c = 1; c <= additionalReeds; c++) {
        const additionalIndex = note + octaveMap[currentOctave + c]
        if (additionalIndex < sourceNodesRef.current.length) {
          setSourceNode(additionalIndex)
        }
      }
    },
    [currentOctave, additionalReeds, setSourceNode],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.repeat || !isLoaded) return

      const key = event.key
      if (keyboardMap[key] !== undefined) {
        noteOn(keyboardMap[key])
      }
    },
    [isLoaded, noteOn],
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!isLoaded) return

      const key = event.key
      if (keyboardMap[key] !== undefined) {
        noteOff(keyboardMap[key])
      }
    },
    [isLoaded, noteOff],
  )

  /**
   * Initialise WebMIDI if both the API and the browser-permission are available.
   * If the permissions policy blocks MIDI (the common case in iframes / previews),
   * we silently disable the feature instead of throwing.
   */
  const initializeMIDI = useCallback(async () => {
    // 1. API available?
    if (typeof navigator === "undefined" || typeof navigator.requestMIDIAccess !== "function") {
      setMidiSupported(false)
      return
    }

    // 2. Permission granted / prompt? (Some browsers support “midi” permission query)
    if (navigator.permissions && (navigator as any).permissions.query) {
      try {
        const status = await (navigator as any).permissions.query({ name: "midi", sysex: false })
        if (status.state === "denied") {
          setMidiSupported(false)
          return
        }
      } catch {
        // Ignore – permissions API not fully supported
      }
    }

    try {
      const midiAccess = await navigator.requestMIDIAccess({ sysex: false })
      setMidiSupported(true)

      const devices: any[] = []
      for (const input of midiAccess.inputs.values()) {
        devices.push({
          id: input.id,
          name: input.name,
          manufacturer: input.manufacturer,
        })

        input.onmidimessage = (message: any) => {
          if (selectedMidiDevice === input.id || selectedMidiDevice === "") {
            const [command, note, velocity = 0] = message.data
            if (command === 144 && velocity > 0) noteOn(note)
            else if (command === 128 || (command === 144 && velocity === 0)) noteOff(note)
          }
        }
      }
      setMidiDevices(devices)
    } catch (err) {
      // Most likely blocked by permissions policy (e.g. preview sandbox)
      console.warn("WebMIDI disabled:", err)
      setMidiSupported(false)
    }
  }, [selectedMidiDevice, noteOn, noteOff])

  useEffect(() => {
    initializeAudio()
    initializeMIDI()
  }, [initializeAudio, initializeMIDI])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100
    }
  }, [volume])

  useEffect(() => {
    initializeKeyMap()
    initializeSourceNodes()
  }, [transpose, initializeKeyMap, initializeSourceNodes])

  useEffect(() => {
    if (gainNodeRef.current && reverbNodeRef.current) {
      if (useReverb) {
        gainNodeRef.current.connect(reverbNodeRef.current)
      } else {
        try {
          gainNodeRef.current.disconnect(reverbNodeRef.current)
        } catch (e) {
          // Ignore disconnect errors
        }
      }
    }
  }, [useReverb])

  const getRootNoteName = () => {
    return baseKeyNames[transpose >= 0 ? transpose % 12 : transpose + 12]
  }

  const HarmoniumKeys = () => {
    const keys = [
      { key: "`", type: "white", note: "P̣", keyName: "C" },
      { key: "1", type: "black", note: "Ḍ" },
      { key: "q", type: "white", note: "Ḍ", keyName: "D" },
      { key: "2", type: "black", note: "Ṇ" },
      { key: "w", type: "white", note: "Ṇ", keyName: "E" },
      { key: "e", type: "white", note: "S", keyName: "F" },
      { key: "4", type: "black", note: "R" },
      { key: "r", type: "white", note: "R", keyName: "G" },
      { key: "5", type: "black", note: "G" },
      { key: "t", type: "white", note: "G", keyName: "A" },
      { key: "y", type: "white", note: "M", keyName: "B" },
      { key: "7", type: "black", note: "M" },
      { key: "u", type: "white", note: "P", keyName: "C" },
      { key: "8", type: "black", note: "D" },
      { key: "i", type: "white", note: "D", keyName: "D" },
      { key: "9", type: "black", note: "N" },
      { key: "o", type: "white", note: "N", keyName: "E" },
      { key: "p", type: "white", note: "Ṡ", keyName: "F" },
      { key: "-", type: "black", note: "Ṙ" },
      { key: "[", type: "white", note: "Ṙ", keyName: "G" },
      { key: "=", type: "black", note: "Ġ" },
      { key: "]", type: "white", note: "Ġ", keyName: "A" },
      { key: "\\", type: "white", note: "Ṁ", keyName: "B" },
    ]

    return (
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg
            width="460"
            height="120"
            className="border rounded-lg shadow-lg bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
          >
            {keys.map((keyData, index) => {
              const isWhite = keyData.type === "white"
              const width = isWhite ? 20 : 14
              const height = isWhite ? 100 : 60
              const x = isWhite ? index * 20 : (index - 0.5) * 20 - 7
              const y = 10

              return (
                <g key={keyData.key}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={isWhite ? "white" : "#1f2937"}
                    stroke="#374151"
                    strokeWidth="1"
                    className="transition-colors duration-150"
                    rx="2"
                  />
                  <text
                    x={x + width / 2}
                    y={y + (isWhite ? 25 : 20)}
                    textAnchor="middle"
                    className={`text-xs font-mono ${isWhite ? "fill-gray-700" : "fill-white"}`}
                  >
                    {keyData.key}
                  </text>
                  {keyData.note && (
                    <text
                      x={x + width / 2}
                      y={y + (isWhite ? 45 : 40)}
                      textAnchor="middle"
                      className={`text-xs font-semibold ${isWhite ? "fill-blue-600" : "fill-blue-300"}`}
                    >
                      {keyData.note}
                    </text>
                  )}
                  {keyData.keyName && isWhite && (
                    <text x={x + width / 2} y={y + 85} textAnchor="middle" className="text-xs font-bold fill-green-600">
                      {keyData.keyName}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Web Harmonium...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Preparing audio samples and MIDI support</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Music className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Web Harmonium</h1>
            <div className="flex gap-2">
              <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Instructions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>How to Use Web Harmonium</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold mb-2">Keyboard Controls:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Use your computer keyboard to play notes</li>
                        <li>White keys: ` q w e r t y u i o p [ ] \</li>
                        <li>Black keys: 1 2 4 5 7 8 9 - =</li>
                        <li>Each key corresponds to a specific musical note</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Indian Classical Notation:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>S (Sa), R (Re), G (Ga), M (Ma), P (Pa), D (Dha), N (Ni)</li>
                        <li>Dots below notes indicate lower octave</li>
                        <li>Dots above notes indicate higher octave</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Controls:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>
                          <strong>Volume:</strong> Adjust the overall volume level
                        </li>
                        <li>
                          <strong>Reverb:</strong> Add spatial depth to the sound
                        </li>
                        <li>
                          <strong>Transpose:</strong> Change the root key/pitch
                        </li>
                        <li>
                          <strong>Octave:</strong> Shift the playing range up or down
                        </li>
                        <li>
                          <strong>Additional Reeds:</strong> Layer multiple octaves for richer sound
                        </li>
                        <li>
                          <strong>MIDI:</strong> Connect external MIDI keyboards
                        </li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showThemeSelector} onOpenChange={setShowThemeSelector}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    {theme === "light" ? (
                      <Sun className="h-4 w-4" />
                    ) : theme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Choose Theme</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex flex-col gap-2 h-16"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex flex-col gap-2 h-16"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex flex-col gap-2 h-16"
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Play traditional Indian harmonium using your keyboard or MIDI controller
          </p>
          <Badge variant="secondary" className="mt-2">
            Current Key: {getRootNoteName()} | Octave: {currentOctave}
          </Badge>
        </div>

        {/* Harmonium Keys */}
        <HarmoniumKeys />

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Volume Control */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="h-5 w-5 text-blue-600" />
                Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Level</span>
                  <Badge variant="outline">{volume}%</Badge>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reverb Control */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-purple-600" />
                Reverb
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Add spatial depth</span>
                <Switch checked={useReverb} onCheckedChange={setUseReverb} />
              </div>
            </CardContent>
          </Card>

          {/* MIDI Control */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Keyboard className="h-5 w-5 text-green-600" />
                MIDI Keyboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={midiSupported ? "default" : "destructive"}>
                    {midiSupported ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                {midiDevices.length > 0 && (
                  <Select value={selectedMidiDevice} onValueChange={setSelectedMidiDevice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select MIDI device" />
                    </SelectTrigger>
                    <SelectContent>
                      {midiDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transpose Control */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Music className="h-5 w-5 text-orange-600" />
                Transpose
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Root Note</span>
                  <Badge variant="outline">{getRootNoteName()}</Badge>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTranspose(Math.max(-11, transpose - 1))}
                    disabled={transpose <= -11}
                  >
                    -
                  </Button>
                  <span className="font-mono text-lg min-w-[3ch] text-center">
                    {transpose > 0 ? `+${transpose}` : transpose}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTranspose(Math.min(11, transpose + 1))}
                    disabled={transpose >= 11}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Octave Control */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-indigo-600" />
                Current Octave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentOctave(Math.max(0, currentOctave - 1))}
                  disabled={currentOctave <= 0}
                >
                  -
                </Button>
                <span className="font-mono text-xl min-w-[2ch] text-center">{currentOctave}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentOctave(Math.min(6, currentOctave + 1))}
                  disabled={currentOctave >= 6}
                >
                  +
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Reeds Control */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="h-5 w-5 text-red-600" />
                Additional Reeds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Layer multiple octaves for richer sound</p>
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdditionalReeds(Math.max(0, additionalReeds - 1))}
                    disabled={additionalReeds <= 0}
                  >
                    -
                  </Button>
                  <span className="font-mono text-xl min-w-[2ch] text-center">{additionalReeds}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdditionalReeds(Math.min(6 - currentOctave, additionalReeds + 1))}
                    disabled={currentOctave + additionalReeds >= 6}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Web Harmonium - Experience the traditional Indian harmonium in your browser
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Use your keyboard or connect a MIDI controller to play
          </p>
        </div>
      </div>
    </div>
  )
}
