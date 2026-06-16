using ECommerce.Authorization.Handlers;
using ECommerce.Authorization.Requirements;
using ECommerce.Data;
using ECommerce.Model.Enum;
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

app.Run();