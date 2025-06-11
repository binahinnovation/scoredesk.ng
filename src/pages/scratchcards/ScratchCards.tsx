
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Key, Plus, Download, RefreshCw } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

interface ScratchCard {
  id: string;
  pin: string;
  serial_number: string;
  amount: number;
  price: number;
  status: string;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
}

interface Term {
  id: string;
  name: string;
  is_current: boolean;
}

const ScratchCards = () => {
  const [quantity, setQuantity] = useState<number>(10);
  const [amount, setAmount] = useState<number>(1000);
  const [price, setPrice] = useState<number>(100);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  // Fetch terms
  const { data: terms, loading: termsLoading } = useSupabaseQuery<Term[]>(
    async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    []
  );

  // Fetch scratch cards
  const { data: scratchCards, loading: cardsLoading, refetch } = useSupabaseQuery<ScratchCard[]>(
    async () => {
      const { data, error } = await supabase
        .from('scratch_cards')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    []
  );

  // Set current term as default
  React.useEffect(() => {
    if (terms && terms.length > 0 && !selectedTerm) {
      const currentTerm = terms.find(term => term.is_current);
      if (currentTerm) {
        setSelectedTerm(currentTerm.id);
      }
    }
  }, [terms, selectedTerm]);

  const generatePin = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateSerialNumber = () => {
    const prefix = 'SD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const handleGenerateCards = async () => {
    if (!selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select a term for the scratch cards.",
        variant: "destructive",
      });
      return;
    }

    if (quantity < 1 || quantity > 1000) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a quantity between 1 and 1000.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const cardsToGenerate = [];
      
      for (let i = 0; i < quantity; i++) {
        cardsToGenerate.push({
          pin: generatePin(),
          serial_number: generateSerialNumber(),
          amount: amount,
          price: price,
          term_id: selectedTerm,
          status: 'Active'
        });
      }

      const { error } = await supabase
        .from('scratch_cards')
        .insert(cardsToGenerate);

      if (error) throw error;

      toast({
        title: "Cards Generated",
        description: `Successfully generated ${quantity} scratch cards.`,
      });

      refetch();
      setQuantity(10);
    } catch (error: any) {
      console.error('Error generating scratch cards:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate scratch cards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCards = () => {
    if (!scratchCards || scratchCards.length === 0) {
      toast({
        title: "No Cards",
        description: "No scratch cards available to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Serial Number', 'PIN', 'Amount', 'Price', 'Status', 'Created Date'].join(','),
      ...scratchCards.map(card => [
        card.serial_number,
        card.pin,
        card.amount,
        card.price,
        card.status,
        new Date(card.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scratch_cards_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Scratch cards exported successfully.",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Used':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Key className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Scratch Cards</h1>
            <p className="text-gray-600">Generate and manage student result access cards</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCards}>
            <Download className="h-4 w-4 mr-2" />
            Export Cards
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate New Cards</CardTitle>
            <CardDescription>Create scratch cards for student result access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="term">Select Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose term" />
                </SelectTrigger>
                <SelectContent>
                  {terms?.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name} {term.is_current && <Badge variant="secondary" className="ml-2">Current</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label htmlFor="amount">Card Value (₦)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter card value"
              />
            </div>

            <div>
              <Label htmlFor="price">Selling Price (₦)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                placeholder="Enter selling price"
              />
            </div>

            <Button 
              onClick={handleGenerateCards} 
              disabled={generating || !selectedTerm}
              className="w-full"
            >
              {generating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Cards
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Overview of scratch card usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {scratchCards?.filter(card => card.status === 'Active').length || 0}
                </div>
                <div className="text-sm text-gray-600">Active Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scratchCards?.filter(card => card.status === 'Used').length || 0}
                </div>
                <div className="text-sm text-gray-600">Used Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {scratchCards?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ₦{scratchCards?.reduce((sum, card) => sum + (card.price || 0), 0).toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest card usage activity</CardDescription>
          </CardHeader>
          <CardContent>
            {scratchCards?.filter(card => card.used_at).slice(0, 5).map((card) => (
              <div key={card.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{card.pin}</div>
                  <div className="text-sm text-gray-600">Used by: {card.used_by}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {card.used_at ? new Date(card.used_at).toLocaleDateString() : ''}
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Scratch Cards</CardTitle>
          <CardDescription>Manage and view all generated scratch cards</CardDescription>
        </CardHeader>
        <CardContent>
          {cardsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-2">Loading scratch cards...</span>
            </div>
          ) : scratchCards && scratchCards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>PIN</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Used Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scratchCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.serial_number}</TableCell>
                    <TableCell className="font-mono">{card.pin}</TableCell>
                    <TableCell>₦{card.amount.toLocaleString()}</TableCell>
                    <TableCell>₦{card.price?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(card.status)}>
                        {card.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(card.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{card.used_by || '-'}</TableCell>
                    <TableCell>
                      {card.used_at ? new Date(card.used_at).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Scratch Cards</h3>
              <p>Generate your first batch of scratch cards to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScratchCards;
