
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface ScratchCard {
  id: string;
  pin: string;
  serial_number: string;
  amount: number;
  price: number;
  status: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  revenue_generated: number;
}

const ScratchCards = () => {
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(100);
  const [amount, setAmount] = useState<number>(1000);
  const [showPins, setShowPins] = useState<boolean>(false);
  const { toast } = useToast();

  const { data: scratchCards, loading, refetch } = useSupabaseQuery<ScratchCard[]>(
    async () => {
      const { data, error } = await supabase
        .from('scratch_cards')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    []
  );

  const generatePin = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const generateSerialNumber = () => {
    return `SC${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const validateInputs = () => {
    if (quantity <= 0 || quantity > 1000) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be between 1 and 1000.",
        variant: "destructive",
      });
      return false;
    }

    if (price <= 0 || price > 10000) {
      toast({
        title: "Invalid Price",
        description: "Price must be between 1 and 10,000.",
        variant: "destructive",
      });
      return false;
    }

    if (amount <= 0 || amount > 100000) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be between 1 and 100,000.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const generateScratchCards = async () => {
    if (!validateInputs()) return;

    try {
      const cards = Array.from({ length: quantity }, () => ({
        pin: generatePin(),
        serial_number: generateSerialNumber(),
        amount: amount,
        price: price,
        status: 'Active',
        revenue_generated: 0
      }));

      const { error } = await supabase
        .from('scratch_cards')
        .insert(cards);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Generated ${quantity} scratch cards successfully.`,
      });

      refetch();
    } catch (error: any) {
      console.error('Error generating scratch cards:', error);
      toast({
        title: "Error",
        description: "Failed to generate scratch cards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const maskPin = (pin: string) => {
    if (showPins) return pin;
    return pin.substring(0, 2) + '****' + pin.substring(pin.length - 2);
  };

  const cards = scratchCards || [];
  const totalCards = cards.length;
  const usedCards = cards.filter(card => card.status === 'Used').length;
  const totalRevenue = cards.reduce((sum, card) => sum + card.revenue_generated, 0);
  const activeCards = totalCards - usedCards;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading scratch cards...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Scratch Cards</h1>
            <p className="text-gray-600">Generate and manage result access cards</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowPins(!showPins)}
          variant="outline"
          className="flex items-center"
        >
          {showPins ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showPins ? 'Hide PINs' : 'Show PINs'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{usedCards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate Cards Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Scratch Cards</CardTitle>
            <CardDescription>
              Create new scratch cards for student result access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity (1-1000)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="price">Price per Card (₦)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                max="10000"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="amount">Card Value (₦)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              />
            </div>
            <Button onClick={generateScratchCards} className="w-full">
              Generate Cards
            </Button>
            <div className="text-sm text-gray-600">
              <p>Expected Revenue: ₦{(quantity * price).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Cards Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generated Cards</CardTitle>
            <CardDescription>
              All scratch cards with their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PIN</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.length > 0 ? (
                    cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono">
                          {maskPin(card.pin)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {card.serial_number}
                        </TableCell>
                        <TableCell>₦{card.amount.toLocaleString()}</TableCell>
                        <TableCell>₦{card.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={card.status === 'Active' ? 'default' : 'secondary'}
                          >
                            {card.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {card.used_by || '-'}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          ₦{card.revenue_generated.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No scratch cards generated yet. Create some cards to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScratchCards;
