using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using RoomsLibrary.Models;
using RoomsLibrary.Repos;

var builder = WebApplication.CreateBuilder(args);
RoomDbContext context = new RoomDbContext();
context.Database.EnsureCreated();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<IRoomRepository, EFRoomRepository>();
builder.Services.AddSwaggerGen(options =>
{

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authentication using Bearer scheme"
    });

    options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement {
        { new OpenApiSecuritySchemeReference("Bearer", doc), new List<string>() }
});
}); builder.Services.AddAuthentication("Bearer").AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateAudience = true,
        ValidateIssuer = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "https://www.snrao.com",
        ValidAudience = "https://www.snrao.com",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("I am Bond, James Bond. I am the best spy in the world. I am invincible."))
    };
});

var app = builder.Build(); 
app.UseSwagger(); 
app.UseSwaggerUI();// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();
app.Run();