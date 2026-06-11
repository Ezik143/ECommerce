using ECommerce.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

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

//Registering the repository and service layers for dependency injection
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Domain"]}/";
        options.Audience = builder.Configuration["Auth0:Audience"];
    });

//Defining authorization policies based on user roles and permissions yawa
builder.Services.AddAuthorization(options =>
{
    // Admin-only access
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));

    // Catalog management: Create, update, delete products & categories
    options.AddPolicy("CatalogAccess", policy =>
        policy.RequireRole("Admin", "CatalogManager"));

    // Catalog read: Browse products and categories
    options.AddPolicy("CatalogRead", policy =>
        policy.RequireRole("Admin", "CatalogManager", "Seller", "Customer", "OrderManager", "CustomerSupport"));

    // Product write: Sellers can manage their own products (checked in controller), CatalogManager & Admin can manage all
    options.AddPolicy("ProductWrite", policy =>
        policy.RequireRole("Admin", "CatalogManager", "Seller"));

    // Order fulfillment: View and update order statuses
    options.AddPolicy("OrderFulfillment", policy =>
        policy.RequireRole("Admin", "OrderManager"));

    // Order read: View orders
    options.AddPolicy("OrderRead", policy =>
        policy.RequireRole("Admin", "OrderManager", "CustomerSupport", "Customer", "Seller"));

    // Customer self-service: Manage own cart, addresses, profile
    options.AddPolicy("CustomerSelf", policy =>
        policy.RequireRole("Admin", "Customer"));

    // Seller or admin: Manage own products and view own sales
    options.AddPolicy("SellerOrAdmin", policy =>
        policy.RequireRole("Admin", "Seller"));

    // Customer support: Read-only access to user profiles and orders
    options.AddPolicy("SupportReadOnly", policy =>
        policy.RequireRole("Admin", "CustomerSupport"));

    // Authenticated users (any logged-in user)
    options.AddPolicy("Authenticated", policy =>
        policy.RequireAuthenticatedUser());
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();