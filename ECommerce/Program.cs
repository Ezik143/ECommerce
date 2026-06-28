using ECommerce.Authorization.Handlers;
using ECommerce.Authorization.Requirements;
using ECommerce.Data;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;
using ECommerce.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] is { Length: > 0 } sk ? Encoding.UTF8.GetBytes(sk) : Array.Empty<byte>();

//Registering AutoMapper and scanning the assembly for profiles
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(Program).Assembly);
});


//Registering the DbContext with PostgreSQL provider
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Auth0 JWT Authentication only
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Domain"]}/";
        options.Audience = builder.Configuration["Auth0:Audience"];
    });

builder.Services.AddAuthorization(options =>
{
    // Role-based policies
    options.AddPolicy("AdminOrCustomerSupport", p => p.Requirements.Add(new RoleRequirement(UserRole.Admin, UserRole.CustomerSupport)));
    options.AddPolicy("CustomerOnly", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.Customer)));

    options.AddPolicy("SellerOnly", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.Seller)));

    options.AddPolicy("AdminOnly", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.Admin)));

    options.AddPolicy("OrderManagerOnly", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.OrderManager)));

    options.AddPolicy("CustomerSupportOnly", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.CustomerSupport)));

    options.AddPolicy("SellerOrAdmin", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.Seller, UserRole.Admin)));

    options.AddPolicy("OrderManagerOrAdmin", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.OrderManager, UserRole.Admin)));

    options.AddPolicy("SellerOrOrderManagerOrAdmin", p =>
        p.Requirements.Add(new RoleRequirement(UserRole.Seller, UserRole.OrderManager, UserRole.Admin)));

    options.AddPolicy("StaffOnly", p =>
        p.Requirements.Add(new RoleRequirement(
            UserRole.Admin, UserRole.OrderManager, UserRole.CustomerSupport)));

    // Resource-based policies
    options.AddPolicy("AddressOwner", p =>
        p.Requirements.Add(new AddressOwnerRequirement()));
    options.AddPolicy("OrderOwner", p =>
        p.Requirements.Add(new OrderOwnerRequirement()));
    options.AddPolicy("ProductOwner", p =>
        p.Requirements.Add(new ProductOwnerRequirement()));
});

// Register authorization handlers
builder.Services.AddTransient<IAuthorizationHandler, RoleAuthorizationHandler>();
builder.Services.AddTransient<IAuthorizationHandler, AddressAuthorizationHandler>();
builder.Services.AddTransient<IAuthorizationHandler, OrderAuthorizationHandler>();
builder.Services.AddTransient<IAuthorizationHandler, ProductAuthorizationHandler>();

// Register services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<ICartItemService, CartItemService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IOrderItemService, OrderItemService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            new Uri(origin).Host == "localhost")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ECommerce API",
        Version = "v1",
        Description = "ASP.NET Core Web API for ECommerce System with Auth0 Authentication"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your Auth0 JWT access token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseCors("Frontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ECommerce API v1");
        options.RoutePrefix = string.Empty; // Serve Swagger UI at root
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (!db.Categories.Any())
    {
        SeedCategories(db);
    }
}

app.Run();

static void SeedCategories(ApplicationDbContext db)
{
    var mainCategories = new List<Category>
    {
        new() { Name = "Mobile & Tablets", Slug = "mobile-tablets", Description = "Smartphones, tablets, and accessories", SortOrder = 1 },
        new() { Name = "Computers & Laptops", Slug = "computers-laptops", Description = "Laptops, desktops, and computer peripherals", SortOrder = 2 },
        new() { Name = "Electronics", Slug = "electronics", Description = "Audio, video, and electronic gadgets", SortOrder = 3 },
        new() { Name = "TV & Home Appliances", Slug = "tv-home-appliances", Description = "Televisions and major home appliances", SortOrder = 4 },
        new() { Name = "Home & Living", Slug = "home-living", Description = "Furniture, decor, and household essentials", SortOrder = 5 },
        new() { Name = "Men's Fashion", Slug = "mens-fashion", Description = "Men's clothing, shoes, and accessories", SortOrder = 6 },
        new() { Name = "Women's Fashion", Slug = "womens-fashion", Description = "Women's clothing, shoes, and accessories", SortOrder = 7 },
        new() { Name = "Beauty & Health", Slug = "beauty-health", Description = "Skincare, makeup, and personal care", SortOrder = 8 },
        new() { Name = "Sports & Outdoors", Slug = "sports-outdoors", Description = "Sports equipment, activewear, and outdoor gear", SortOrder = 9 },
        new() { Name = "Baby & Toys", Slug = "baby-toys", Description = "Baby products, toys, and kids items", SortOrder = 10 },
        new() { Name = "Automotive", Slug = "automotive", Description = "Car and motorcycle parts and accessories", SortOrder = 11 },
        new() { Name = "Books & Stationery", Slug = "books-stationery", Description = "Books, office supplies, and stationery", SortOrder = 12 },
        new() { Name = "Groceries", Slug = "groceries", Description = "Food, beverages, and household essentials", SortOrder = 13 },
        new() { Name = "Pet Supplies", Slug = "pet-supplies", Description = "Pet food, accessories, and care products", SortOrder = 14 },
        new() { Name = "Watches", Slug = "watches", Description = "Luxury, casual, and smartwatches", SortOrder = 15 },
        new() { Name = "Jewelry & Accessories", Slug = "jewelry-accessories", Description = "Rings, necklaces, earrings, and fashion accessories", SortOrder = 16 },
        new() { Name = "Cameras", Slug = "cameras", Description = "DSLR, mirrorless, and camera accessories", SortOrder = 17 },
        new() { Name = "Musical Instruments", Slug = "musical-instruments", Description = "Instruments, audio gear, and accessories", SortOrder = 18 },
    };

    var now = DateTime.UtcNow;
    foreach (var c in mainCategories)
    {
        c.CreatedAt = now;
        c.UpdatedAt = now;
    }

    db.Categories.AddRange(mainCategories);
    db.SaveChanges();

    var subCategoryData = new Dictionary<string, (string Name, string Slug, int SortOrder, string[] Leaves)[]>
    {
        ["mobile-tablets"] = new[]
        {
            ("Smartphones", "smartphones", 1, new[] { "Android Phones", "iOS iPhones", "Refurbished Phones", "Dual SIM Phones", "5G Phones" }),
            ("Tablets", "tablets", 2, new[] { "iPad", "Android Tablets", "Kids Tablets", "Graphic Tablets" }),
            ("Mobile Accessories", "mobile-accessories", 3, new[] { "Phone Cases", "Screen Protectors", "Chargers & Cables", "Power Banks", "Phone Stands", "Car Mounts", "Bluetooth Headsets" }),
            ("Wearables", "wearables", 4, new[] { "Smartwatches", "Fitness Trackers", "Smart Bands", "Smart Rings" }),
            ("Mobile Parts", "mobile-parts", 5, new[] { "Screens", "Batteries", "Charging Ports", "Camera Modules" }),
        },
        ["computers-laptops"] = new[]
        {
            ("Laptops", "laptops", 1, new[] { "Ultrabooks", "Gaming Laptops", "Business Laptops", "Budget Laptops", "2-in-1 Laptops" }),
            ("Desktop PCs", "desktop-pcs", 2, new[] { "Pre-built Desktops", "Gaming PCs", "All-in-One PCs", "Mini PCs", "Workstations" }),
            ("Computer Components", "computer-components", 3, new[] { "Processors", "Graphics Cards", "RAM", "Motherboards", "Storage Drives", "Power Supplies", "Cooling Fans" }),
            ("Monitors", "monitors", 4, new[] { "Gaming Monitors", "Professional Monitors", "Portable Monitors", "Ultrawide Monitors" }),
            ("Peripherals", "peripherals", 5, new[] { "Keyboards", "Mice", "Headsets", "Webcams", "Speakers", "USB Hubs" }),
            ("Networking", "networking", 6, new[] { "Routers", "Modems", "Network Switches", "Wi-Fi Adapters", "Mesh Systems" }),
        },
        ["electronics"] = new[]
        {
            ("Headphones & Earbuds", "headphones-earbuds", 1, new[] { "Wireless Earbuds", "Over-Ear Headphones", "In-Ear Monitors", "Noise Cancelling", "Sports Earphones" }),
            ("Portable Speakers", "portable-speakers", 2, new[] { "Bluetooth Speakers", "Smart Speakers", "Waterproof Speakers", "Party Speakers" }),
            ("Gaming Consoles", "gaming-consoles", 3, new[] { "PlayStation", "Xbox", "Nintendo Switch", "Handheld Consoles", "Gaming Controllers" }),
            ("Smart Home", "smart-home", 4, new[] { "Smart Lights", "Smart Plugs", "Smart Locks", "Security Cameras", "Video Doorbells" }),
            ("Gadgets", "gadgets", 5, new[] { "Drones", "VR Headsets", "E-Readers", "Digital Voice Recorders", "Projectors" }),
        },
        ["tv-home-appliances"] = new[]
        {
            ("Televisions", "televisions", 1, new[] { "Smart TVs", "4K TVs", "OLED TVs", "QLED TVs", "LED TVs", "Portable Projectors" }),
            ("Refrigerators", "refrigerators", 2, new[] { "Side-by-Side", "French Door", "Top Freezer", "Bottom Freezer", "Mini Fridges" }),
            ("Washing Machines", "washing-machines", 3, new[] { "Front Load", "Top Load", "Washer-Dryer Combo", "Portable Washers" }),
            ("Air Conditioners", "air-conditioners", 4, new[] { "Window AC", "Split AC", "Portable AC", "Inverter AC" }),
            ("Kitchen Appliances", "kitchen-appliances", 5, new[] { "Microwaves", "Air Fryers", "Blenders", "Coffee Makers", "Rice Cookers", "Toasters" }),
            ("Vacuum Cleaners", "vacuum-cleaners", 6, new[] { "Robot Vacuums", "Stick Vacuums", "Upright Vacuums", "Handheld Vacuums" }),
        },
        ["home-living"] = new[]
        {
            ("Furniture", "furniture", 1, new[] { "Sofas", "Beds", "Tables", "Chairs", "Bookshelves", "Wardrobes" }),
            ("Home Decor", "home-decor", 2, new[] { "Wall Art", "Vases", "Candles & Holders", "Clocks", "Artificial Plants" }),
            ("Bedding", "bedding", 3, new[] { "Bed Sheets", "Pillows", "Comforters", "Blankets", "Mattress Protectors" }),
            ("Bath", "bath", 4, new[] { "Towels", "Bath Mats", "Shower Curtains", "Bathroom Accessories" }),
            ("Kitchen & Dining", "kitchen-dining", 5, new[] { "Cookware", "Cutlery", "Dinnerware", "Glassware", "Food Storage" }),
            ("Lighting", "lighting", 6, new[] { "Ceiling Lights", "Floor Lamps", "Table Lamps", "Wall Lights", "Night Lights" }),
            ("Storage & Organization", "storage-organization", 7, new[] { "Storage Bins", "Shoe Racks", "Closet Organizers", "Shelving Units" }),
        },
        ["mens-fashion"] = new[]
        {
            ("Clothing", "mens-clothing", 1, new[] { "T-Shirts", "Shirts", "Pants", "Jeans", "Jackets", "Suits & Blazers", "Shorts", "Hoodies" }),
            ("Shoes", "mens-shoes", 2, new[] { "Sneakers", "Formal Shoes", "Sandals", "Loafers", "Boots", "Sports Shoes" }),
            ("Accessories", "mens-accessories", 3, new[] { "Belts", "Wallets", "Ties & Bowties", "Sunglasses", "Caps & Hats", "Socks" }),
            ("Bags", "mens-bags", 4, new[] { "Backpacks", "Messenger Bags", "Duffel Bags", "Laptop Bags" }),
            ("Innerwear", "mens-innerwear", 5, new[] { "Boxers", "Briefs", "Vests", "Thermal Wear" }),
        },
        ["womens-fashion"] = new[]
        {
            ("Clothing", "womens-clothing", 1, new[] { "Dresses", "Tops", "Blouses", "Pants", "Jeans", "Skirts", "Jackets", "Cardigans" }),
            ("Shoes", "womens-shoes", 2, new[] { "Heels", "Flats", "Sneakers", "Sandals", "Boots", "Wedges" }),
            ("Accessories", "womens-accessories", 3, new[] { "Scarves", "Hair Accessories", "Sunglasses", "Belts", "Gloves", "Hats" }),
            ("Bags", "womens-bags", 4, new[] { "Handbags", "Shoulder Bags", "Tote Bags", "Crossbody Bags", "Clutches" }),
            ("Innerwear", "womens-innerwear", 5, new[] { "Bras", "Panties", "Shapewear", "Lingerie Sets", "Sleepwear" }),
            ("Maternity Wear", "maternity-wear", 6, new[] { "Maternity Dresses", "Maternity Tops", "Maternity Pants", "Nursing Bras" }),
        },
        ["beauty-health"] = new[]
        {
            ("Skincare", "skincare", 1, new[] { "Moisturizers", "Serums", "Cleansers", "Toners", "Sunscreen", "Face Masks", "Eye Care" }),
            ("Makeup", "makeup", 2, new[] { "Foundation", "Lipstick", "Eyeshadow", "Mascara", "Blush", "Concealer", "Makeup Brushes" }),
            ("Hair Care", "hair-care", 3, new[] { "Shampoo", "Conditioner", "Hair Oil", "Hair Styling", "Hair Color", "Hair Treatments" }),
            ("Fragrance", "fragrance", 4, new[] { "Perfumes", "Body Mists", "Colognes", "Deodorants" }),
            ("Personal Care", "personal-care", 5, new[] { "Oral Care", "Body Wash", "Hand Soap", "Shaving", "Menstrual Care" }),
            ("Health Supplements", "health-supplements", 6, new[] { "Vitamins", "Protein Powders", "Herbal Supplements", "Omega & Fish Oil" }),
        },
        ["sports-outdoors"] = new[]
        {
            ("Sports Gear", "sports-gear", 1, new[] { "Football", "Basketball", "Tennis", "Badminton", "Swimming", "Golf" }),
            ("Activewear", "activewear", 2, new[] { "T-Shirts", "Shorts", "Leggings", "Sports Bras", "Track Pants", "Jackets" }),
            ("Camping & Hiking", "camping-hiking", 3, new[] { "Tents", "Sleeping Bags", "Backpacks", "Camping Chairs", "Camping Stoves" }),
            ("Cycling", "cycling", 4, new[] { "Bicycles", "Helmets", "Cycling Jerseys", "Bike Lights", "Bike Locks" }),
            ("Fitness Equipment", "fitness-equipment", 5, new[] { "Dumbbells", "Yoga Mats", "Resistance Bands", "Treadmills", "Exercise Bikes", "Jump Ropes" }),
        },
        ["baby-toys"] = new[]
        {
            ("Baby Care", "baby-care", 1, new[] { "Diapers", "Baby Wipes", "Baby Bath", "Baby Lotion", "Baby Oil", "Baby Powder" }),
            ("Feeding", "baby-feeding", 2, new[] { "Baby Bottles", "Breast Pumps", "Baby Food", "High Chairs", "Sippy Cups" }),
            ("Toys", "toys", 3, new[] { "Action Figures", "Dolls", "Building Blocks", "Board Games", "Remote Control Toys", "Educational Toys" }),
            ("Strollers & Carriers", "strollers-carriers", 4, new[] { "Strollers", "Baby Carriers", "Baby Wraps", "Prams" }),
            ("Nursery", "nursery", 5, new[] { "Cribs", "Changing Tables", "Baby Monitors", "Night Lights", "Mobiles" }),
        },
        ["automotive"] = new[]
        {
            ("Car Accessories", "car-accessories", 1, new[] { "Seat Covers", "Floor Mats", "Steering Wheel Covers", "Phone Holders", "Sunshades" }),
            ("Car Care", "car-care", 2, new[] { "Car Shampoo", "Wax & Polish", "Interior Cleaners", "Air Fresheners", "Microfiber Cloths" }),
            ("Car Electronics", "car-electronics", 3, new[] { "Dash Cams", "GPS Navigators", "Car Chargers", "Bluetooth Kits", "LED Lights" }),
            ("Motorcycle Parts", "motorcycle-parts", 4, new[] { "Helmets", "Gloves", "Jackets", "Bike Covers", "Oil & Lubricants" }),
            ("Interior Accessories", "interior-accessories", 5, new[] { "Car Organizers", "Cushions", "Pedal Covers", "Gear Shift Knobs" }),
        },
        ["books-stationery"] = new[]
        {
            ("Books", "books", 1, new[] { "Fiction", "Non-Fiction", "Self-Help", "Children's Books", "Academic", "Comics & Manga" }),
            ("Office Supplies", "office-supplies", 2, new[] { "Notebooks", "Pens & Pencils", "Sticky Notes", "Binders", "Desk Organizers" }),
            ("Art Supplies", "art-supplies", 3, new[] { "Sketchbooks", "Paints", "Brushes", "Colored Pencils", "Markers", "Canvas" }),
            ("Magazines", "magazines", 4, new[] { "Fashion Magazines", "Tech Magazines", "Business Magazines", "Kids Magazines" }),
            ("Paper Products", "paper-products", 5, new[] { "Printer Paper", "Greeting Cards", "Envelopes", "Wrapping Paper" }),
        },
        ["groceries"] = new[]
        {
            ("Food", "food", 1, new[] { "Rice & Grains", "Cooking Oil", "Spices & Seasonings", "Canned Food", "Pasta & Noodles", "Sauces & Dressings" }),
            ("Beverages", "beverages", 2, new[] { "Coffee", "Tea", "Juices", "Soft Drinks", "Bottled Water", "Energy Drinks" }),
            ("Snacks", "snacks", 3, new[] { "Chips", "Chocolate", "Candy", "Cookies", "Nuts & Seeds", "Dried Fruit" }),
            ("Household Essentials", "household-essentials", 4, new[] { "Cleaning Supplies", "Laundry Detergent", "Dish Soap", "Trash Bags", "Paper Towels" }),
            ("Baking Supplies", "baking-supplies", 5, new[] { "Flour", "Sugar", "Baking Powder", "Yeast", "Baking Mixes" }),
        },
        ["pet-supplies"] = new[]
        {
            ("Pet Food", "pet-food", 1, new[] { "Dog Food", "Cat Food", "Bird Food", "Fish Food", "Pet Treats" }),
            ("Pet Accessories", "pet-accessories", 2, new[] { "Pet Beds", "Collars & Leashes", "Pet Bowls", "Pet Toys", "Pet Clothing" }),
            ("Pet Health", "pet-health", 3, new[] { "Pet Vitamins", "Flea & Tick", "Pet Shampoo", "Pet Grooming Tools" }),
            ("Aquarium", "aquarium", 4, new[] { "Fish Tanks", "Aquarium Filters", "Aquarium Decor", "Fish Food" }),
            ("Pet Carriers & Travel", "pet-carriers-travel", 5, new[] { "Pet Carriers", "Travel Bowls", "Car Seat Covers", "Pet Strollers" }),
        },
        ["watches"] = new[]
        {
            ("Luxury Watches", "luxury-watches", 1, new[] { "Rolex", "Omega", "Tag Heuer", "Breitling", "Cartier" }),
            ("Casual Watches", "casual-watches", 2, new[] { "Fossil", "Casio", "Timex", "Seiko", "Citizen" }),
            ("Smartwatches", "smartwatches", 3, new[] { "Apple Watch", "Samsung Galaxy Watch", "Garmin", "Fitbit", "Amazfit" }),
            ("Watch Accessories", "watch-accessories", 4, new[] { "Watch Bands", "Watch Winders", "Watch Boxes", "Watch Repair Tools" }),
            ("Kids Watches", "kids-watches", 5, new[] { "Digital Kids Watches", "Analog Kids Watches", "Smart Kids Watches" }),
        },
        ["jewelry-accessories"] = new[]
        {
            ("Rings", "rings", 1, new[] { "Engagement Rings", "Wedding Bands", "Fashion Rings", "Statement Rings", "Stacking Rings" }),
            ("Necklaces", "necklaces", 2, new[] { "Pendants", "Chokers", "Chain Necklaces", "Pearl Necklaces", "Gold Necklaces" }),
            ("Earrings", "earrings", 3, new[] { "Stud Earrings", "Hoop Earrings", "Dangle Earrings", "Ear Cuffs", "Gold Earrings" }),
            ("Bracelets", "bracelets", 4, new[] { "Bangles", "Charm Bracelets", "Tennis Bracelets", "Cuffs", "Beaded Bracelets" }),
            ("Sunglasses", "sunglasses", 5, new[] { "Aviator", "Wayfarer", "Cat Eye", "Sport Sunglasses", "Polarized" }),
            ("Hats & Caps", "hats-caps", 6, new[] { "Baseball Caps", "Beanies", "Bucket Hats", "Fedoras", "Sun Hats" }),
        },
        ["cameras"] = new[]
        {
            ("DSLR Cameras", "dslr-cameras", 1, new[] { "Canon DSLR", "Nikon DSLR", "Sony DSLR", "Pentax DSLR" }),
            ("Mirrorless Cameras", "mirrorless-cameras", 2, new[] { "Sony Alpha", "Canon EOS R", "Nikon Z", "Fujifilm X", "Panasonic Lumix" }),
            ("Lenses", "camera-lenses", 3, new[] { "Prime Lenses", "Zoom Lenses", "Telephoto Lenses", "Wide Angle Lenses", "Macro Lenses" }),
            ("Camera Accessories", "camera-accessories", 4, new[] { "Tripods", "Camera Bags", "Memory Cards", "Filters", "Flashes", "Batteries & Chargers" }),
            ("Camcorders", "camcorders", 5, new[] { "Handheld Camcorders", "Action Cameras", "360 Cameras", "Body Cameras" }),
        },
        ["musical-instruments"] = new[]
        {
            ("Guitars", "guitars", 1, new[] { "Acoustic Guitars", "Electric Guitars", "Classical Guitars", "Bass Guitars", "Ukuleles" }),
            ("Keyboards & Pianos", "keyboards-pianos", 2, new[] { "Digital Pianos", "Synthesizers", "MIDI Keyboards", "Portable Keyboards" }),
            ("Drums & Percussion", "drums-percussion", 3, new[] { "Drum Sets", "Electronic Drums", "Cymbals", "Hand Percussion" }),
            ("Audio Equipment", "audio-equipment", 4, new[] { "Studio Monitors", "Headphones", "Audio Interfaces", "Microphones", "Mixers" }),
            ("Wind Instruments", "wind-instruments", 5, new[] { "Flute", "Saxophone", "Trumpet", "Clarinet", "Harmonica" }),
            ("Instrument Accessories", "instrument-accessories", 6, new[] { "Strings", "Picks", "Stands", "Cables", "Tuners", "Cases" }),
        },
    };

    var allSubCategories = new List<Category>();
    var allLeafCategories = new List<Category>();

    foreach (var mainCat in mainCategories)
    {
        if (!subCategoryData.TryGetValue(mainCat.Slug, out var subs))
            continue;

        foreach (var (subName, subSlug, subSort, leaves) in subs)
        {
            var subCat = new Category
            {
                ParentCategoryId = mainCat.CategoryId,
                Name = subName,
                Slug = subSlug,
                Description = $"{subName} - {mainCat.Name}",
                SortOrder = subSort,
                CreatedAt = now,
                UpdatedAt = now,
            };
            allSubCategories.Add(subCat);

            foreach (var leafName in leaves)
            {
                var leafSlug = subSlug + "-" + leafName.ToLower()
                    .Replace(" & ", "-and-")
                    .Replace(" ", "-")
                    .Replace("/", "-")
                    .Replace("'", "")
                    .Replace("(", "")
                    .Replace(")", "");

                var leafCat = new Category
                {
                    ParentCategoryId = null,
                    Name = leafName,
                    Slug = leafSlug,
                    Description = $"{leafName} - {subName}",
                    SortOrder = 0,
                    CreatedAt = now,
                    UpdatedAt = now,
                };
                allLeafCategories.Add(leafCat);
            }
        }
    }

    db.Categories.AddRange(allSubCategories);
    db.SaveChanges();

    var subCatLookup = allSubCategories.ToDictionary(c => c.Slug);
    var leafIndex = 0;
    foreach (var mainCat in mainCategories)
    {
        if (!subCategoryData.TryGetValue(mainCat.Slug, out var subs))
            continue;

        foreach (var (subName, subSlug, _, leaves) in subs)
        {
            if (!subCatLookup.TryGetValue(subSlug, out var subCat))
                continue;

            for (int i = 0; i < leaves.Length; i++)
            {
                var leaf = allLeafCategories[leafIndex];
                leaf.ParentCategoryId = subCat.CategoryId;
                leaf.SortOrder = i + 1;
                leafIndex++;
            }
        }
    }

    db.Categories.AddRange(allLeafCategories);
    db.SaveChanges();
}