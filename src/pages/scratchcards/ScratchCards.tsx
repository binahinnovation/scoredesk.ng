
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CreditCard, Plus, Eye, RefreshCw, AlertCircle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScratchCard {
  id: string;
  serial_number: string;
  pin: string;
  amount: number;
  price: number;
  revenue_generated: number;
  status: string;
  term_id: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

interface Term {
  id: string;
  name: string;
  created_at: string;
}

const generateSerialNumber = () => {
  const prefix = 'SN';
  const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${randomChars}`;
};

const generatePIN = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const ScratchCards = () => {
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(100);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [cardToView, setCardToView] = useState<ScratchCard | null>(null);
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  const { toast } = useToast();

  console.log("ScratchCards component mounted");

  const { 
    data: scratchCardsData, 
    loading: loadingCards, 
    error: cardsError, 
    refetch: refetchCards 
  } = useSupabaseQuery<ScratchCard[]>(
    async () => {
      console.log("Fetching scratch cards...");
      try {
        const { data, error } = await supabase
          .from('scratch_cards')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log("Scratch cards query result:", { data, error });
        
        if (error) {
          console.error("Scratch cards query error:", error);
          throw new Error(error.message);
        }
        
        return { data: data || [], error: null };
      } catch (err) {
        console.error("Scratch cards fetch error:", err);
        return { data: null, error: err };
      }
    },
    []
  );

  const { 
    data: termsData, 
    loading: loadingTerms, 
    error: termsError 
  } = useSupabaseQuery<Term[]>(
    async () => {
      console.log("Fetching terms...");
      try {
        const { data, error } = await supabase
          .from('terms')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log("Terms query result:", { data, error });
        
        if (error) {
          console.error("Terms query error:", error);
          throw new Error(error.message);
        }
        
        return { data: data || [], error: null };
      } catch (err) {
        console.error("Terms fetch error:", err);
        return { data: null, error: err };
      }
    },
    []
  );

  console.log("Component state:", {
    scratchCardsData,
    loadingCards,
    cardsError,
    termsData,
    loadingTerms,
    termsError
  });

  const scratchCards = scratchCardsData || [];
  const terms = termsData || [];

  // Calculate statistics
  const totalCards = scratchCards.length;
  const usedCards = scratchCards.filter(card => card.status === 'Used').length;
  const activeCards = totalCards - usedCards;
  const totalRevenue = scratchCards.reduce((sum, card) => sum + (card.revenue_generated || 0), 0);

  const generateScratchCards = async () => {
    if (!selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select a term to generate scratch cards.",
        variant: "destructive",
      });
      return;
    }

    const newCards = Array.from({ length: quantity }, () => ({
      serial_number: generateSerialNumber(),
      pin: generatePIN(),
      amount: 100,
      price: price,
      revenue_generated: 0,
      status: 'Active',
      term_id: selectedTerm,
    }));

    try {
      const { error } = await supabase
        .from('scratch_cards')
        .insert(newCards);

      if (error) {
        console.error("Error creating scratch cards:", error);
        toast({
          title: "Error",
          description: "Failed to generate scratch cards. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully generated ${quantity} scratch cards at ₦${price} each.`,
        });
        refetchCards();
      }
    } catch (error) {
      console.error("Error creating scratch cards:", error);
      toast({
        title: "Error",
        description: "Failed to generate scratch cards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCardView = (card: ScratchCard) => {
    setCardToView(card);
    setShowCardDetails(true);
  };

  const loading = loadingCards || loadingTerms;
  const error = cardsError || termsError;

  console.log("Render state:", { loading, error, totalCards, scratchCardsLength: scratchCards.length });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Scratch Card Management</h1>
            <p className="text-gray-600">Generate and manage result access scratch cards</p>
          </div>
        </div>
        <Button onClick={refetchCards} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Cards</p>
                <div className="text-2xl font-bold">{totalCards}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-red-500 rounded" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Used Cards</p>
                <div className="text-2xl font-bold">{usedCards}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Cards</p>
                <div className="text-2xl font-bold">{activeCards}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load data: {error instanceof Error ? error.message : String(error)}
            <Button onClick={refetchCards} variant="outline" size="sm" className="ml-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate Cards Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Generate Cards
            </CardTitle>
            <CardDescription>
              Create new scratch cards for student result access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity to Generate</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="price">Price per Card (₦)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 100)}
              />
            </div>
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateScratchCards} className="w-full">
              Generate Scratch Cards
            </Button>
            <div className="text-sm text-muted-foreground">
              Total cost: ₦{(quantity * price).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Cards List Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generated Scratch Cards</CardTitle>
            <CardDescription>
              View and manage all scratch cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-2">Loading scratch cards...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Error loading scratch cards</p>
                <Button onClick={refetchCards} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>PIN</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scratchCards.length > 0 ? (
                      scratchCards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell>{card.serial_number}</TableCell>
                          <TableCell className="font-mono">{card.pin}</TableCell>
                          <TableCell>₦{card.price || 100}</TableCell>
                          <TableCell>
                            {card.status === 'Used' ? (
                              <Badge variant="destructive">Used</Badge>
                            ) : (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>₦{card.revenue_generated || 0}</TableCell>
                          <TableCell>
                            {terms.find(term => term.id === card.term_id)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleCardView(card)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No scratch cards found. Generate some cards to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card Details Dialog */}
      <Dialog open={showCardDetails} onOpenChange={setShowCardDetails}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scratch Card Details</DialogTitle>
            <DialogDescription>
              View detailed information about the scratch card.
            </DialogDescription>
          </DialogHeader>
          {cardToView && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Serial Number</Label>
                <Input value={cardToView.serial_number} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">PIN</Label>
                <Input value={cardToView.pin} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Price</Label>
                <Input value={`₦${cardToView.price || 100}`} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Revenue</Label>
                <Input value={`₦${cardToView.revenue_generated || 0}`} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Input value={cardToView.status} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Used By</Label>
                <Input value={cardToView.used_by || 'N/A'} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Used At</Label>
                <Input value={cardToView.used_at ? new Date(cardToView.used_at).toLocaleString() : 'N/A'} className="col-span-3" readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScratchCards;
