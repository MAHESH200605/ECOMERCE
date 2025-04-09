import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";
import session from "express-session";
import { insertUserSchema, insertCartSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";

// Add session type definition
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-api-key",
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.get("/api/events/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const events = await storage.getEventsByCategory(category);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events by category" });
    }
  });

  app.get("/api/events/budget/:level", async (req: Request, res: Response) => {
    try {
      const budgetLevel = parseInt(req.params.level);
      if (isNaN(budgetLevel) || budgetLevel < 1 || budgetLevel > 3) {
        return res.status(400).json({ message: "Invalid budget level. Must be 1, 2, or 3." });
      }
      
      const events = await storage.getEventsByBudgetLevel(budgetLevel);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events by budget level" });
    }
  });

  app.get("/api/events/nearby", async (req: Request, res: Response) => {
    try {
      const latitudeParam = req.query.latitude;
      const longitudeParam = req.query.longitude;
      const maxDistanceParam = req.query.maxDistance || "25";
      
      if (!latitudeParam || !longitudeParam) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(latitudeParam as string);
      const longitude = parseFloat(longitudeParam as string);
      const maxDistance = parseFloat(maxDistanceParam as string);
      
      if (isNaN(latitude) || isNaN(longitude) || isNaN(maxDistance)) {
        return res.status(400).json({ message: "Invalid coordinates or distance" });
      }
      
      const events = await storage.getNearbyEvents(latitude, longitude, maxDistance);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby events" });
    }
  });

  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/recommendations", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        location: z.string(),
        interests: z.array(z.string()).optional(),
        budgetLevel: z.number().min(1).max(3).optional(),
        previousActivities: z.array(z.string()).optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { location, interests, budgetLevel, previousActivities } = validationResult.data;
      
      // Get all events to provide context for OpenAI
      const allEvents = await storage.getEvents();
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an outdoor adventure recommendation system. 
            Based on the user's location, interests, budget level, and previous activities, 
            recommend 2-3 outdoor activities or events from the provided list. 
            Format your response as JSON with an array of event IDs that would be most relevant.
            Consider the user's budget constraints and proximity to activities.`
          },
          {
            role: "user",
            content: JSON.stringify({
              userPreferences: {
                location,
                interests: interests || [],
                budgetLevel: budgetLevel || 2,
                previousActivities: previousActivities || []
              },
              availableEvents: allEvents.map(e => ({
                id: e.id,
                title: e.title,
                category: e.category,
                budgetLevel: e.budgetLevel,
                location: e.location,
                distanceInMiles: e.distanceInMiles,
                tags: e.tags || []
              }))
            })
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content || '{"recommendedEvents":[]}';
      const recommendationData = JSON.parse(content);
      
      // Get the full event data for the recommended event IDs
      const recommendedEventIds = recommendationData.recommendedEvents || [];
      const recommendedEvents = [];
      
      for (const eventId of recommendedEventIds) {
        const event = await storage.getEvent(eventId);
        if (event) {
          recommendedEvents.push(event);
        }
      }
      
      res.json({
        recommendations: recommendedEvents,
        reasoning: recommendationData.reasoning || "Based on your preferences"
      });
    } catch (error) {
      console.error("Recommendation error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Bookstore API Routes
  
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: validationResult.error.errors
        });
      }
      
      const existingUser = await storage.getUserByUsername(validationResult.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(validationResult.data);
      
      // Set user in session
      req.session.userId = newUser.id;
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        req.session.destroy(() => {
          res.status(401).json({ message: "User not found" });
        });
        return;
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Failed to check authentication" });
    }
  });
  
  // Book routes
  app.get("/api/books", async (_req: Request, res: Response) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      console.error("Get books error:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });
  
  app.get("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      
      if (isNaN(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      console.error("Get book error:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });
  
  app.get("/api/books/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const books = await storage.getBooksByCategory(category);
      res.json(books);
    } catch (error) {
      console.error("Get books by category error:", error);
      res.status(500).json({ message: "Failed to fetch books by category" });
    }
  });
  
  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      let cart = await storage.getCart(userId);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      // Get book details for each cart item
      const cartItemsWithBooks = [];
      let total = 0;
      
      for (const item of cartItems) {
        const book = await storage.getBook(item.bookId);
        
        if (book) {
          const priceAsNumber = parseFloat(book.price);
          const itemTotal = priceAsNumber * item.quantity;
          total += itemTotal;
          
          cartItemsWithBooks.push({
            id: item.id,
            book,
            quantity: item.quantity,
            total: itemTotal.toFixed(2)
          });
        }
      }
      
      res.json({
        id: cart.id,
        items: cartItemsWithBooks,
        total: total.toFixed(2),
        itemCount: cartItems.length
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  
  app.post("/api/cart/items", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate request body
      const schema = z.object({
        bookId: z.number(),
        quantity: z.number().min(1).default(1)
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid cart item data",
          errors: validationResult.error.errors
        });
      }
      
      const { bookId, quantity } = validationResult.data;
      
      // Verify book exists
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Get or create cart
      let cart = await storage.getCart(userId);
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      // Add item to cart
      const cartItem = await storage.addItemToCart({
        cartId: cart.id,
        bookId,
        quantity
      });
      
      res.status(201).json({
        ...cartItem,
        book
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  app.put("/api/cart/items/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      // Validate request body
      const schema = z.object({
        quantity: z.number().min(1)
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid quantity",
          errors: validationResult.error.errors
        });
      }
      
      const { quantity } = validationResult.data;
      
      // Get cart item and verify ownership
      const cartItem = await storage.getCartItem(itemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const cart = await storage.getCart(userId);
      
      if (!cart || cart.id !== cartItem.cartId) {
        return res.status(403).json({ message: "Not authorized to access this cart item" });
      }
      
      // Update quantity
      const updatedCartItem = await storage.updateCartItemQuantity(itemId, quantity);
      
      res.json(updatedCartItem);
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  app.delete("/api/cart/items/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      // Get cart item and verify ownership
      const cartItem = await storage.getCartItem(itemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const cart = await storage.getCart(userId);
      
      if (!cart || cart.id !== cartItem.cartId) {
        return res.status(403).json({ message: "Not authorized to access this cart item" });
      }
      
      // Remove item
      const success = await storage.removeCartItem(itemId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to remove item from cart" });
      }
      
      res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Remove cart item error:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });
  
  app.delete("/api/cart", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Get cart
      const cart = await storage.getCart(userId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Clear cart
      const success = await storage.clearCart(cart.id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to clear cart" });
      }
      
      res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  
  // Order routes
  app.post("/api/orders", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Get user's cart
      const cart = await storage.getCart(userId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cannot create order with empty cart" });
      }
      
      // Calculate total
      let total = 0;
      const orderItemsData = [];
      
      for (const item of cartItems) {
        const book = await storage.getBook(item.bookId);
        
        if (!book) {
          return res.status(400).json({ message: `Book with ID ${item.bookId} not found` });
        }
        
        const priceAsNumber = parseFloat(book.price);
        const itemTotal = priceAsNumber * item.quantity;
        total += itemTotal;
        
        orderItemsData.push({
          bookId: book.id,
          quantity: item.quantity,
          price: book.price
        });
      }
      
      // Create order
      const order = await storage.createOrder({
        userId,
        totalAmount: total.toFixed(2),
        status: "pending"
      });
      
      // Add order items
      for (const itemData of orderItemsData) {
        await storage.createOrderItem({
          orderId: order.id,
          ...itemData
        });
      }
      
      // Mark cart as checked out (or clear it)
      await storage.clearCart(cart.id);
      
      res.status(201).json({
        id: order.id,
        total: total.toFixed(2),
        status: order.status,
        itemCount: orderItemsData.length,
        orderDate: order.orderDate
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  app.get("/api/orders", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Get user's orders
      const orders = await storage.getOrders(userId);
      
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  app.get("/api/orders/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      // Get order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify ownership
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to access this order" });
      }
      
      // Get order items with book details
      const orderItems = await storage.getOrderItems(orderId);
      const itemsWithDetails = [];
      
      for (const item of orderItems) {
        const book = await storage.getBook(item.bookId);
        
        if (book) {
          itemsWithDetails.push({
            id: item.id,
            book,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
      
      res.json({
        ...order,
        items: itemsWithDetails
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  app.put("/api/orders/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      // Validate request body
      const schema = z.object({
        status: z.enum(["pending", "paid", "shipped", "delivered"])
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid status",
          errors: validationResult.error.errors
        });
      }
      
      const { status } = validationResult.data;
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
