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
import { CreditCard, Plus, Eye, RefreshCw, AlertCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
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
  usage_count: number;
  max_usage_count: number;
}

interface Term {
  id: string;
  name: string;
  created_at: string;
}

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  class_id: string | null;
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
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

  const { 
    data: studentsData, 
    loading: loadingStudents, 
    error: studentsError 
  } = useSupabaseQuery<Student[]>(
    async () => {
      console.log("Fetching students...");
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, student_id, first_name, last_name, class_id')
          .order('first_name', { ascending: true });
        
        console.log("Students query result:", { data, error });
        
        if (error) {
          console.error("Students query error:", error);
          throw new Error(error.message);
        }
        
        return { data: data || [], error: null };
      } catch (err) {
        console.error("Students fetch error:", err);
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
    termsError,
    studentsData,
    loadingStudents,
    studentsError
  });

  const scratchCards = scratchCardsData || [];
  const terms = termsData || [];
  const students = studentsData || [];

  // Calculate statistics
  const totalCards = scratchCards.length;
  const usedCards = scratchCards.filter(card => card.status === 'Used' || card.status === 'Expired').length;
  const activeCards = scratchCards.filter(card => card.status === 'Active').length;
  const expiredCards = scratchCards.filter(card => card.status === 'Expired').length;
  const totalRevenue = scratchCards.reduce((sum, card) => sum + (card.revenue_generated || 0), 0);

  // Pagination logic
  const totalPages = Math.ceil(scratchCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCards = scratchCards.slice(startIndex, endIndex);

  // Helper function to get student name by student_id
  const getStudentName = (studentId: string | null) => {
    if (!studentId) return 'N/A';
    const student = students.find(s => s.student_id === studentId);
    return student ? `${student.first_name} ${student.last_name} (${student.student_id})` : studentId;
  };

  // Helper function to get status badge
  const getStatusBadge = (card: ScratchCard) => {
    if (card.status === 'Expired') {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (card.status === 'Used') {
      return <Badge variant="secondary">Used</Badge>;
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  // Helper function to get usage display
  const getUsageDisplay = (card: ScratchCard) => {
    if (card.status === 'Active') {
      return `${card.usage_count}/${card.max_usage_count}`;
    } else if (card.status === 'Expired') {
      return `${card.max_usage_count}/${card.max_usage_count}`;
    } else {
      return `${card.usage_count}/${card.max_usage_count}`;
    }
  };

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
      usage_count: 0,
      max_usage_count: 3,
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

  const loading = loadingCards || loadingTerms || loadingStudents;
  const error = cardsError || termsError || studentsError;

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
              <div className="h-4 w-4 bg-green-500 rounded" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Cards</p>
                <div className="text-2xl font-bold">{activeCards}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-orange-500 rounded" />
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
              <div className="h-4 w-4 bg-red-500 rounded" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Expired Cards</p>
                <div className="text-2xl font-bold">{expiredCards}</div>
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
            Failed to load data: {typeof error === 'string' ? error : 'Unknown error'}
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
              View and manage all scratch cards ({totalCards} total)
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
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>PIN</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCards.length > 0 ? (
                        currentCards.map((card) => (
                          <TableRow key={card.id}>
                            <TableCell className="font-mono text-sm">{card.serial_number}</TableCell>
                            <TableCell className="font-mono text-sm">{card.pin}</TableCell>
                            <TableCell>₦{card.price || 100}</TableCell>
                            <TableCell>
                              {getStatusBadge(card)}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm font-medium">
                                {getUsageDisplay(card)}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <div className="text-sm truncate" title={getStudentName(card.used_by)}>
                                {getStudentName(card.used_by)}
                              </div>
                            </TableCell>
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
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No scratch cards found. Generate some cards to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalCards)} of {totalCards} cards
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card Details Dialog */}
      <Dialog open={showCardDetails} onOpenChange={setShowCardDetails}>
        <DialogContent className="sm:max-w-[500px]">
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
                <Input value={cardToView.serial_number} className="col-span-3 font-mono" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">PIN</Label>
                <Input value={cardToView.pin} className="col-span-3 font-mono" readOnly />
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
                <div className="col-span-3">
                  {getStatusBadge(cardToView)}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Usage</Label>
                <Input value={getUsageDisplay(cardToView)} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Used By</Label>
                <Input value={getStudentName(cardToView.used_by)} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Used At</Label>
                <Input value={cardToView.used_at ? new Date(cardToView.used_at).toLocaleString() : 'N/A'} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created At</Label>
                <Input value={new Date(cardToView.created_at).toLocaleString()} className="col-span-3" readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScratchCards;
