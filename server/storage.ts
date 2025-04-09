import { 
  users, categories, events, userPreferences, 
  books, carts, cartItems, orders, orderItems,
  type User, type InsertUser,
  type Event, type InsertEvent,
  type Category, type InsertCategory,
  type UserPreference, type InsertUserPreference,
  type Book, type InsertBook,
  type Cart, type InsertCart,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLocation(userId: number, location: string, latitude: number, longitude: number): Promise<User | undefined>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByCategory(category: string): Promise<Event[]>;
  getEventsByBudgetLevel(budgetLevel: number): Promise<Event[]>;
  getNearbyEvents(latitude: number, longitude: number, maxDistance: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // User Preferences methods
  getUserPreferences(userId: number): Promise<UserPreference[]>;
  createUserPreference(preference: InsertUserPreference): Promise<UserPreference>;
  
  // Bookstore methods - Books
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  getBooksByCategory(category: string): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  
  // Bookstore methods - Cart
  getCart(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByBookId(cartId: number, bookId: number): Promise<CartItem | undefined>;
  addItemToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
  
  // Bookstore methods - Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private categories: Map<number, Category>;
  private userPreferences: Map<number, UserPreference>;
  
  // Bookstore maps
  private books: Map<number, Book>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userCurrentId: number;
  private eventCurrentId: number;
  private categoryCurrentId: number;
  private userPreferenceCurrentId: number;
  
  // Bookstore IDs
  private bookCurrentId: number;
  private cartCurrentId: number;
  private cartItemCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.categories = new Map();
    this.userPreferences = new Map();
    
    // Initialize bookstore maps
    this.books = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userCurrentId = 1;
    this.eventCurrentId = 1;
    this.categoryCurrentId = 1;
    this.userPreferenceCurrentId = 1;
    
    // Initialize bookstore IDs
    this.bookCurrentId = 1;
    this.cartCurrentId = 1;
    this.cartItemCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    
    // Initialize with some categories
    this.initializeCategories();
    
    // Initialize with some sample events
    this.initializeEvents();
    
    // Initialize with sample books
    this.initializeBooks();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserLocation(userId: number, location: string, latitude: number, longitude: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      location,
      latitude,
      longitude
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventsByCategory(category: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  async getEventsByBudgetLevel(budgetLevel: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.budgetLevel === budgetLevel
    );
  }
  
  async getNearbyEvents(latitude: number, longitude: number, maxDistance: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .map(event => {
        if (event.latitude && event.longitude) {
          // Calculate distance using Haversine formula
          const distance = this.calculateDistance(
            latitude, 
            longitude, 
            event.latitude, 
            event.longitude
          );
          return { ...event, distanceInMiles: distance };
        }
        return { ...event, distanceInMiles: Number.MAX_VALUE };
      })
      .filter(event => event.distanceInMiles <= maxDistance)
      .sort((a, b) => (a.distanceInMiles || 0) - (b.distanceInMiles || 0));
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // User Preferences methods
  async getUserPreferences(userId: number): Promise<UserPreference[]> {
    return Array.from(this.userPreferences.values()).filter(
      (pref) => pref.userId === userId
    );
  }
  
  async createUserPreference(insertPreference: InsertUserPreference): Promise<UserPreference> {
    const id = this.userPreferenceCurrentId++;
    const preference: UserPreference = { ...insertPreference, id };
    this.userPreferences.set(id, preference);
    return preference;
  }
  
  // Helper methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in miles
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }
  
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  private initializeCategories() {
    const categoriesToAdd: InsertCategory[] = [
      { name: "Hiking", icon: "directions_walk" },
      { name: "Cycling", icon: "pedal_bike" },
      { name: "Kayaking", icon: "waves" },
      { name: "Camping", icon: "park" },
      { name: "Climbing", icon: "filter_drama" },
      { name: "Fishing", icon: "directions_boat" }
    ];
    
    categoriesToAdd.forEach(category => {
      this.createCategory(category);
    });
  }
  
  private initializeEvents() {
    const today = new Date();
    const eventsToAdd: InsertEvent[] = [
      {
        title: "Guided Nature Walk",
        description: "Join our expert guide for a family-friendly nature walk through the beautiful trails of Carkeek Park. Learn about local flora and fauna while enjoying scenic views of Puget Sound and the Olympic Mountains. This educational experience is perfect for beginners and families with children.",
        imageUrl: "https://images.unsplash.com/photo-1552521218-13b2354c0c86?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        location: "Carkeek Park, Seattle",
        latitude: 47.7129,
        longitude: -122.3779,
        distanceInMiles: 3.2,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 10, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 12, 0),
        budgetLevel: 1,
        price: "$5/person",
        category: "Hiking",
        tags: ["Family-friendly", "Beginner", "Wildlife", "Educational"],
        hostName: "Sarah Johnson",
        hostTitle: "Naturalist & Trail Guide",
        hostImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        requirements: ["Comfortable walking shoes", "Water bottle", "Weather-appropriate clothing", "Camera (optional)", "Binoculars (optional)"],
        isFeatured: true
      },
      {
        title: "Sunset Kayaking",
        description: "Experience Seattle from the water with our guided sunset kayaking tour. All equipment and basic instruction provided. Paddle through the calm waters of Elliott Bay while watching the sunset over the Olympic Mountains.",
        imageUrl: "https://images.unsplash.com/photo-1623166856835-83bff6d3a611?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        location: "Alki Beach, Seattle",
        latitude: 47.5812,
        longitude: -122.4061,
        distanceInMiles: 5.7,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 19, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 21, 0),
        budgetLevel: 2,
        price: "$45/person",
        category: "Kayaking",
        tags: ["Water Sports", "Equipment Provided", "Scenic", "Sunset"],
        hostName: "Mike Davis",
        hostTitle: "Kayak Instructor & Guide",
        hostImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        requirements: ["Water bottle", "Clothes that can get wet", "Sunscreen", "Sunglasses with strap"],
        isFeatured: false
      },
      {
        title: "Rock Climbing Workshop",
        description: "Learn rock climbing fundamentals from professional instructors in this hands-on workshop. All skill levels welcome. Our experienced instructors will teach you proper techniques, safety procedures, and climbing etiquette.",
        imageUrl: "https://images.unsplash.com/photo-1527021239703-d2dc2299399e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        location: "Vertical World, Seattle",
        latitude: 47.6615,
        longitude: -122.3794,
        distanceInMiles: 2.3,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8, 13, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8, 16, 0),
        budgetLevel: 3,
        price: "$75/person",
        category: "Climbing",
        tags: ["Indoor", "Professional Instructors", "All Levels", "Equipment Provided"],
        hostName: "Alex Chen",
        hostTitle: "Certified Climbing Instructor",
        hostImageUrl: "https://images.unsplash.com/photo-1542327897-d73f4005b533?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        requirements: ["Athletic clothing", "Water bottle", "Snacks", "Towel"],
        isFeatured: false
      },
      {
        title: "Waterfall Hike",
        description: "Explore the beautiful waterfalls of Discovery Park on this beginner-friendly hike. Perfect for nature enthusiasts and photographers looking to capture the beauty of Washington's natural landscapes.",
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        location: "Discovery Park, Seattle",
        latitude: 47.6614,
        longitude: -122.4055,
        distanceInMiles: 5.0,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 8, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 0),
        budgetLevel: 1,
        price: "Free",
        category: "Hiking",
        tags: ["Waterfall", "Photography", "Nature", "Beginner-friendly"],
        hostName: "Emma Wilson",
        hostTitle: "Park Ranger",
        hostImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        requirements: ["Hiking shoes", "Water bottle", "Camera", "Snacks"],
        isFeatured: true
      },
      {
        title: "Mountain Biking Adventure",
        description: "Hit the trails on this exciting mountain biking adventure at Tiger Mountain. Suitable for intermediate riders with some experience. Explore winding forest trails and enjoy stunning views of the Cascade Mountains.",
        imageUrl: "https://images.unsplash.com/photo-1544845894-20b3d88ff624?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        location: "Tiger Mountain, Issaquah",
        latitude: 47.4924,
        longitude: -121.9452,
        distanceInMiles: 8.0,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 9, 30),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 13, 0),
        budgetLevel: 2,
        price: "$35/person",
        category: "Cycling",
        tags: ["Mountain Biking", "Intermediate", "Forest Trails", "Equipment Rental Available"],
        hostName: "Jason Martinez",
        hostTitle: "Mountain Bike Instructor",
        hostImageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        requirements: ["Mountain bike (rentals available)", "Helmet", "Water bottle", "Athletic clothing"],
        isFeatured: true
      },
      {
        title: "Overnight Camping Trip",
        description: "Escape the city for an overnight camping experience at Mount Rainier National Park. Learn essential wilderness skills and enjoy stargazing far from city lights.",
        imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        location: "Mount Rainier National Park",
        latitude: 46.8800,
        longitude: -121.7269,
        distanceInMiles: 65.2,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 10, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15, 12, 0),
        budgetLevel: 2,
        price: "$50/person",
        category: "Camping",
        tags: ["Overnight", "Stargazing", "Wilderness Skills", "Campfire Cooking"],
        hostName: "Robert Lee",
        hostTitle: "Wilderness Guide",
        hostImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        requirements: ["Tent (rentals available)", "Sleeping bag", "Warm clothing", "Headlamp", "Food supplies"],
        isFeatured: false
      }
    ];
    
    eventsToAdd.forEach(event => {
      this.createEvent(event);
    });
  }
  // Bookstore methods - Books
  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }
  
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }
  
  async getBooksByCategory(category: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(
      (book) => book.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookCurrentId++;
    const book: Book = { ...insertBook, id };
    this.books.set(id, book);
    return book;
  }
  
  // Bookstore methods - Cart
  async getCart(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(
      (cart) => cart.userId === userId && !cart.checkedOut
    );
  }
  
  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.cartCurrentId++;
    const cart: Cart = { 
      ...insertCart, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      checkedOut: false
    };
    this.carts.set(id, cart);
    return cart;
  }
  
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cartId
    );
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }
  
  async getCartItemByBookId(cartId: number, bookId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.cartId === cartId && item.bookId === bookId
    );
  }
  
  async addItemToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.getCartItemByBookId(
      insertCartItem.cartId,
      insertCartItem.bookId
    );
    
    if (existingItem) {
      // Update quantity if item exists
      return this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + (insertCartItem.quantity || 1)
      ) as Promise<CartItem>;
    }
    
    // Otherwise create new cart item
    const id = this.cartItemCurrentId++;
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id, 
      addedAt: new Date(),
      quantity: insertCartItem.quantity || 1
    };
    this.cartItems.set(id, cartItem);
    
    // Update cart's updated time
    const cart = await this.carts.get(insertCartItem.cartId);
    if (cart) {
      cart.updatedAt = new Date();
      this.carts.set(cart.id, cart);
    }
    
    return cartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = await this.getCartItem(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem: CartItem = {
      ...cartItem,
      quantity
    };
    
    this.cartItems.set(id, updatedCartItem);
    
    // Update cart's updated time
    const cart = await this.carts.get(cartItem.cartId);
    if (cart) {
      cart.updatedAt = new Date();
      this.carts.set(cart.id, cart);
    }
    
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const cartItem = await this.getCartItem(id);
    if (!cartItem) return false;
    
    const success = this.cartItems.delete(id);
    
    // Update cart's updated time
    if (success) {
      const cart = await this.carts.get(cartItem.cartId);
      if (cart) {
        cart.updatedAt = new Date();
        this.carts.set(cart.id, cart);
      }
    }
    
    return success;
  }
  
  async clearCart(cartId: number): Promise<boolean> {
    const cartItems = await this.getCartItems(cartId);
    if (cartItems.length === 0) return true;
    
    let success = true;
    for (const item of cartItems) {
      const deleted = this.cartItems.delete(item.id);
      if (!deleted) success = false;
    }
    
    // Update cart's updated time
    const cart = await this.carts.get(cartId);
    if (cart) {
      cart.updatedAt = new Date();
      this.carts.set(cart.id, cart);
    }
    
    return success;
  }
  
  // Bookstore methods - Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      orderDate: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }
  
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()); // Newest first
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const orderItem: OrderItem = { 
      ...insertOrderItem, 
      id 
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(orderId);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      status
    };
    
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }
  
  // Sample books data
  private initializeBooks() {
    const booksToAdd: InsertBook[] = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A story of wealth, love, and tragedy set in the Roaring Twenties, following the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "12.99",
        isbn: "9780743273565",
        category: "Fiction",
        publishedDate: "1925",
        stockQuantity: 15
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "A powerful story of racial injustice and moral growth seen through the eyes of a young girl in a small Southern town during the Great Depression.",
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "14.99",
        isbn: "9780061120084",
        category: "Fiction",
        publishedDate: "1960",
        stockQuantity: 20
      },
      {
        title: "1984",
        author: "George Orwell",
        description: "A dystopian novel set in a totalitarian society where critical thought is suppressed and surveillance is omnipresent.",
        coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "11.99",
        isbn: "9780451524935",
        category: "Science Fiction",
        publishedDate: "1949",
        stockQuantity: 18
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A romantic novel following the emotional development of Elizabeth Bennet, who learns the error of making hasty judgments and comes to appreciate the difference between superficial and essential goodness.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "9.99",
        isbn: "9780141439518",
        category: "Romance",
        publishedDate: "1813",
        stockQuantity: 25
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        description: "A fantasy novel about the adventures of Bilbo Baggins, a hobbit who embarks on an epic quest to reclaim a treasure stolen by a dragon.",
        coverImage: "https://images.unsplash.com/photo-1515098506762-79e1384e9d8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "13.99",
        isbn: "9780547928227",
        category: "Fantasy",
        publishedDate: "1937",
        stockQuantity: 30
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        author: "J.K. Rowling",
        description: "The first novel in the Harry Potter series, following the life of a young wizard, Harry Potter, and his friends at Hogwarts School of Witchcraft and Wizardry.",
        coverImage: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "15.99",
        isbn: "9781408855652",
        category: "Fantasy",
        publishedDate: "1997",
        stockQuantity: 50
      },
      {
        title: "The Da Vinci Code",
        author: "Dan Brown",
        description: "A mystery thriller novel that follows the investigations of Robert Langdon and Sophie Neveu after a murder in the Louvre Museum in Paris.",
        coverImage: "https://images.unsplash.com/photo-1479894720049-067d8b88ffb4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "12.99",
        isbn: "9780307474278",
        category: "Mystery",
        publishedDate: "2003",
        stockQuantity: 22
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        description: "A philosophical novel about a young Andalusian shepherd who dreams of finding a worldly treasure and embarks on a journey of self-discovery.",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        price: "10.99",
        isbn: "9780062315007",
        category: "Fiction",
        publishedDate: "1988",
        stockQuantity: 35
      }
    ];
    
    booksToAdd.forEach(book => {
      this.createBook(book);
    });
  }
}

export const storage = new MemStorage();
