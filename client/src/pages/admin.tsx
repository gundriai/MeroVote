import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, BarChart3, MessageSquare, Calendar } from "lucide-react";
import { Link } from "wouter";
import AdminDashboard from "@/components/admin-dashboard";

const pollFormSchema = z.object({
  title: z.string().min(1, "शीर्षक आवश्यक छ"),
  description: z.string().optional(),
  type: z.enum(["daily_rating", "political_rating", "comparison_voting"]),
  duration: z.number().min(1, "अवधि कम्तिमा १ घण्टा हुनुपर्छ"),
  mediaUrl: z.string().optional(),
  createdBy: z.string().default("admin"), // Simplified for demo
  candidates: z.array(z.object({
    name: z.string().min(1, "उम्मेदवारको नाम आवश्यक छ"),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  })).optional(),
});

type PollFormData = z.infer<typeof pollFormSchema>;

export default function Admin() {
  const { toast } = useToast();

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "daily_rating",
      duration: 24,
      mediaUrl: "",
      candidates: [],
    },
  });

  const watchedType = form.watch("type");

  // Fetch analytics
  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (data: PollFormData) => {
      const response = await apiRequest("POST", "/api/polls", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "सफलता",
        description: "नयाँ पोल सिर्जना गरियो",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "त्रुटि",
        description: "पोल सिर्जना गर्न सकिएन",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PollFormData) => {
    createPollMutation.mutate(data);
  };

  const addCandidate = () => {
    const candidates = form.getValues("candidates") || [];
    form.setValue("candidates", [...candidates, { name: "", description: "", imageUrl: "" }]);
  };

  const removeCandidate = (index: number) => {
    const candidates = form.getValues("candidates") || [];
    form.setValue("candidates", candidates.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-nepal-red rounded-lg flex items-center justify-center">
                  <Calendar className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">MeroVote Admin</h1>
              </Link>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-nepal-red transition-colors">
                होम
              </Link>
              <Link href="/admin" className="text-nepal-red font-medium">
                एडमिन
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Create Poll Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>नयाँ पोल बनाउनुहोस्</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>शीर्षक</FormLabel>
                          <FormControl>
                            <Input placeholder="पोलको शीर्षक लेख्नुहोस्" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>विवरण</FormLabel>
                          <FormControl>
                            <Textarea placeholder="पोलको विस्तृत विवरण" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>पोल प्रकार</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="प्रकार छान्नुहोस्" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily_rating">दैनिक मूल्याङ्कन</SelectItem>
                                <SelectItem value="political_rating">राजनैतिक मूल्याङ्कन</SelectItem>
                                <SelectItem value="comparison_voting">तुलना मतदान</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>अवधि (घण्टामा)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="24" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="mediaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>मिडिया URL (वैकल्पिक)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Candidates Section for Comparison Voting */}
                    {watchedType === "comparison_voting" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">उम्मेदवारहरू</h3>
                          <Button type="button" onClick={addCandidate} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            उम्मेदवार थप्नुहोस्
                          </Button>
                        </div>

                        {(form.watch("candidates") || []).map((_, index) => (
                          <Card key={index} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">उम्मेदवार {index + 1}</h4>
                                <Button 
                                  type="button" 
                                  onClick={() => removeCandidate(index)}
                                  variant="destructive" 
                                  size="sm"
                                >
                                  हटाउनुहोस्
                                </Button>
                              </div>
                              
                              <FormField
                                control={form.control}
                                name={`candidates.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>नाम</FormLabel>
                                    <FormControl>
                                      <Input placeholder="उम्मेदवारको नाम" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`candidates.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>विवरण</FormLabel>
                                    <FormControl>
                                      <Input placeholder="छोटो विवरण" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`candidates.${index}.imageUrl`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>तस्बिर URL</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://example.com/candidate.jpg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-nepal-red hover:bg-red-700"
                      disabled={createPollMutation.isPending}
                    >
                      {createPollMutation.isPending ? "सिर्जना गर्दै..." : "पोल सिर्जना गर्नुहोस्"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Admin Dashboard */}
          <div className="lg:col-span-1">
            <AdminDashboard stats={stats as any} />
          </div>
        </div>
      </main>
    </div>
  );
}
