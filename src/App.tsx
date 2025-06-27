import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, Users, DollarSign, MapPin, AlertTriangle, Plus, Wifi, WifiOff,
  Mic, MicOff, Camera, Sparkles, Brain, Zap, Globe, CloudRain, Sun
} from 'lucide-react';

// AI-powered activity recommendations
const generateAIRecommendations = (familyMembers, destination, budget) => {
  const avgAge = familyMembers.reduce((sum, member) => sum + member.age, 0) / familyMembers.length;
  const hasKids = familyMembers.some(member => member.age < 18);
  const hasToddlers = familyMembers.some(member => member.age < 5);
  
  const recommendations = [
    {
      id: 'ai-1',
      name: hasKids ? 'Interactive Science Museum' : 'Art Gallery Walking Tour',
      description: hasKids 
        ? 'Hands-on exhibits perfect for curious minds and family bonding'
        : 'Curated art experience with local cultural insights',
      ageRange: { min: hasToddlers ? 2 : 8, max: 99 },
      cost: Math.round(budget * 0.05),
      duration: hasKids ? 3 : 2,
      category: hasKids ? 'Educational' : 'Cultural',
      rating: 4.7,
      isKidFriendly: hasKids,
      location: destination,
      votes: {},
      aiGenerated: true,
      confidence: 0.85
    },
    {
      id: 'ai-2', 
      name: avgAge > 40 ? 'Scenic Food Tour' : 'Adventure Park',
      description: avgAge > 40
        ? 'Relaxed culinary journey through local specialties'
        : 'High-energy activities and thrilling experiences',
      ageRange: { min: avgAge > 40 ? 12 : 8, max: 99 },
      cost: Math.round(budget * 0.08),
      duration: 4,
      category: avgAge > 40 ? 'Food & Drink' : 'Adventure',
      rating: 4.6,
      isKidFriendly: hasKids,
      location: destination,
      votes: {},
      aiGenerated: true,
      confidence: 0.78
    }
  ];
  
  return recommendations;
};

// AI budget predictions
const generateBudgetInsights = (familyMembers, destination, duration) => {
  const basePerPerson = 150;
  const kidDiscount = 0.7;
  const destinationMultiplier = destination.toLowerCase().includes('disney') ? 1.5 : 1.0;
  
  const adultCount = familyMembers.filter(m => m.age >= 18).length;
  const kidCount = familyMembers.filter(m => m.age < 18).length;
  
  const estimatedDaily = (adultCount * basePerPerson + kidCount * basePerPerson * kidDiscount) * destinationMultiplier;
  const estimatedTotal = estimatedDaily * (duration || 5);
  
  return {
    dailyEstimate: Math.round(estimatedDaily),
    totalEstimate: Math.round(estimatedTotal),
    breakdown: {
      accommodation: Math.round(estimatedTotal * 0.4),
      food: Math.round(estimatedTotal * 0.3),
      activities: Math.round(estimatedTotal * 0.2),
      transport: Math.round(estimatedTotal * 0.1)
    },
    confidence: 0.82
  };
};

// AI packing suggestions
const generatePackingList = (familyMembers, destination, startDate, duration) => {
  const items = [];
  const weather = getWeatherPrediction(destination, startDate);
  
  familyMembers.forEach(member => {
    // Basic items for everyone
    items.push(
      { id: `${member.id}-clothes`, item: `${duration} days of clothes`, category: 'Clothing', isChecked: false, forMember: member.name },
      { id: `${member.id}-underwear`, item: 'Underwear & socks', category: 'Clothing', isChecked: false, forMember: member.name },
      { id: `${member.id}-toiletries`, item: 'Toiletries', category: 'Personal Care', isChecked: false, forMember: member.name }
    );
    
    // Age-specific items
    if (member.age < 5) {
      items.push(
        { id: `${member.id}-diapers`, item: 'Diapers/Pull-ups', category: 'Baby Care', isChecked: false, forMember: member.name },
        { id: `${member.id}-snacks`, item: 'Favorite snacks', category: 'Food', isChecked: false, forMember: member.name }
      );
    }
    
    if (member.age < 12) {
      items.push(
        { id: `${member.id}-entertainment`, item: 'Travel entertainment', category: 'Entertainment', isChecked: false, forMember: member.name }
      );
    }
    
    // Medical needs
    if (member.medicalNeeds?.length > 0) {
      items.push(
        { id: `${member.id}-meds`, item: 'Medications', category: 'Medical', isChecked: false, forMember: member.name }
      );
    }
    
    // Weather-specific items
    if (weather.temp < 60) {
      items.push(
        { id: `${member.id}-jacket`, item: 'Warm jacket', category: 'Clothing', isChecked: false, forMember: member.name }
      );
    }
    
    if (weather.rain > 0.3) {
      items.push(
        { id: `${member.id}-rain`, item: 'Rain jacket/umbrella', category: 'Weather', isChecked: false, forMember: member.name }
      );
    }
  });
  
  return items;
};

// Mock weather prediction
const getWeatherPrediction = (destination, date) => {
  // Simplified weather prediction based on destination
  const weatherMap = {
    'florida': { temp: 78, rain: 0.4, sunny: 0.7 },
    'california': { temp: 72, rain: 0.1, sunny: 0.9 },
    'new york': { temp: 65, rain: 0.3, sunny: 0.6 },
    'default': { temp: 70, rain: 0.2, sunny: 0.7 }
  };
  
  const key = Object.keys(weatherMap).find(k => destination.toLowerCase().includes(k)) || 'default';
  return weatherMap[key];
};

export default function MobileAITravelApp() {
  const { toast } = useToast();
  const [trip, setTrip] = useState({
    id: '1',
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    familyMembers: [],
    activities: [],
    emergencyContacts: [],
    packingList: [],
    expenses: []
  });

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [budgetInsights, setBudgetInsights] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);

  // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // AI recommendations generation
  useEffect(() => {
    if (trip.familyMembers.length > 0 && trip.destination && trip.budget > 0) {
      const recommendations = generateAIRecommendations(trip.familyMembers, trip.destination, trip.budget);
      setAiRecommendations(recommendations);
      
      const insights = generateBudgetInsights(trip.familyMembers, trip.destination, getDuration());
      setBudgetInsights(insights);
      
      // Auto-generate packing list
      if (trip.startDate) {
        const packingItems = generatePackingList(trip.familyMembers, trip.destination, trip.startDate, getDuration());
        setTrip(prev => ({ ...prev, packingList: packingItems }));
      }
    }
  }, [trip.familyMembers, trip.destination, trip.budget, trip.startDate, trip.endDate]);

  // Voice input for expenses
  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Say your expense",
        });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        parseVoiceExpense(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input failed",
          description: "Please try again",
          variant: "destructive",
        });
      };

      recognition.start();
    } else {
      toast({
        title: "Voice input not supported",
        description: "This browser doesn't support voice input",
        variant: "destructive",
      });
    }
  };

  const parseVoiceExpense = (transcript) => {
    // Simple parsing - in real app, use more sophisticated NLP
    const amount = transcript.match(/\$?(\d+(?:\.\d{2})?)/);
    const description = transcript.replace(/\$?(\d+(?:\.\d{2})?)/, '').trim();
    
    if (amount && description) {
      const expense = {
        id: Date.now().toString(),
        description: description || 'Voice expense',
        amount: parseFloat(amount[1]),
        category: 'General',
        date: new Date().toISOString().split('T')[0],
        paidBy: trip.familyMembers[0]?.name || 'Unknown'
      };
      
      setTrip(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
      toast({
        title: "Expense added",
        description: `${description} - $${amount[1]}`,
      });
    } else {
      toast({
        title: "Could not parse expense",
        description: "Please try speaking more clearly",
        variant: "destructive",
      });
    }
  };

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({
          title: "App installed successfully!",
          description: "You can now use TripAI offline",
        });
      }
      setInstallPrompt(null);
    }
  };

  const addFamilyMember = () => {
    const member = {
      id: Date.now().toString(),
      name: `Family Member ${trip.familyMembers.length + 1}`,
      age: 25,
      dietaryRestrictions: [],
      medicalNeeds: [],
      preferences: []
    };
    setTrip(prev => ({ ...prev, familyMembers: [...prev.familyMembers, member] }));
  };

  const updateMember = (id, updates) => {
    setTrip(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => 
        member.id === id ? { ...member, ...updates } : member
      )
    }));
  };

  const getDuration = () => {
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = trip.budget - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FamMobile
                </h1>
                <p className="text-xs text-gray-500">AI Travel Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {installPrompt && (
                <Button 
                  size="sm" 
                  onClick={installApp}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Install
                </Button>
              )}
              
              <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-4 pb-20">
        <Tabs defaultValue="planning" className="space-y-6">
          {/* Mobile Tab Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t z-40">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-16">
              <TabsTrigger 
                value="planning" 
                className="flex flex-col gap-1 h-full data-[state=active]:bg-blue-100"
              >
                <Brain className="w-4 h-4" />
                <span className="text-xs">Plan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="flex flex-col gap-1 h-full data-[state=active]:bg-green-100"
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Budget</span>
              </TabsTrigger>
              <TabsTrigger 
                value="packing" 
                className="flex flex-col gap-1 h-full data-[state=active]:bg-purple-100"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs">Pack</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trip" 
                className="flex flex-col gap-1 h-full data-[state=active]:bg-orange-100"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Trip</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="planning" className="space-y-4">
            {/* Trip Details Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={trip.name}
                  onChange={(e) => setTrip(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Trip name..."
                  className="bg-white/60"
                />
                <Input
                  value={trip.destination}
                  onChange={(e) => setTrip(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Where are you going?"
                  className="bg-white/60"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={trip.startDate}
                    onChange={(e) => setTrip(prev => ({ ...prev, startDate: e.target.value }))}
                    className="bg-white/60"
                  />
                  <Input
                    type="date"
                    value={trip.endDate}
                    onChange={(e) => setTrip(prev => ({ ...prev, endDate: e.target.value }))}
                    className="bg-white/60"
                  />
                </div>
                <Input
                  type="number"
                  value={trip.budget}
                  onChange={(e) => setTrip(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  placeholder="Budget $"
                  className="bg-white/60"
                />
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Family ({trip.familyMembers.length})
                  </span>
                  <Button size="sm" onClick={addFamilyMember}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trip.familyMembers.map((member) => (
                  <div key={member.id} className="flex gap-2">
                    <Input
                      value={member.name}
                      onChange={(e) => updateMember(member.id, { name: e.target.value })}
                      placeholder="Name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={member.age}
                      onChange={(e) => updateMember(member.id, { age: parseInt(e.target.value) || 0 })}
                      placeholder="Age"
                      className="w-20"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            {aiRecommendations.length > 0 && (
              <Card className="border-gradient-to-r from-purple-200 to-pink-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiRecommendations.map((activity) => (
                    <div key={activity.id} className="p-3 bg-white/60 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>${activity.cost}</span>
                            <span>{activity.duration}h</span>
                            <span>Ages {activity.ageRange.min}+</span>
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">
                          {Math.round(activity.confidence * 100)}% match
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            {/* Budget Overview */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">${trip.budget}</div>
                    <div className="text-xs text-gray-500">Budget</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">${totalExpenses}</div>
                    <div className="text-xs text-gray-500">Spent</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${remainingBudget}
                    </div>
                    <div className="text-xs text-gray-500">Left</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Budget Insights */}
            {budgetInsights && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Budget Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Based on your family size and destination, I estimate ${budgetInsights.dailyEstimate}/day 
                      (${budgetInsights.totalEstimate} total)
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Hotels:</span>
                      <span>${budgetInsights.breakdown.accommodation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food:</span>
                      <span>${budgetInsights.breakdown.food}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Activities:</span>
                      <span>${budgetInsights.breakdown.activities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport:</span>
                      <span>${budgetInsights.breakdown.transport}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voice Expense Entry */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={startVoiceInput}
                  disabled={isListening}
                  className={`w-full h-12 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'}`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Add Expense by Voice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            {trip.expenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {trip.expenses.slice(-5).reverse().map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-gray-500">{expense.date}</div>
                      </div>
                      <div className="text-lg font-bold">${expense.amount}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="packing" className="space-y-4">
            {/* Packing Progress */}
            {trip.packingList.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Packing Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round((trip.packingList.filter(item => item.isChecked).length / trip.packingList.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {trip.packingList.filter(item => item.isChecked).length} of {trip.packingList.length} items packed
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Packing List by Category */}
            {trip.packingList.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(
                  trip.packingList.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            onChange={(e) => {
                              setTrip(prev => ({
                                ...prev,
                                packingList: prev.packingList.map(packItem =>
                                  packItem.id === item.id 
                                    ? { ...packItem, isChecked: e.target.checked }
                                    : packItem
                                )
                              }));
                            }}
                            className="w-5 h-5"
                          />
                          <div className={`flex-1 ${item.isChecked ? 'line-through text-gray-500' : ''}`}>
                            <div>{item.item}</div>
                            <div className="text-sm text-gray-500">for {item.forMember}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Add family members and trip details to generate your AI-powered packing list!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trip" className="space-y-4">
            {trip.name && trip.destination ? (
              <>
                {/* Trip Header */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardContent className="pt-6 text-center">
                    <h2 className="text-2xl font-bold">{trip.name}</h2>
                    <p className="text-blue-100 text-lg">{trip.destination}</p>
                    {trip.startDate && trip.endDate && (
                      <p className="text-sm text-blue-200 mt-2">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="text-center pt-6">
                      <div className="text-2xl font-bold text-blue-600">{trip.familyMembers.length}</div>
                      <div className="text-sm text-gray-600">Travelers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="text-center pt-6">
                      <div className="text-2xl font-bold text-green-600">${trip.budget}</div>
                      <div className="text-sm text-gray-600">Budget</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weather Preview */}
                {trip.destination && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sun className="w-5 h-5" />
                        Weather Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const weather = getWeatherPrediction(trip.destination, trip.startDate);
                        return (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {weather.sunny > 0.7 ? <Sun className="w-8 h-8 text-yellow-500" /> : <CloudRain className="w-8 h-8 text-gray-500" />}
                              <div>
                                <div className="text-2xl font-bold">{weather.temp}°F</div>
                                <div className="text-sm text-gray-600">
                                  {weather.rain > 0.3 ? 'Chance of rain' : 'Mostly sunny'}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              AI Prediction
                            </Badge>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Family Members */}
                {trip.familyMembers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Travel Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {trip.familyMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">{member.name}</span>
                            <Badge variant="outline">{member.age} years old</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Planning Your Trip</h3>
                  <p className="text-gray-500 mb-6">
                    Fill out your trip details to unlock AI-powered recommendations and features!
                  </p>
                  <Button 
                    onClick={() => {
                      const planningTab = document.querySelector('[value="planning"]');
                      planningTab?.click();
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Start Planning
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
