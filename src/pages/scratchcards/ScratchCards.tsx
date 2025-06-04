import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CreditCard, Plus, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScratchCard {
  id: string;
  serial_number: string;
  amount: number;
  is_used: boolean;
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

interface CardDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  card: ScratchCard | null;
}

const CardDetailsDialog: React.FC<CardDetailsDialogProps> = ({ open, setOpen, card }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scratch Card Details</DialogTitle>
          <DialogDescription>
            View detailed information about the scratch card.
          </DialogDescription>
        </DialogHeader>
        {card ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serialNumber" className="text-right">
                Serial Number
              </Label>
              <Input type="text" id="serialNumber" value={card.serial_number} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input type="text" id="amount" value={card.amount.toString()} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Input type="text" id="status" value={card.is_used ? 'Used' : 'Unused'} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">
                Term ID
              </Label>
              <Input type="text" id="term" value={card.term_id} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usedBy" className="text-right">
                Used By
              </Label>
              <Input type="text" id="usedBy" value={card.used_by || 'N/A'} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usedAt" className="text-right">
                Used At
              </Label>
              <Input type="text" id="usedAt" value={card.used_at || 'N/A'} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createdAt" className="text-right">
                Created At
              </Label>
              <Input type="text" id="createdAt" value={card.created_at} className="col-span-3" readOnly />
            </div>
          </div>
        ) : (
          <p>No card details available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

const generateSerialNumber = () => {
  const prefix = 'SN';
  const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${randomChars}`;
};

const ScratchCards = () => {
  const [amount, setAmount] = useState<number>(10);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [cardToView, setCardToView] = useState<ScratchCard | null>(null);
  const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  const { toast } = useToast();

  // Use the improved query hook for better loading handling
  const { 
    data: scratchCards, 
    loading: loadingCards, 
    error: cardsError, 
    refetch: refetchCards 
  } = useSupabaseQuery(
    () => supabase.from('scratch_cards').select('*').order('created_at', { ascending: false }),
    []
  );

  const { 
    data: terms, 
    loading: loadingTerms, 
    error: termsError 
  } = useSupabaseQuery(
    () => supabase.from('terms').select('*').order('created_at', { ascending: false }),
    []
  );

  const generateScratchCards = async () => {
    if (!selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select a term to generate scratch cards.",
        variant: "destructive",
      });
      return;
    }

    const newCards = Array.from({ length: amount }, () => ({
      serial_number: generateSerialNumber(),
      amount: 100,
      term_id: selectedTerm,
    }));

    try {
      const { data, error } = await supabase
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
          description: `Successfully generated ${amount} scratch cards.`,
        });
        refetchCards(); // Refresh the list after generating
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

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load data: {error}
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
              <Label htmlFor="amount">Amount to Generate</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="500"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                  {terms && terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateScratchCards} className="w-full">
              Generate Scratch Cards
            </Button>
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
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Used At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scratchCards && scratchCards.length > 0 ? (
                      scratchCards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell>{card.serial_number}</TableCell>
                          <TableCell>{card.amount}</TableCell>
                          <TableCell>
                            {card.is_used ? (
                              <Badge variant="destructive">Used</Badge>
                            ) : (
                              <Badge variant="secondary">Unused</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {terms?.find(term => term.id === card.term_id)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>{card.used_by || 'N/A'}</TableCell>
                          <TableCell>{card.used_at ? new Date(card.used_at).toLocaleDateString() : 'N/A'}</TableCell>
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

      <CardDetailsDialog
        open={showCardDetails}
        setOpen={setShowCardDetails}
        card={cardToView}
      />
    </div>
  );
};

export default ScratchCards;
