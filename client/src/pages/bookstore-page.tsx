import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Loader2, ShoppingCart, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const searchSchema = z.object({
  query: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function BookstorePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  // Fetch all books
  const { data: books, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<string[]>({
    queryKey: ["/api/books/categories"],
    queryFn: async () => {
      // This is a workaround since we don't have a dedicated categories endpoint
      // In a real app, we'd have a proper endpoint
      const books = await apiRequest("GET", "/api/books");
      const booksData = await books.json();
      const categoriesSet = new Set<string>();
      booksData.forEach((book: Book) => {
        if (book.category) {
          categoriesSet.add(book.category);
        }
      });
      return Array.from(categoriesSet);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Add to cart function
  const addToCart = async (bookId: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/cart/items", {
        bookId,
        quantity: 1,
      });

      toast({
        title: "Added to cart",
        description: "Book has been added to your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to cart",
        variant: "destructive",
      });
    }
  };

  const onSearch = (values: SearchFormValues) => {
    setSearchQuery(values.query || "");
  };

  // Filter books based on category and search query
  const filteredBooks = books?.filter(book => {
    const matchesCategory = selectedCategory && selectedCategory !== "all" 
      ? book.category === selectedCategory 
      : true;
    const matchesSearch = searchQuery
      ? book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (isLoadingBooks || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">BookStore</h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span>Welcome, {user.displayName || user.username}</span>
                <Link href="/cart">
                  <Button variant="outline" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <Button>Login / Register</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search form */}
          <div className="w-full md:w-1/2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSearch)}
                className="flex w-full items-center space-x-2"
              >
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by title, author, or description..."
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Search</Button>
              </form>
            </Form>
          </div>

          {/* Category filter */}
          <div className="w-full md:w-auto">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.filter(category => category && category.trim() !== "").map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {filteredBooks?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No books found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks?.map((book) => (
            <Card key={book.id} className="flex flex-col h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="line-clamp-2 text-lg" title={book.title}>
                  {book.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <div
                  className="h-40 w-full bg-cover bg-center mb-4 rounded-md"
                  style={{ backgroundImage: `url(${book.coverImage})` }}
                />
                <Badge variant="outline" className="mb-2">
                  {book.category}
                </Badge>
                <p className="text-sm line-clamp-3 mt-2">{book.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="font-bold">${book.price}</div>
                <Button onClick={() => addToCart(book.id)}>Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}