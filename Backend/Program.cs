using Backend.Data;
using Backend.Services;
using Backend.Settings;
using Backend.Middleware;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Local dev origin + any extra origins from config (e.g. your deployed Vercel URL)
        var configuredOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        var origins = new[] { "http://localhost:3000" }.Concat(configuredOrigins).ToArray();

        policy.WithOrigins(origins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        // Token/Cookie shহ request pathাতে dিলে eটা লাগে
    });
});
builder.Services.AddEndpointsApiExplorer();

// Swagger Config
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token."
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new List<string>()
        }
    });
});

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings!.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
    };
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");


app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();



using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // 1. Auto Migration Apply
        context.Database.Migrate();

        // 2. Check explicitly by LoginId OR Email
        var admin = context.Users.FirstOrDefault(u => u.LoginId == "ADM-26-0001" || u.Email == "admin@school.com");

        if (admin == null)
        {
            admin = new User
            {
                Id = Guid.NewGuid(),
                LoginId = "ADM-26-0001",
                Fullname = "System Admin",
                Email = "admin@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(admin);
        }
        else
        {
            // Reset existing admin details safely
            admin.LoginId = "ADM-26-0001";
            admin.Email = "admin@school.com";
            admin.Role = "Admin";
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            context.Users.Update(admin);
        }

        // Demo Teacher
        var teacher = context.Users.FirstOrDefault(u => u.LoginId == "TCH-26-0001");
        if (teacher == null)
        {
            teacher = new User
            {
                Id = Guid.NewGuid(),
                LoginId = "TCH-26-0001",
                Fullname = "Demo Teacher",
                Email = "teacher@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
                Role = "Teacher",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(teacher);
            context.SaveChanges(); // save first so ClassId FK exists for the student below
        }

        // Demo Class (student needs one to attach to)
        var demoClass = context.Classes.FirstOrDefault(c => c.Name == "Class 10");
        if (demoClass == null)
        {
            demoClass = new Class { Id = Guid.NewGuid(), Name = "Class 10", Section = "A" };
            context.Classes.Add(demoClass);
            context.SaveChanges();
        }

        // Demo Student
        var student = context.Users.FirstOrDefault(u => u.LoginId == "STU-26-0001");
        if (student == null)
        {
            student = new User
            {
                Id = Guid.NewGuid(),
                LoginId = "STU-26-0001",
                Fullname = "Demo Student",
                Email = "student@school.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = "Student",
                ClassId = demoClass.Id,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(student);
            context.SaveChanges();
        }

        context.SaveChanges();
        logger.LogInformation("✅ Admin account seeded/verified successfully!");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ Seeding Error: {Message}", ex.InnerException?.Message ?? ex.Message);
    }

}



app.Run();