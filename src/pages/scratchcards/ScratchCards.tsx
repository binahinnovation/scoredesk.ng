
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Download, Search, Eye } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ScratchCard {
  id: string;
  pin: string;
  serial_number: string;
  amount: number;
  status: "Active" | "Used" | "Expired";
  term_id: string | null;
  used_by?: string | null;
  used_at?: string | null;
  created_at: string;
}

interface Term {
  id: string;
  name: string;
  academic_year: string;
  is_current: boolean;
}

export default function ScratchCards() {
  const { userRole, loading, hasPermission } = useUserRole();
  const [cards, setCards] = useState<ScratchCard[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [filteredCards, setFilteredCards] = useState<ScratchCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [generating, setGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [generateAmount, setGenerateAmount] = useState(1000);
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null);

  useEffect(() => {
    if (hasPermission("Scratch Cards")) {
      fetchCards();
      fetchTerms();
    }
  }, [hasPermission]);

  useEffect(() => {
    filterCards();
  }, [cards, searchTerm, statusFilter]);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTerms(data || []);
      
      // Set current term as default
      const currentTerm = data?.find(term => term.is_current);
      if (currentTerm) {
        setSelectedTermId(currentTerm.id);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch terms",
        variant: "destructive",
      });
    }
  };

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('scratch_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to ensure proper typing
      const typedCards = (data || []).map(card => ({
        ...card,
        status: card.status as "Active" | "Used" | "Expired"
      }));
      
      setCards(typedCards);
    } catch (error) {
      console.error('Error fetching scratch cards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scratch cards",
        variant: "destructive",
      });
    }
  };

  const filterCards = () => {
    let filtered = cards;

    if (statusFilter !== "all") {
      filtered = filtered.filter(card => card.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.pin.includes(searchTerm) ||
        card.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCards(filtered);
  };

  const generatePin = () => {
    return Math.random().toString().substr(2, 16).padStart(16, '0');
  };

  const generateCards = async () => {
    if (!selectedTermId) {
      toast({
        title: "Error",
        description: "Please select a term first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const newCards = Array.from({ length: generateCount }, (_, i) => ({
        pin: generatePin(),
        serial_number: `SCH${String(cards.length + i + 1).padStart(6, '0')}`,
        amount: generateAmount,
        status: 'Active' as const,
        term_id: selectedTermId,
      }));

      const { data, error } = await supabase
        .from('scratch_cards')
        .insert(newCards)
        .select();

      if (error) throw error;

      await fetchCards();
      
      toast({
        title: "Success",
        description: `${generateCount} scratch cards generated successfully`,
      });
    } catch (error) {
      console.error('Error generating cards:', error);
      toast({
        title: "Error",
        description: "Failed to generate scratch cards",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportCards = () => {
    const csvContent = [
      "Serial Number,PIN,Amount,Status,Created At",
      ...filteredCards.map(card => 
        `${card.serial_number},${card.pin},${card.amount},${card.status},${card.created_at}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scratch-cards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("Scratch Cards")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Scratch Cards</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Principals and Exam Officers can manage scratch cards. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Scratch Cards</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name} ({term.academic_year})
                      {term.is_current && " - Current"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="count">Number of Cards</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={generateCount}
                onChange={(e) => setGenerateCount(parseInt(e.target.value) || 10)}
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                min="100"
                value={generateAmount}
                onChange={(e) => setGenerateAmount(parseInt(e.target.value) || 1000)}
              />
            </div>
            
            <Button 
              onClick={generateCards} 
              disabled={generating || !selectedTermId}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Generate Cards"}
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Cards:</span>
              <span className="font-semibold">{cards.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="font-semibold text-green-600">
                {cards.filter(c => c.status === "Active").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Used:</span>
              <span className="font-semibold text-blue-600">
                {cards.filter(c => c.status === "Used").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Expired:</span>
              <span className="font-semibold text-red-600">
                {cards.filter(c => c.status === "Expired").length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-semibold">
                ₦{cards.reduce((sum, card) => sum + card.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Used Value:</span>
              <span className="font-semibold text-green-600">
                ₦{cards.filter(c => c.status === "Used").reduce((sum, card) => sum + card.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pending Value:</span>
              <span className="font-semibold text-orange-600">
                ₦{cards.filter(c => c.status === "Active").reduce((sum, card) => sum + card.amount, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by PIN or Serial Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportCards}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Cards Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>PIN</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No scratch cards found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.serial_number}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {card.pin.substring(0, 4)}****{card.pin.substring(12)}
                      </TableCell>
                      <TableCell>₦{card.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            card.status === "Active" ? "default" :
                            card.status === "Used" ? "secondary" : "destructive"
                          }
                          className={
                            card.status === "Active" ? "bg-green-100 text-green-800" :
                            card.status === "Used" ? "bg-blue-100 text-blue-800" : ""
                          }
                        >
                          {card.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{card.used_by || "-"}</TableCell>
                      <TableCell>{new Date(card.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedCard(card)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Scratch Card Details</DialogTitle>
                            </DialogHeader>
                            {selectedCard && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Serial Number</Label>
                                  <p className="font-mono">{selectedCard.serial_number}</p>
                                </div>
                                <div>
                                  <Label>PIN</Label>
                                  <p className="font-mono text-lg font-bold">{selectedCard.pin}</p>
                                </div>
                                <div>
                                  <Label>Amount</Label>
                                  <p>₦{selectedCard.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Badge className="ml-2">{selectedCard.status}</Badge>
                                </div>
                                {selectedCard.used_by && (
                                  <div>
                                    <Label>Used By</Label>
                                    <p>{selectedCard.used_by}</p>
                                  </div>
                                )}
                                {selectedCard.used_at && (
                                  <div>
                                    <Label>Used At</Label>
                                    <p>{new Date(selectedCard.used_at).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
