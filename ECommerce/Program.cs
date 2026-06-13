using ECommerce.Authorization.Handlers;
using ECommerce.Authorization.Requirements;
using ECommerce.Data;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

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