"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, Piano, Settings, Minus, Plus } from "lucide-react"

interface MIDIInput {
  id: string
  name: string
  manufacturer: string
}

export default function WebHarmonium() {
  // Audio context and nodes
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [gainNode, setGainNode] = useState<GainNode | null>(null)
  const [reverbNode, setReverbNode] = useState<ConvolverNode | null>(null)

  // Settings state
  const [volume, setVolume] = useState(30)
  const [useReverb, setUseReverb] = useState(false)
  const [transpose, setTranspose] = useState(0)
  const [octave, setOctave] = useState(3)
  const [additionalReeds, setAdditionalReeds] = useState(0)
  const [midiDevices, setMidiDevices] = useState<MIDIInput[]>([])
  const [selectedMidiDevice, setSelectedMidiDevice] = useState<string>("none") // Updated default value
  const [midiSupported, setMidiSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Refs for audio nodes and state
  const sourceNodesRef = useRef<(AudioBufferSourceNode | null)[]>(new Array(128).fill(null))
  const sourceNodeStateRef = useRef<number[]>(new Array(128).fill(0))
  const keyMapRef = useRef<number[]>([])
  const baseKeyMapRef = useRef<number[]>([])
  const midiAccessRef = useRef<MIDIAccess | null>(null)

  // Constants
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

  const octaveMap = [-36, -24, -12, 0, 12, 24, 36]
  const baseKeyNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const middleC = 60
  const rootKey = 62

  // Keyboard layout for visual display
  const keyboardLayout = [
    { key: "`", type: "white", label: "`", note: "P̣" },
    { key: "1", type: "black", label: "1", note: "Ḍ" },
    { key: "q", type: "white", label: "q", note: "Ḍ" },
    { key: "2", type: "black", label: "2", note: "Ṇ" },
    { key: "w", type: "white", label: "w", note: "Ṇ" },
    { key: "e", type: "white", label: "e", note: "S" },
    { key: "4", type: "black", label: "4", note: "R" },
    { key: "r", type: "white", label: "r", note: "R" },
    { key: "5", type: "black", label: "5", note: "G" },
    { key: "t", type: "white", label: "t", note: "G" },
    { key: "y", type: "white", label: "y", note: "M" },
    { key: "7", type: "black", label: "7", note: "M" },
    { key: "u", type: "white", label: "u", note: "P" },
    { key: "8", type: "black", label: "8", note: "D" },
    { key: "i", type: "white", label: "i", note: "D" },
    { key: "9", type: "black", label: "9", note: "N" },
    { key: "o", type: "white", label: "o", note: "N" },
    { key: "p", type: "white", label: "p", note: "Ṡ" },
    { key: "-", type: "black", label: "-", note: "Ṙ" },
    { key: "[", type: "white", label: "[", note: "Ṙ" },
    { key: "=", type: "black", label: "=", note: "Ġ" },
    { key: "]", type: "white", label: "]", note: "Ġ" },
    { key: "\\", type: "white", label: "\\", note: "Ṁ" },
  ]

  // Initialize key mappings
  const initializeKeyMaps = useCallback(() => {
    const startKey = middleC - 124 + (rootKey - middleC)
    for (let i = 0; i < 128; i++) {
      baseKeyMapRef.current[i] = startKey + i
      keyMapRef.current[i] = baseKeyMapRef.current[i] + transpose
    }
  }, [transpose])

  // Create source node for a specific key
  const setSourceNode = useCallback(
    (i: number) => {
      if (!audioContext || !audioBuffer || !gainNode) return

      if (sourceNodesRef.current[i] && sourceNodeStateRef.current[i] === 1) {
        sourceNodesRef.current[i]?.stop(0)
      }

      sourceNodeStateRef.current[i] = 0
      sourceNodesRef.current[i] = null

      const sourceNode = audioContext.createBufferSource()
      sourceNode.connect(gainNode).connect(audioContext.destination)
      sourceNode.buffer = audioBuffer
      sourceNode.loop = true
      sourceNode.loopStart = 0.5

      if (keyMapRef.current[i] !== 0) {
        sourceNode.detune.value = keyMapRef.current[i] * 100
      }

      sourceNodesRef.current[i] = sourceNode
    },
    [audioContext, audioBuffer, gainNode],
  )

  // Initialize all source nodes
  const initializeSourceNodes = useCallback(() => {
    for (let i = 0; i < 128; i++) {
      setSourceNode(i)
    }
  }, [setSourceNode])

  // Play note
  const noteOn = useCallback(
    (note: number) => {
      const i = note + octaveMap[octave]
      if (i < sourceNodesRef.current.length && sourceNodeStateRef.current[i] === 0) {
        sourceNodesRef.current[i]?.start(0)
        sourceNodeStateRef.current[i] = 1
      }

      // Play additional reeds
      for (let c = 1; c <= additionalReeds; c++) {
        const idx = note + octaveMap[octave + c]
        if (idx < sourceNodesRef.current.length && sourceNodeStateRef.current[idx] === 0) {
          sourceNodesRef.current[idx]?.start(0)
          sourceNodeStateRef.current[idx] = 1
        }
      }
    },
    [octave, additionalReeds],
  )

  // Stop note
  const noteOff = useCallback(
    (note: number) => {
      const i = note + octaveMap[octave]
      if (i < sourceNodesRef.current.length) {
        setSourceNode(i)
      }

      // Stop additional reeds
      for (let c = 1; c <= additionalReeds; c++) {
        const idx = note + octaveMap[octave + c]
        if (idx < sourceNodesRef.current.length) {
          setSourceNode(idx)
        }
      }
    },
    [octave, additionalReeds, setSourceNode],
  )

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.repeat && keyboardMap[event.key]) {
        noteOn(keyboardMap[event.key])
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (keyboardMap[event.key]) {
        noteOff(keyboardMap[event.key])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [noteOn, noteOff])

  // Initialize MIDI
  const initializeMIDI = useCallback(async () => {
    try {
      if (navigator.requestMIDIAccess) {
        setMidiSupported(true)
        const midiAccess = await navigator.requestMIDIAccess()
        midiAccessRef.current = midiAccess

        const devices: MIDIInput[] = []
        for (const input of midiAccess.inputs.values()) {
          devices.push({
            id: input.id,
            name: input.name || "Unknown Device",
            manufacturer: input.manufacturer || "Unknown",
          })

          input.onmidimessage = (message) => {
            const [command, note, velocity] = message.data

            if (selectedMidiDevice === "none" || selectedMidiDevice === input.id) {
              switch (command) {
                case 144: // Note on
                  if (velocity > 0) {
                    noteOn(note)
                  } else {
                    noteOff(note)
                  }
                  break
                case 128: // Note off
                  noteOff(note)
                  break
                case 176: // Control change
                  if (note === 7) {
                    // Volume
                    setVolume(Math.round((100 * velocity) / 127))
                  }
                  break
              }
            }
          }
        }

        setMidiDevices(devices)
      }
    } catch (error) {
      console.error("MIDI initialization failed:", error)
    }
  }, [noteOn, noteOff, selectedMidiDevice])

  // Initialize reverb
  const initializeReverb = useCallback(async () => {
    if (!audioContext) return

    try {
      const response = await fetch("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reverb-FcSErFWUogkHpdaMQGI1vBWDMjg3UC.wav")
      const arrayBuffer = await response.arrayBuffer()
      const reverbBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const convolver = audioContext.createConvolver()
      convolver.buffer = reverbBuffer
      convolver.connect(audioContext.destination)

      setReverbNode(convolver)
    } catch (error) {
      console.error("Reverb initialization failed:", error)
    }
  }, [audioContext])

  // Update reverb connection
  useEffect(() => {
    if (!gainNode || !reverbNode) return

    try {
      if (useReverb) {
        gainNode.connect(reverbNode)
      } else {
        gainNode.disconnect(reverbNode)
      }
    } catch (error) {
      // Ignore disconnect errors
    }
  }, [useReverb, gainNode, reverbNode])

  // Update volume
  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = volume / 100
    }
    localStorage.setItem("webharmonium.volume", volume.toString())
  }, [volume, gainNode])

  // Update other settings in localStorage
  useEffect(() => {
    localStorage.setItem("webharmonium.useReverb", useReverb.toString())
  }, [useReverb])

  useEffect(() => {
    localStorage.setItem("webharmonium.transpose", transpose.toString())
  }, [transpose])

  useEffect(() => {
    localStorage.setItem("webharmonium.octave", octave.toString())
  }, [octave])

  useEffect(() => {
    localStorage.setItem("webharmonium.stack", additionalReeds.toString())
  }, [additionalReeds])

  // Load settings from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("webharmonium.volume")
    const savedReverb = localStorage.getItem("webharmonium.useReverb")
    const savedTranspose = localStorage.getItem("webharmonium.transpose")
    const savedOctave = localStorage.getItem("webharmonium.octave")
    const savedStack = localStorage.getItem("webharmonium.stack")

    if (savedVolume) setVolume(Number.parseInt(savedVolume))
    if (savedReverb) setUseReverb(savedReverb === "true")
    if (savedTranspose) setTranspose(Number.parseInt(savedTranspose))
    if (savedOctave) setOctave(Number.parseInt(savedOctave))
    if (savedStack) setAdditionalReeds(Number.parseInt(savedStack))
  }, [])

  // Update key maps when transpose changes
  useEffect(() => {
    initializeKeyMaps()
    initializeSourceNodes()
  }, [transpose, initializeKeyMaps, initializeSourceNodes])

  // Initialize everything on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Create audio context
        const context = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(context)

        // Create gain node
        const gain = context.createGain()
        gain.gain.value = volume / 100
        gain.connect(context.destination)
        setGainNode(gain)

        // Load harmonium sample
        const response = await fetch("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/harmonium-kannan-orig-kF5yzA3bjSGnjxSd0m7ODzg3ijgAXl.wav")
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await context.decodeAudioData(arrayBuffer)
        setAudioBuffer(buffer)

        // Initialize key maps
        initializeKeyMaps()

        setIsLoading(false)
      } catch (error) {
        console.error("Initialization failed:", error)
        setIsLoading(false)
      }
    }

    initialize()
  }, [volume, initializeKeyMaps])

  // Initialize MIDI and reverb after audio context is ready
  useEffect(() => {
    if (audioContext && !isLoading) {
      initializeMIDI()
      initializeReverb()
    }
  }, [audioContext, isLoading, initializeMIDI, initializeReverb])

  // Initialize source nodes after audio buffer is loaded
  useEffect(() => {
    if (audioBuffer && gainNode) {
      initializeSourceNodes()
    }
  }, [audioBuffer, gainNode, initializeSourceNodes])

  const getRootNoteName = () => {
    const semitone = transpose >= 0 ? transpose % 12 : transpose + 12
    return baseKeyNames[semitone]
  }

  const handleKeyPress = (key: string, isPressed: boolean) => {
    const note = keyboardMap[key]
    if (note) {
      if (isPressed) {
        noteOn(note)
      } else {
        noteOff(note)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Web Harmonium...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Piano className="h-8 w-8 text-blue-600" />
            Web Harmonium
          </h1>
          <p className="text-gray-600">Play using your keyboard or connect a MIDI device</p>
        </div>

        {/* Virtual Keyboard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Virtual Keyboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative">
                <svg width="800" height="120" className="border rounded-lg bg-white shadow-inner">
                  {keyboardLayout.map((keyInfo, index) => {
                    const isWhite = keyInfo.type === "white"
                    const x = index * (isWhite ? 35 : 0) + (isWhite ? 0 : -10)
                    const width = isWhite ? 34 : 20
                    const height = isWhite ? 100 : 60

                    return (
                      <g key={keyInfo.key}>
                        <rect
                          x={x}
                          y={0}
                          width={width}
                          height={height}
                          fill={isWhite ? "white" : "black"}
                          stroke="#ccc"
                          strokeWidth="1"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onMouseDown={() => handleKeyPress(keyInfo.key, true)}
                          onMouseUp={() => handleKeyPress(keyInfo.key, false)}
                          onMouseLeave={() => handleKeyPress(keyInfo.key, false)}
                        />
                        <text
                          x={x + width / 2}
                          y={isWhite ? 80 : 40}
                          textAnchor="middle"
                          fill={isWhite ? "black" : "white"}
                          fontSize="12"
                          fontFamily="monospace"
                        >
                          {keyInfo.label}
                        </text>
                        {isWhite && (
                          <text
                            x={x + width / 2}
                            y={95}
                            textAnchor="middle"
                            fill="blue"
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {keyInfo.note}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Volume Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Volume: {volume}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Reverb Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reverb</span>
                <Switch checked={useReverb} onCheckedChange={setUseReverb} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{useReverb ? "Reverb enabled" : "Reverb disabled"}</p>
            </CardContent>
          </Card>

          {/* MIDI Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                MIDI Keyboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMidiDevice} onValueChange={setSelectedMidiDevice}>
                <SelectTrigger>
                  <SelectValue placeholder={midiSupported ? "Select MIDI device" : "MIDI not supported"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No device selected</SelectItem> {/* Updated value prop */}
                  {midiDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name} by {device.manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Transpose Control */}
          <Card>
            <CardHeader>
              <CardTitle>Transpose - {getRootNoteName()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTranspose(Math.max(-11, transpose - 1))}
                  disabled={transpose <= -11}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-mono">{transpose}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTranspose(Math.min(11, transpose + 1))}
                  disabled={transpose >= 11}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Octave Control */}
          <Card>
            <CardHeader>
              <CardTitle>Current Octave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOctave(Math.max(0, octave - 1))}
                  disabled={octave <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-mono">{octave}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOctave(Math.min(6, octave + 1))}
                  disabled={octave >= 6}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Reeds Control */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Reeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdditionalReeds(Math.max(0, additionalReeds - 1))}
                  disabled={additionalReeds <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-mono">{additionalReeds}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdditionalReeds(Math.min(6 - octave, additionalReeds + 1))}
                  disabled={octave + additionalReeds >= 6}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Keyboard Controls:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Use keys ` 1 q 2 w e 4 r 5 t y 7 u 8 i 9 o p - [ = ] \ to play notes</li>
                  <li>• White keys: ` q w e r t y u i o p [ ] \</li>
                  <li>• Black keys: 1 2 4 5 7 8 9 - =</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Connect MIDI keyboard for better experience</li>
                  <li>• Adjust volume, reverb, and transpose settings</li>
                  <li>• Change octaves and add additional reed layers</li>
                  <li>• Settings are automatically saved</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
