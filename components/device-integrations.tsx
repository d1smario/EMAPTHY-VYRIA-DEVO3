"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link2, Check, X, RefreshCw, Upload, AlertCircle, Clock } from "lucide-react"
import { getClient } from "@/lib/supabase/client"

interface DeviceIntegrationsProps {
  athleteId: string | undefined
}

interface DeviceProvider {
  id: string
  name: string
  description: string
  icon: string
  color: string
  features: string[]
  authType: "oauth" | "api_key" | "manual"
  status: "connected" | "disconnected" | "pending"
  lastSync?: string
}

const DEVICE_PROVIDERS: DeviceProvider[] = [
  {
    id: "garmin",
    name: "Garmin Connect",
    description: "Sync activities, health metrics, and wearable data",
    icon: "⌚",
    color: "#007CC3",
    features: ["Activities", "HR", "HRV", "Sleep", "Body Battery"],
    authType: "oauth",
    status: "disconnected",
  },
  {
    id: "strava",
    name: "Strava",
    description: "Import rides, runs, and activities",
    icon: "🏃",
    color: "#FC4C02",
    features: ["Activities", "Segments", "Routes"],
    authType: "oauth",
    status: "disconnected",
  },
  {
    id: "whoop",
    name: "WHOOP",
    description: "Recovery, strain, and sleep data",
    icon: "💪",
    color: "#00B388",
    features: ["Recovery", "Strain", "Sleep", "HRV"],
    authType: "oauth",
    status: "disconnected",
  },
  {
    id: "core",
    name: "CORE Body Temperature",
    description: "Real-time core temperature monitoring",
    icon: "🌡️",
    color: "#FF6B35",
    features: ["Core Temp", "Skin Temp", "Heat Strain"],
    authType: "api_key",
    status: "disconnected",
  },
  {
    id: "moxy",
    name: "Moxy Monitor",
    description: "Muscle oxygen saturation (SmO2) data",
    icon: "🩸",
    color: "#E63946",
    features: ["SmO2", "THb", "Muscle O2"],
    authType: "manual",
    status: "disconnected",
  },
  {
    id: "abbott",
    name: "Abbott Libre",
    description: "Continuous glucose monitoring data",
    icon: "📊",
    color: "#00A3E0",
    features: ["Glucose", "Time in Range", "Trends"],
    authType: "api_key",
    status: "disconnected",
  },
  {
    id: "trainingpeaks",
    name: "TrainingPeaks",
    description: "Workouts, plans, and performance data",
    icon: "📈",
    color: "#1A1A1A",
    features: ["Workouts", "TSS", "CTL/ATL"],
    authType: "oauth",
    status: "disconnected",
  },
  {
    id: "intervals",
    name: "Intervals.icu",
    description: "Advanced analytics and planning",
    icon: "📉",
    color: "#6366F1",
    features: ["Activities", "Fitness", "Icu TSS"],
    authType: "api_key",
    status: "disconnected",
  },
]

export function DeviceIntegrations({ athleteId }: DeviceIntegrationsProps) {
  const [providers, setProviders] = useState<DeviceProvider[]>(DEVICE_PROVIDERS)
  const [loading, setLoading] = useState<string | null>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [showApiKeyModal, setShowApiKeyModal] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    if (athleteId) {
      loadConnections()
    }
  }, [athleteId])

  const loadConnections = async () => {
    const supabase = getClient()

    try {
      const { data } = await supabase.from("device_connections").select("*").eq("user_id", athleteId)

      if (data) {
        setConnections(data)

        setProviders((prev) =>
          prev.map((p) => {
            const connection = data.find((c) => c.provider === p.id)
            return {
              ...p,
              status: connection?.is_active ? "connected" : "disconnected",
              lastSync: connection?.last_sync_at,
            }
          }),
        )
      }
    } catch (error) {
      console.error("Error loading connections:", error)
    }
  }

  const handleConnect = async (provider: DeviceProvider) => {
    setLoading(provider.id)

    if (provider.authType === "oauth") {
      setTimeout(() => {
        alert(
          `OAuth flow for ${provider.name} would open here.\nThis requires backend API routes to handle the OAuth callback.`,
        )
        setLoading(null)
      }, 1000)
    } else if (provider.authType === "api_key") {
      setShowApiKeyModal(provider.id)
      setLoading(null)
    } else {
      alert(`${provider.name} requires manual file upload.\nSupported formats: FIT, TCX, GPX`)
      setLoading(null)
    }
  }

  const handleSaveApiKey = async (providerId: string) => {
    if (!apiKey.trim()) return

    setLoading(providerId)
    const supabase = getClient()

    try {
      const { error } = await supabase.from("device_connections").upsert(
        {
          user_id: athleteId,
          provider: providerId,
          access_token: apiKey,
          is_active: true,
          last_sync_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,provider",
        },
      )

      if (error) throw error

      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, status: "connected", lastSync: new Date().toISOString() } : p)),
      )
      setShowApiKeyModal(null)
      setApiKey("")
    } catch (error) {
      console.error("Error saving API key:", error)
      alert("Error saving API key. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleDisconnect = async (providerId: string) => {
    setLoading(providerId)
    const supabase = getClient()

    try {
      const { error } = await supabase
        .from("device_connections")
        .update({ is_active: false })
        .eq("user_id", athleteId)
        .eq("provider", providerId)

      if (error) throw error

      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "disconnected" } : p)))
    } catch (error) {
      console.error("Error disconnecting:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleSync = async (providerId: string) => {
    setLoading(providerId)

    setTimeout(() => {
      setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, lastSync: new Date().toISOString() } : p)))
      setLoading(null)
    }, 2000)
  }

  const connectedCount = providers.filter((p) => p.status === "connected").length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Device Integrations</h3>
          <p className="text-sm text-muted-foreground">Connect your devices and platforms to sync training data</p>
        </div>
        <Badge variant="outline">
          {connectedCount} of {providers.length} connected
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Connect your devices to automatically import activities, health metrics, and sensor data. All data is securely
          stored and only accessible to you.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} className={provider.status === "connected" ? "border-green-500/50" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2 rounded-lg" style={{ backgroundColor: `${provider.color}20` }}>
                    {provider.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {provider.name}
                      {provider.status === "connected" && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          Connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">{provider.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {provider.features.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {provider.status === "connected" && provider.lastSync && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last sync: {new Date(provider.lastSync).toLocaleString("it-IT")}
                </div>
              )}

              <div className="flex gap-2">
                {provider.status === "connected" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleSync(provider.id)}
                      disabled={loading === provider.id}
                    >
                      {loading === provider.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Sync Now
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={loading === provider.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleConnect(provider)}
                    disabled={loading === provider.id}
                  >
                    {loading === provider.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" />
                    )}
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Manual Upload
          </CardTitle>
          <CardDescription>Upload activity files directly from your computer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">Supported formats: FIT, TCX, GPX, JSON</p>
            <Button variant="outline" className="mt-4 bg-transparent">
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Enter API Key</CardTitle>
              <CardDescription>
                Enter your API key for {providers.find((p) => p.id === showApiKeyModal)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowApiKeyModal(null)
                    setApiKey("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSaveApiKey(showApiKeyModal)}
                  disabled={!apiKey.trim() || loading === showApiKeyModal}
                >
                  {loading === showApiKeyModal ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
