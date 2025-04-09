import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Types for orders
type OrderItem = {
  id: number;
  book: {
    id: number;
    title: string;
    author: string;
    price: string;
    coverImage: string;
  };
  quantity: number;
  price: string;
};

type Order = {
  id: number;
  totalAmount: string;
  status: "pending" | "paid" | "shipped" | "delivered";
  orderDate: string;
  items?: OrderItem[];
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Status badge variants
const statusConfig = {
  pending: {
    icon: Clock,
    variant: "outline" as const,
    label: "Pending",
  },
  paid: {
    icon: CheckCircle,
    variant: "secondary" as const,
    label: "Paid",
  },
  shipped: {
    icon: Truck,
    variant: "default" as const,
    label: "Shipped",
  },
  delivered: {
    icon: Package,
    variant: "secondary" as const, // Using secondary since success is not available
    label: "Delivered",
  },
};

export default function OrdersPage() {
  // Fetch all orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch single order details
  const fetchOrderDetails = async (orderId: number) => {
    const { data } = await useQuery<Order>({
      queryKey: ["/api/orders", orderId],
      enabled: false,
    });
    return data;
  };

  if (isLoadingOrders) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Shop
            </Button>
          </Link>
        </div>
      </header>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
          <p className="text-muted-foreground mb-8">
            You haven't placed any orders yet. Start shopping to place your first order.
          </p>
          <Link href="/">
            <Button>Browse Books</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <CardDescription>
                        Placed on {formatDate(order.orderDate)}
                      </CardDescription>
                    </div>
                    <Badge variant={statusConfig[order.status].variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[order.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="items">
                      <AccordionTrigger>Order Details</AccordionTrigger>
                      <AccordionContent>
                        {order.items ? (
                          <div className="space-y-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex gap-4 py-2">
                                <div
                                  className="h-16 w-12 bg-cover bg-center rounded-sm flex-shrink-0"
                                  style={{ backgroundImage: `url(${item.book.coverImage})` }}
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.book.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.book.author}
                                  </p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-sm">
                                      {item.quantity} x ${item.price}
                                    </span>
                                    <span className="font-medium">
                                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => fetchOrderDetails(order.id)}
                            className="w-full"
                          >
                            Load Order Details
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">${order.totalAmount}</span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}